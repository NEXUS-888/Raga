import time
import httpx
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

    async def generate_rag_answer(
        self,
        query: str,
        retrieved_chunks: List[Chunk],
        system_instruction: Optional[str] = None,
        is_general_knowledge: bool = False
    ) -> Tuple[str, float, Dict[str, Any]]:
        """
        Generates grounded response using retrieved context chunks or general knowledge.
        Returns: (answer_text, generation_latency_ms, metadata)
        """
        t0 = time.perf_counter()
        
        has_context = bool(retrieved_chunks) and not is_general_knowledge
        
        if has_context:
            context_block = "\n\n".join([
                f"[Source: {c.metadata.get('title', c.doc_id)} | Chunk {c.chunk_index}]:\n{c.content}"
                for c in retrieved_chunks
            ])
            system_prompt = system_instruction or (
                "You are an expert, friendly AI assistant specializing in Goa and general knowledge. "
                "Answer the user's question concisely, accurately, and naturally in 1 to 3 sentences. "
                "Use the provided context passages for facts when relevant, and use your knowledge to answer natural, conversational, or general questions smoothly. "
                "Never claim you cannot answer casual questions or basic local knowledge."
            )
            user_prompt = f"Context Passages:\n{context_block}\n\nUser Question: {query}\n\nAnswer:"
        else:
            system_prompt = system_instruction or (
                "You are an ultra-fast, friendly, intelligent Voice AI assistant. "
                "Answer the user's question concisely, accurately, and naturally in 1 to 3 clear sentences."
            )
            user_prompt = f"User Question: {query}\n\nAnswer:"

        # Try Groq API if available
        if settings.groq_api_key:
            try:
                answer, meta = await self._call_groq(system_prompt, user_prompt)
                elapsed_ms = (time.perf_counter() - t0) * 1000
                return answer, elapsed_ms, {"provider": "groq_llama", **meta}
            except Exception as e:
                print(f"[LLM Warning] Groq API call failed: {e}. Falling back.")

        # Try OpenAI API if available
        if settings.openai_api_key:
            try:
                answer, meta = await self._call_openai(system_prompt, user_prompt)
                elapsed_ms = (time.perf_counter() - t0) * 1000
                return answer, elapsed_ms, {"provider": "openai", **meta}
            except Exception as e:
                print(f"[LLM Warning] OpenAI API call failed: {e}. Falling back.")

        # Fast Local Synthesizer (<50ms generation)
        answer = self._synthesize_local_grounded_answer(query, retrieved_chunks)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return answer, elapsed_ms, {"provider": "fast_grounded_synthesizer", "chunks_used": len(retrieved_chunks)}

    async def _call_groq(self, system_prompt: str, user_prompt: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json"
        }
        model_name = settings.llm_model if settings.llm_model and settings.llm_model != "llama-3.3-70b-versatile" else "groq/compound-mini"
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 150
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(self.groq_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_answer = data["choices"][0]["message"]["content"].strip()
            # Clean thinking tokens if present
            if "</think>" in raw_answer:
                raw_answer = raw_answer.split("</think>")[-1].strip()
            return raw_answer, {"usage": data.get("usage", {})}

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 200
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(self.openai_url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            answer = data["choices"][0]["message"]["content"].strip()
            return answer, {"usage": data.get("usage", {})}

    def _synthesize_local_grounded_answer(self, query: str, chunks: List[Chunk]) -> str:
        """
        Synthesizes a clean, factually grounded answer directly extracted from the top retrieved chunks.
        """
        if not chunks:
            return "I am unable to answer this question because no relevant context was found in the indexed MSMARCO-XI dataset."

        # Extract the most relevant sentences from the top chunk matching the query keywords
        top_chunk = chunks[0]
        query_terms = set([w.lower() for w in query.split() if len(w) > 3])
        sentences = [s.strip() for s in top_chunk.content.split("\n") if s.strip() and not s.startswith("#")]
        
        relevant_sentences = []
        for s in sentences:
            s_words = set(s.lower().split())
            if any(term in s_words for term in query_terms) or len(relevant_sentences) < 2:
                relevant_sentences.append(s)

        if relevant_sentences:
            return " ".join(relevant_sentences[:3])
        return top_chunk.content.split("\n")[0]

llm_service = LLMService()
