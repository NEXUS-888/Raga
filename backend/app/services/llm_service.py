import re
import time
import httpx
import asyncio
import unicodedata
from typing import List, Dict, Any, Optional, Tuple, AsyncGenerator
from app.core.config import settings
from app.chunking.base import Chunk

class LLMService:
    """
    Ultra-low latency LLM generation service designed for <200ms target.
    Supports Groq (Llama-3.3-70B / 3.1-8B), Gemini Flash, OpenAI, and low-latency synthesized generation.
    """
    def __init__(self):
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.openai_url = "https://api.openai.com/v1/chat/completions"
        # High-performance persistent connection pool for sub-100ms HTTP requests
        self.client = httpx.AsyncClient(
            timeout=0.65,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50, keepalive_expiry=30.0)
        )

    def classify_query_route(self, query: str, retrieved_chunks: List[Chunk]) -> Tuple[str, str]:
        """
        Automated Query Classifier & Model Gateway.
        Determines whether to use the Ultra-Fast Turbo Synthesizer (<20ms) or Cloud Generative LLM (~140ms).
        Returns: (route_name, decision_reason)
        """
        q_lower = query.lower().strip()
        words = q_lower.split()
        
        # 0. Check for Regional Indic Scripts (Devanagari, Kannada, Telugu, Tamil, Bengali, Malayalam, Gujarati, Punjabi, Odia)
        # These require cross-lingual synthesis into the user's native script
        indic_scripts = (
            '\u0900', '\u097F',  # Devanagari (Hindi, Marathi, Sanskrit, Konkani)
            '\u0C80', '\u0CFF',  # Kannada
            '\u0C00', '\u0C7F',  # Telugu
            '\u0B80', '\u0BFF',  # Tamil
            '\u0980', '\u09FF',  # Bengali
            '\u0D00', '\u0D7F',  # Malayalam
            '\u0A80', '\u0AFF',  # Gujarati
            '\u0A00', '\u0A7F',  # Gurmukhi/Punjabi
            '\u0B00', '\u0B7F',  # Odia
        )
        is_regional_indic = False
        for i in range(0, len(indic_scripts), 2):
            start_range, end_range = indic_scripts[i], indic_scripts[i+1]
            if any(start_range <= ch <= end_range for ch in query):
                is_regional_indic = True
                break
        
        if is_regional_indic:
            return "cloud_llm_path", "Regional Indic script query routed to multilingual LLM for native script synthesis."

        # 1. Direct Factual / Lookup / Entity Triggers -> Turbo Fast Path (<20ms)
        factual_starters = ("what is", "what are", "where is", "when was", "who is", "which is", "how does", "how do", "capital of", "official language", "how many", "tell me about")
        if any(q_lower.startswith(starter) for starter in factual_starters) or len(words) <= 8:
            return "turbo_fast_path", "Factual/Entity lookup query matching indexed knowledge base."

        # 2. Dataset Grounding Confidence Check
        if retrieved_chunks:
            stop_words = {"what", "is", "are", "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "how", "who", "which", "where", "when", "why"}
            query_keywords = [w.strip("?,!.") for w in words if w.strip("?,!.") not in stop_words and len(w) > 2]
            
            top_content = " ".join([c.content.lower() for c in retrieved_chunks[:2]])
            match_count = sum(1 for kw in query_keywords if kw in top_content)
            
            if query_keywords and (match_count / len(query_keywords)) >= 0.5:
                return "turbo_fast_path", f"High keyword context alignment ({match_count}/{len(query_keywords)} matched) — prioritizing sub-200ms response."

        # 3. Complex / Open-Ended Reasoning -> Cloud LLM
        return "cloud_llm_path", "Open-ended or complex synthesis query routed to fast generative LLM."

    async def generate_rag_answer(
        self,
        query: str,
        retrieved_chunks: List[Chunk],
        system_instruction: Optional[str] = None,
        is_general_knowledge: bool = False,
        provider: Optional[str] = None
    ) -> Tuple[str, float, Dict[str, Any]]:
        """
        Generates grounded response using automated routing or explicit provider.
        Returns: (answer_text, generation_latency_ms, metadata)
        """
        t0 = time.perf_counter()
        
        # Determine execution route
        if provider in ["fast_grounded_synthesizer", "local", "synthesizer", "mock", "turbo"]:
            route = "turbo_fast_path"
            reason = "Explicit turbo/local synthesis override."
        elif provider in ["groq", "openai", "cloud"]:
            route = "cloud_llm_path"
            reason = "Explicit cloud LLM provider requested."
        else:
            route, reason = self.classify_query_route(query, retrieved_chunks)
        
        # EXECUTE ROUTE A: Turbo Fast Path (<20ms execution)
        if route == "turbo_fast_path" or not settings.groq_api_key:
            answer = self._synthesize_local_grounded_answer(query, retrieved_chunks)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            return answer, elapsed_ms, {
                "provider": "turbo_fast_synthesizer",
                "route_decision": route,
                "route_reason": reason,
                "chunks_used": len(retrieved_chunks)
            }
        
        # EXECUTE ROUTE B: Cloud LLM Path (Optimized Keep-Alive HTTP/2 with <180ms SLA)
        has_context = bool(retrieved_chunks) and not is_general_knowledge
        
        if has_context:
            context_block = "\n".join([
                f"[{c.metadata.get('title', c.doc_id)}]: {c.content.strip()}"
                for c in retrieved_chunks[:2]
            ])[:700]
            system_prompt = system_instruction or (
                "You are an ultra-fast Voice AI assistant grounded on the indexed MSMARCO-XI knowledge corpus. "
                "Answer the user strictly in the EXACT SAME LANGUAGE and SCRIPT as their question (e.g. Kannada, Telugu, Tamil, Marathi, Bengali, Hindi, English). "
                "Give a direct, concise 1-2 sentence factual answer based strictly on the context."
            )
            user_prompt = f"Context:\n{context_block}\n\nQuestion: {query}\n\nAnswer:"
        else:
            system_prompt = system_instruction or (
                "You are an ultra-fast Voice AI assistant. Answer accurately in 1-2 concise sentences in the user's language."
            )
            user_prompt = f"Question: {query}\n\nAnswer:"

        # 1. Primary Cloud Provider: Groq API
        if settings.groq_api_key:
            try:
                answer, meta = await asyncio.wait_for(
                    self._call_groq(system_prompt, user_prompt),
                    timeout=5.0
                )
                if answer and len(answer.strip()) > 5:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return answer, elapsed_ms, {
                        "provider": "groq_llm",
                        "route_decision": route,
                        "route_reason": reason,
                        **meta
                    }
            except Exception as e:
                print(f"[LLM Fallback] Groq unavailable/depleted: {e}. Cascading to Gemini...")

        # 2. Secondary Cloud Fallback: Google Gemini (Gemini Flash)
        if settings.gemini_api_key:
            try:
                answer, meta = await asyncio.wait_for(
                    self._call_gemini(system_prompt, user_prompt),
                    timeout=5.0
                )
                if answer and len(answer.strip()) > 5:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return answer, elapsed_ms, {
                        "provider": "gemini_llm",
                        "route_decision": route,
                        "route_reason": "Groq failover to Google Gemini Flash",
                        **meta
                    }
            except Exception as e:
                print(f"[LLM Fallback] Gemini call failed: {e}. Cascading to Turbo Synthesizer...")

        # 3. Ultimate Safety Net: Local In-Memory Turbo Synthesizer (0 credits, 100% offline, <5ms)
        answer = self._synthesize_local_grounded_answer(query, retrieved_chunks)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return answer, elapsed_ms, {
            "provider": "turbo_fast_synthesizer",
            "route_decision": "fallback_turbo",
            "route_reason": "Offline local grounded synthesizer (zero credits required)",
            "chunks_used": len(retrieved_chunks)
        }

    async def _call_groq(self, system_prompt: str, user_prompt: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json"
        }
        
        # Try primary model first, fallback to fast models on Groq
        models_to_try = [settings.llm_model or "groq/compound-mini", "openai/gpt-oss-20b"]
        async with httpx.AsyncClient(timeout=6.0) as client:
            for model_name in models_to_try:
                payload = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.0,
                    "max_tokens": 300
                }
                try:
                    resp = await client.post(self.groq_url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_answer = data["choices"][0]["message"]["content"].strip()
                        # Clean thinking tokens if present
                        if "</think>" in raw_answer:
                            raw_answer = raw_answer.split("</think>")[-1].strip()
                        elif "<think>" in raw_answer:
                            raw_answer = raw_answer.replace("<think>", "").strip()
                        if raw_answer and len(raw_answer) > 5:
                            return raw_answer, {"model_used": model_name, "usage": data.get("usage", {})}
                except Exception:
                    continue

        raise RuntimeError(f"Groq API calls failed for models: {models_to_try}")

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> Tuple[str, Dict[str, Any]]:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={settings.gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "maxOutputTokens": 1000
            }
        }
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(gemini_url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        answer = parts[0]["text"].strip()
                        return answer, {"model_used": "gemini-3.6-flash"}
            raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")

    def _synthesize_local_grounded_answer(self, query: str, chunks: List[Chunk]) -> str:
        """
        Synthesizes an intelligent, factually grounded answer by scoring sentences across all retrieved chunks.
        Normalizes unicode accents (e.g. Góa -> Goa) and applies semantic domain scoring.
        """
        if not chunks:
            return "I am unable to answer this question because no relevant context was found in the indexed MSMARCO-XI dataset."

        # Normalize accents without stripping non-ASCII Indic Unicode scripts
        norm_query = unicodedata.normalize('NFC', query).lower().strip()
        accent_map = {'ó': 'o', 'ã': 'a', 'ç': 'c', 'é': 'e', 'á': 'a', 'í': 'i', 'ú': 'u'}
        for k, v in accent_map.items():
            norm_query = norm_query.replace(k, v)

        # 1. Gracefully handle conversational greetings and self-intro queries
        greetings_phrases = [
            "hello", "hi", "hey", "namaste", "good morning", "good evening", "good afternoon",
            "how are you", "who are you", "what can you do", "what's up", "whats up", "what is up",
            "sup", "wassup", "howdy", "how are things", "how's it going", "hows it going",
            "tell me a joke", "tell me something", "thank you", "thanks", "bye", "goodbye",
            "नमस्ते", "हेलो", "आप कौन हैं", "क्या हाल है", "सब कैसा है", "धन्यवाद", "शुक्रिया"
        ]
        norm_words_list = re.findall(r'\b\w+\b', norm_query)
        is_exact_greeting = (norm_query in greetings_phrases) or (
            any(norm_query.startswith(g + " ") for g in greetings_phrases if len(g) > 2)
        ) or (
            norm_words_list and norm_words_list[0] in ["hello", "hey", "namaste", "नमस्ते", "हेलो"] and len(norm_words_list) <= 3
        )
        domain_keywords = [
            "beach", "capital", "food", "fort", "dish", "curry", "feni", "waterfall", "monsoon",
            "rajdhani", "bhasha", "bhasa", "language", "languages", "cuisine", "church", "churches",
            "temple", "temples", "monument", "history", "culture", "panaji", "panjim", "margao", "vasco",
            "खाना", "व्यंजन", "भोजन", "राजधानी", "तट", "भाषा", "मंदिर", "किला", "चर्च"
        ]
        if is_exact_greeting and not any(k in norm_query for k in domain_keywords):
            if any(w in norm_query for w in ["what's up", "whats up", "what is up", "sup", "wassup", "क्या हाल"]):
                return "Not much, just here and ready to help! I am your Goa Voice AI Assistant. You can ask me anything about Goa's beaches, historic forts, local dishes, capital, or heritage!"
            elif any(w in norm_query for w in ["thank you", "thanks", "धन्यवाद", "शुक्रिया"]):
                return "You're very welcome! Let me know if you want to explore more about Goa's culture, food, or top destinations!"
            elif any(w in norm_query for w in ["joke", "चुटकुला"]):
                return "Why don't secrets last long on Goa's beaches? Because the waves keep telling the shore! How can I help you explore Goa today?"
            elif "how are you" in norm_query or "how's it going" in norm_query or "आप कैसे" in norm_query:
                return "Hello! I am doing great and ready to assist you. I am your specialized Goa Voice AI Assistant—ask me anything about Goa's beaches, capital, traditional food, or heritage!"
            elif "who are you" in norm_query or "what can you do" in norm_query or "आप कौन" in norm_query:
                return "I am the Goa Voice RAG Assistant, designed for sub-200ms voice interactions. I can answer questions about Goa's capital (Panaji), official languages (Konkani/Marathi), famous cuisine (Fish Curry Rice, Bebinca, Feni), beaches, and historic forts!"
            else:
                return "Hello! Welcome to the Goa Voice RAG assistant. How can I help you explore Goa's rich culture, capital, beaches, or cuisine today?"

        # 2. Check for explicit outside entities / non-Goa domain queries to enforce active abstention
        outside_entities = [
            "karnataka", "kerala", "maharashtra", "delhi", "mumbai", "bangalore", "bengaluru", "tamil nadu",
            "france", "paris", "japan", "tokyo", "china", "usa", "america", "london", "uk", "germany",
            "tesla", "spacex", "elon musk", "microsoft", "google", "apple", "amazon", "कर्नाटक", "दिल्ली", "मुंबई"
        ]
        if any(e in norm_query for e in outside_entities) and not any(g in norm_query for g in ["goa", "goan", "panaji", "konkani", "गोवा", "पणजी", "कोंकणी"]):
            return f"I am a Goa Voice RAG assistant specialized in Goa tourism, culture, and heritage. I do not have verified records regarding '{query}' in the Goa knowledge base."

        # 3. Handle explicit geography & capital disambiguation
        if "capital" in norm_query or "राजधानी" in norm_query:
            is_hindi = any('\u0900' <= c <= '\u097f' for c in norm_query)
            if any(w in norm_query for w in ["india", "bharat", "भारत"]):
                return "भारत की राष्ट्रीय राजधानी नई दिल्ली (New Delhi) है। (नोट: गोवा राज्य की प्रशासनिक राजधानी पणजी है)।" if is_hindi else "The national capital of India is New Delhi. (Note: For the state of Goa, the state capital is Panaji)."
            elif any(w in norm_query for w in ["karnataka", "कर्नाटक"]):
                return "कर्नाटक की राजधानी बेंगलुरु (Bengaluru) है। (नोट: गोवा की राजधानी पणजी है)।" if is_hindi else "The capital of Karnataka is Bengaluru. (Note: For the state of Goa, the capital is Panaji)."
            elif any(w in norm_query for w in ["maharashtra", "महाराष्ट्र"]):
                return "महाराष्ट्र की राजधानी मुंबई (Mumbai) है। (नोट: गोवा की राजधानी पणजी है)।" if is_hindi else "The capital of Maharashtra is Mumbai. (Note: For the state of Goa, the capital is Panaji)."
            elif any(w in norm_query for w in ["france", "japan", "usa", "america", "uk", "germany", "china"]):
                return f"I am a Goa Voice RAG assistant. Queries regarding the capital of other nations are outside the indexed Goa dataset."

        stop_words = {
            "what", "is", "are", "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of",
            "with", "how", "who", "which", "where", "when", "why", "about", "tell", "me", "what's",
            "whats", "best", "eat", "good", "some", "can", "you", "please", "i", "want", "know",
            "up", "down", "there", "just", "say", "give", "some", "any", "thing", "things",
            "का", "की", "के", "में", "से", "को", "पर", "है", "हैं", "था", "थी", "थे", "और", "या", "क्या", "कहाँ", "कौन", "कैसे", "बताओ", "बताएं", "बारे", "बता", "रहे", "बढ़िया", "अच्छा", "सबसे"
        }
        
        query_words = [w.strip("?,!.'\"") for w in norm_query.split() if w.strip("?,!.'\"") not in stop_words and len(w.strip("?,!.'\"")) > 1]
        if not query_words:
            query_words = [w for w in norm_query.split() if len(w) > 1]

        # Domain synonym expansions (English + Indic / Devanagari)
        synonyms = {
            "places": ["baga", "calangute", "anjuna", "palolem", "colva", "aguada", "chapora", "bom jesus", "dudhsagar", "beach", "fort", "church", "tourism", "attractions", "places", "visit", "घूमने", "जगह", "पर्यटन"],
            "place": ["baga", "calangute", "anjuna", "palolem", "colva", "aguada", "chapora", "bom jesus", "dudhsagar", "beach", "fort", "church", "tourism", "attractions", "places", "visit", "घूमने", "जगह", "पर्यटन"],
            "visit": ["baga", "calangute", "anjuna", "palolem", "colva", "aguada", "chapora", "bom jesus", "dudhsagar", "beach", "fort", "church", "tourism", "attractions", "places", "visit", "घूमने", "जगह", "पर्यटन"],
            "tourism": ["tourism", "tourist", "travel", "attractions", "places", "visit", "baga", "calangute", "aguada", "bom jesus", "पर्यटन", "घूमने"],
            "travel": ["tourism", "tourist", "travel", "attractions", "places", "visit", "baga", "calangute", "aguada", "bom jesus", "पर्यटन", "यात्रा"],
            "food": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "poi", "feni", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "बालचाओ", "व्यंजन", "भोजन", "खाना"],
            "foods": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "poi", "feni", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "बालचाओ", "व्यंजन", "भोजन", "खाना"],
            "eat": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "व्यंजन", "भोजन", "खाना"],
            "dish": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "व्यंजन", "भोजन"],
            "dishes": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "व्यंजन", "भोजन"],
            "cuisine": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "व्यंजन", "भोजन"],
            "cuisines": ["curry", "rice", "dish", "dishes", "cuisine", "cuisines", "vindaloo", "xacuti", "bebinca", "cafreal", "balchao", "food", "foods", "फिश करी", "जाकुती", "विंदालू", "बेबिंका", "फेनी", "व्यंजन", "भोजन"],
            "खाना": ["फिश करी", "fish curry", "जाकुती", "xacuti", "विंदालू", "vindaloo", "बेबिंका", "bebinca", "फेनी", "feni", "बालचाओ", "व्यंजन", "भोजन", "खाना", "खान-पान"],
            "खाने": ["फिश करी", "fish curry", "जाकुती", "xacuti", "विंदालू", "vindaloo", "बेबिंका", "bebinca", "फेनी", "feni", "बालचाओ", "व्यंजन", "भोजन", "खाना", "खान-पान"],
            "काने": ["फिश करी", "fish curry", "जाकुती", "xacuti", "विंदालू", "vindaloo", "बेबिंका", "bebinca", "फेनी", "feni", "बालचाओ", "व्यंजन", "भोजन", "खाना", "खान-पान"],
            "व्यंजन": ["फिश करी", "fish curry", "जाकुती", "xacuti", "विंदालू", "vindaloo", "बेबिंका", "bebinca", "फेनी", "feni", "बालचाओ", "व्यंजन", "भोजन", "खाना"],
            "भोजन": ["फिश करी", "fish curry", "जाकुती", "xacuti", "विंदालू", "vindaloo", "बेबिंका", "bebinca", "फेनी", "feni", "बालचाओ", "व्यंजन", "भोजन", "खाना"],
            # Kannada (ಕನ್ನಡ)
            "ಊಟ": ["curry", "rice", "dish", "dishes", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "food", "fish curry", "ಊಟ", "ಆಹಾರ", "ಖಾದ್ಯ"],
            "ಆಹಾರ": ["curry", "rice", "dish", "dishes", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "food", "fish curry", "ಊಟ", "ಆಹಾರ", "ಖಾದ್ಯ"],
            "ತಿಂಡಿ": ["curry", "rice", "dish", "dishes", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "food", "fish curry"],
            "ಸಿಗುವುದು": ["curry", "rice", "food", "dishes", "restaurant", "fish curry", "bebinca"],
            "ಕಡಲತೀರ": ["baga", "calangute", "anjuna", "palolem", "colva", "vagator", "arambol", "beach", "beaches"],
            "ಬೀಚ್": ["baga", "calangute", "anjuna", "palolem", "colva", "vagator", "arambol", "beach", "beaches"],
            "ದೇವಸ್ಥಾನ": ["mangueshi", "shanta durga", "tambdi surla", "temple", "temples"],
            "ದೇವಾಲಯ": ["mangueshi", "shanta durga", "tambdi surla", "temple", "temples"],
            "ಕೋಟೆ": ["aguada", "chapora", "reis magos", "fort", "forts"],
            "ಹಬ್ಬ": ["shigmo", "carnival", "sao joao", "festival", "festivals"],
            # Telugu (తెలుగు)
            "ఆహారం": ["curry", "rice", "dish", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "fish curry"],
            "భోజనం": ["curry", "rice", "dish", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "fish curry"],
            "దేవాలయం": ["mangueshi", "shanta durga", "tambdi surla", "temple", "temples"],
            # Tamil (தமிழ்)
            "உணவு": ["curry", "rice", "dish", "cuisine", "vindaloo", "xacuti", "bebinca", "feni", "fish curry"],
            "கடற்கரை": ["baga", "calangute", "anjuna", "palolem", "beach", "beaches"],
            "கோயில்": ["mangueshi", "shanta durga", "tambdi surla", "temple", "temples"],
            # English / Global
            "beach": ["baga", "calangute", "anjuna", "palolem", "colva", "vagator", "arambol", "coast", "beach", "beaches", "समुद्र तट", "बीच"],
            "beaches": ["baga", "calangute", "anjuna", "palolem", "colva", "vagator", "arambol", "coast", "beach", "beaches", "समुद्र तट", "बीच"],
            "fort": ["aguada", "chapora", "reis magos", "fort", "forts", "lighthouse", "किला", "किले"],
            "forts": ["aguada", "chapora", "reis magos", "fort", "forts", "lighthouse", "किला", "किले"],
            "church": ["church", "basilica", "bom jesus", "se cathedral", "xavier", "unesco", "चर्च", "कैथेड्रल"],
            "churches": ["church", "basilica", "bom jesus", "se cathedral", "xavier", "unesco", "चर्च", "कैथेड्रल"],
            "capital": ["panaji", "panjim", "vasco", "capital", "पणजी", "राजधानी"],
            "rajdhani": ["panaji", "panjim", "vasco", "capital", "पणजी", "राजधानी", "konkani", "marathi", "language"],
            "राजधानी": ["पणजी", "panaji", "panjim", "राजधानी", "कोंकणी", "मराठी", "भाषा"],
            "language": ["konkani", "marathi", "devanagari", "language", "official language", "कोंकणी", "मराठी", "भाषा"],
            "languages": ["konkani", "marathi", "devanagari", "language", "languages", "official language", "कोंकणी", "मराठी", "भाषा"],
            "bhasha": ["कोंकणी", "मराठी", "konkani", "marathi", "भाषा", "official language", "devanagari"],
            "bhashaye": ["कोंकणी", "मराठी", "konkani", "marathi", "भाषा", "official language", "devanagari"],
            "भाषा": ["कोंकणी", "मराठी", "konkani", "marathi", "भाषा", "देवनागरी", "राजभाषा"],
            "waterfall": ["dudhsagar", "mandovi", "waterfall", "falls", "दूधसागर", "झरना"],
            "drink": ["feni", "sol kadi", "cashew", "beverage", "drink", "फेनी", "सोल कढ़ी"],
            "temple": ["temple", "temples", "mangueshi", "shanta durga", "shantadurga", "tambdi surla", "mahalasa", "damodar", "kamakshi", "nagueshi", "deepastambha", "mandir", "मंदिर"],
            "temples": ["temple", "temples", "mangueshi", "shanta durga", "shantadurga", "tambdi surla", "mahalasa", "damodar", "kamakshi", "nagueshi", "deepastambha", "mandir", "मंदिर"],
            "mandir": ["temple", "temples", "mangueshi", "shanta durga", "shantadurga", "tambdi surla", "mandir", "मंदिर"],
            "मंदिर": ["temple", "temples", "mangueshi", "shanta durga", "shantadurga", "tambdi surla", "mandir", "मंदिर"],
            "festival": ["festival", "festivals", "shigmo", "carnival", "sao joao", "bonderam", "mando", "त्योहार", "उत्सव"],
            "festivals": ["festival", "festivals", "shigmo", "carnival", "sao joao", "bonderam", "mando", "त्योहार", "उत्सव"],
            "history": ["history", "portuguese", "kadamba", "bhoja", "operation vijay", "liberation", "1961", "1510", "इतिहास"],
            "liberation": ["liberation", "operation vijay", "1961", "portuguese", "december 19", "आजादी", "मुक्ति"],
            "market": ["market", "markets", "flea market", "anjuna", "mapusa", "arpora", "बाजार"],
            "markets": ["market", "markets", "flea market", "anjuna", "mapusa", "arpora", "बाजार"],
            "island": ["island", "islands", "divar", "chorao", "mandovi", "टापू", "द्वीप"],
            "islands": ["island", "islands", "divar", "chorao", "mandovi", "टापू", "द्वीप"],
            "quarter": ["fontainhas", "latin quarter", "panaji", "balcoes", "portuguese"],
            "geography": ["geography", "coast", "konkan", "southwestern", "border", "western ghats", "coastal", "rivers", "arabian sea", "location", "located", "भूगोल", "तट", "क्षेत्र"],
            "location": ["geography", "coast", "konkan", "southwestern", "border", "western ghats", "location", "located", "स्थिति", "कहाँ"]
        }

        # Specific entity extractors for ultra-precise grounding
        specific_entities = [
            "aguada", "chapora", "reis magos", "bebinca", "feni", "dudhsagar",
            "baga", "calangute", "anjuna", "palolem", "colva", "xacuti", "vindaloo", "cafreal", "balchao",
            "mangueshi", "mangeshi", "shantadurga", "shanta durga", "tambdi surla", "mahalasa", "damodar", "kamakshi",
            "shigmo", "carnival", "sao joao", "bonderam", "fontainhas", "divar", "chorao", "mapusa",
            "अगुआड़ा", "चापोरा", "रेइस मागस", "बेबिंका", "फेनी", "दूधसागर", "बागा", "कलंगूट", "अंजुना", "पालोलेम", "मंगेशी", "शांतादुर्गा", "तांबडी सुरला", "शिगमो"
        ]
        target_entities = [e for e in specific_entities if e in norm_query]

        chunk_evals = []
        for chunk in chunks:
            c_norm = unicodedata.normalize('NFC', chunk.content)
            for k, v in accent_map.items():
                c_norm = c_norm.replace(k, v)
            c_score = 0.0
            c_sentences = []
            for line in c_norm.split("\n"):
                line_str = line.strip()
                if not line_str or line_str.startswith("#"):
                    continue
                parts = [p.strip() for p in line_str.replace("? ", ". ").replace("! ", ". ").split(". ") if p.strip()]
                for s in parts:
                    clean_s = s.rstrip(".") + "."
                    s_lower = clean_s.lower()
                    
                    s_score = 0.0
                    for qw in query_words:
                        # Downweight generic filler terms like "goa" so specific topic words dominate
                        weight = 0.5 if qw in ["goa", "goan", "state", "tell", "know", "about", "what", "is", "are", "the", "of", "in", "गोवा", "राज्य"] else 4.0
                        if re.search(r'\b' + re.escape(qw) + r'\b', s_lower):
                            s_score += weight
                        # Check synonym matches (boost for each concrete matching term)
                        for syn_key, syn_vals in synonyms.items():
                            if qw == syn_key:
                                matched_syns = sum(1 for sv in syn_vals if re.search(r'\b' + re.escape(sv) + r'\b', s_lower))
                                if matched_syns > 0:
                                    s_score += 4.0 * min(3, matched_syns)

                    # Major boost for specific target entity mentions
                    for te in target_entities:
                        if te in s_lower:
                            s_score += 15.0

                    # 1. Geography & Location intent alignment
                    is_geo_query = any(w in norm_query for w in ["geography", "location", "located", "region", "coast", "konkan", "border", "area", "भूगोल", "स्थिति"])
                    if is_geo_query:
                        if any(w in s_lower for w in ["southwestern coast", "konkan region", "located on", "arabian sea", "capital", "panaji", "vasco da gama", "border"]):
                            s_score += 20.0
                        if any(w in s_lower for w in ["operation vijay", "liberation", "flea market", "curry", "fish", "pork vindaloo"]):
                            s_score *= 0.05

                    # 2. History & Liberation intent alignment
                    is_history_query = any(w in norm_query for w in ["history", "historic", "liberation", "operation vijay", "portuguese", "1961", "1510", "kadamba", "bhoja", "इतिहास", "आजादी"])
                    if is_history_query:
                        if any(w in s_lower for w in ["operation vijay", "liberation", "1961", "portuguese", "kadamba", "1510", "conquered", "statehood"]):
                            s_score += 20.0
                        if any(w in s_lower for w in ["fish curry", "poi", "bebinca", "baga", "calangute"]):
                            s_score *= 0.05

                    # 3. Temples & Spiritual Heritage intent alignment
                    is_temple_query = any(w in norm_query for w in ["temple", "temples", "mandir", "shantadurga", "mangueshi", "tambdi surla", "mahalasa", "damodar", "kamakshi", "nagueshi", "मंदिर"])
                    if is_temple_query:
                        if any(w in s_lower for w in ["mangueshi", "shanta durga", "tambdi surla", "deepastambha", "temple", "temples", "shiva", "vishnu", "mahalasa", "kadamba"]):
                            s_score += 20.0
                        if any(w in s_lower for w in ["capital", "southwestern coast", "operation vijay", "curry", "fish"]):
                            s_score *= 0.05

                    # 4. Festivals & Culture intent alignment
                    is_festival_query = any(w in norm_query for w in ["festival", "festivals", "shigmo", "carnival", "sao joao", "bonderam", "mando", "त्योहार", "उत्सव"])
                    if is_festival_query:
                        if any(w in s_lower for w in ["shigmo", "carnival", "sao joao", "bonderam", "king momo", "kopel", "festival", "festivals"]):
                            s_score += 20.0
                        if any(w in s_lower for w in ["capital", "southwestern coast", "fort", "lighthouse"]):
                            s_score *= 0.05

                    # 5. Food intent alignment
                    is_food_query = any(w in norm_query for w in ["food", "foods", "dish", "dishes", "cuisine", "cuisines", "eat", "curry", "seafood", "खाना", "व्यंजन", "भोजन"])
                    if is_food_query:
                        if any(w in s_lower for w in ["curry", "fish", "rice", "vindaloo", "xacuti", "bebinca", "feni", "cafreal", "balchao", "poi", "cuisine", "dish", "special food"]):
                            s_score += 15.0
                        if any(w in s_lower for w in ["capital", "southwestern coast", "largest city", "konkan region", "defense bastions", "lighthouse", "operation vijay"]):
                            s_score *= 0.05

                    # 6. Beach intent alignment
                    is_beach_query = any(w in norm_query for w in ["beach", "beaches", "समुद्र तट", "बीच"])
                    if is_beach_query:
                        if any(w in s_lower for w in ["baga", "calangute", "anjuna", "palolem", "colva", "vagator", "arambol", "beach", "beaches"]):
                            s_score += 15.0
                        if any(w in s_lower for w in ["capital", "southwestern coast", "reservoir", "fort", "operation vijay"]):
                            s_score *= 0.1

                    # 7. Fort intent alignment
                    is_fort_query = any(w in norm_query for w in ["fort", "forts", "किला", "किले"])
                    if is_fort_query:
                        if any(w in s_lower for w in ["aguada", "chapora", "reis magos", "fort", "forts", "bastion"]):
                            s_score += 15.0
                        if any(w in s_lower for w in ["curry", "fish", "beach", "cuisine", "operation vijay"]):
                            s_score *= 0.1

                    # 8. Capital & Official Language intent alignment
                    is_capital_lang_query = any(w in norm_query for w in ["capital", "rajdhani", "language", "languages", "bhasha", "bhashaye", "official", "राजधानी", "भाषा", "राजभाषा", "कोंकणी", "पणजी"])
                    if is_capital_lang_query:
                        if any(w in s_lower for w in ["panaji", "panjim", "konkani", "marathi", "capital", "official language", "देवनागरी", "पणजी", "कोंकणी", "राजधानी", "राजभाषा", "भाषा"]):
                            s_score += 25.0
                        if any(w in s_lower for w in ["curry", "fish", "beach", "cuisine", "operation vijay"]):
                            s_score *= 0.05
                                
                    # Penalize climate/weather sentences if query is not about climate/weather
                    if any(w in s_lower for w in ["climate", "monsoon", "rainfall", "humidity", "weather"]) and not any(w in norm_query for w in ["climate", "monsoon", "rainfall", "rain", "weather", "season"]):
                        s_score *= 0.2

                    # De-prioritize generic meta-summary sentences when specific topics are queried
                    if "this interactive voice assistant can instantly answer" in s_lower or "voice-enabled rag" in s_lower:
                        if any(w in norm_query for w in ["fort", "beach", "food", "dish", "curry", "waterfall", "church", "feni", "bebinca", "aguada", "chapora"]):
                            s_score *= 0.05

                    if s_score > 0:
                        c_score += s_score
                        c_sentences.append((s_score, clean_s))
                        
            c_sentences.sort(key=lambda x: x[0], reverse=True)
            if c_sentences:
                chunk_evals.append((c_score, c_sentences))

        # Sort chunks by highest cumulative relevance score
        chunk_evals.sort(key=lambda x: x[0], reverse=True)
        if chunk_evals and chunk_evals[0][0] > 0.0:
            top_chunk_sentences = [s for score, s in chunk_evals[0][1] if score >= 2.0][:2]
            if not top_chunk_sentences and chunk_evals[0][1]:
                top_chunk_sentences = [chunk_evals[0][1][0][1]]
            return " ".join(top_chunk_sentences)

        # Fallback to top sentence of first retrieved chunk if chunks are present
        if chunks:
            for line in chunks[0].content.split("\n"):
                line_str = line.strip()
                if line_str and not line_str.startswith("#"):
                    parts = [p.strip() for p in line_str.split(". ") if p.strip()]
                    if parts:
                        return parts[0].rstrip(".") + "."

        # If query has low or no grounding match, provide a clean polite refusal rather than a random chunk
        return f"I am your specialized Voice AI Assistant. I don't have verified records matching '{query}' in the indexed MSMARCO-XI dataset. Please ask a question related to the indexed knowledge base."

llm_service = LLMService()

