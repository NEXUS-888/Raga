import re
from typing import List, Optional
from app.guardrails.safety_guard import GuardrailVerdict

class TopicGuard:
    """
    Classifies user queries to verify domain alignment with the indexed MSMARCO-XI dataset.
    Covers Computer Science & AI, Health & Biology, Climate & Geography, and Regional Heritage.
    Detects off-topic queries and triggers structured active abstention.
    """
    def __init__(self):
        # Universal MSMARCO-XI domain knowledge categories
        self.msmarco_domain_keywords = {
            # 1. Computer Science, AI, Search & Voice RAG
            'neural', 'retrieval', 'vector', 'search', 'hnsw', 'bm25', 'dense', 'sparse', 'rrf',
            'reciprocal rank fusion', 'embedding', 'embeddings', 'rag', 'latency', 'ttft', 'transformer',
            'speculative decoding', 'grounding', 'hallucination', 'abstention',
            'sarvam', 'saaras', 'asr', 'speech', 'speech-to-text', 'elevenlabs', 'voice',
            
            # 2. Biology & Plant Physiology
            'photosynthesis', 'plant', 'plants', 'chlorophyll', 'chloroplast', 'thylakoid', 'atp', 'nadph',
            'calvin cycle', 'carbon fixation', 'glucose', 'oxygen', 'sunlight', 'algae', 'cyanobacteria',
            
            # 3. Health & Medicine
            'vitamin', 'vitamin d', 'deficiency', 'calcium', 'bones', 'bone pain', 'teeth', 'uvb',
            'radiation', 'muscle weakness', 'fatigue', 'wound healing', 'osteomalacia', 'rickets', 'symptoms',
            
            # 4. Climate, Meteorology & Indian Monsoon
            'monsoon', 'climate', 'weather', 'rainfall', 'kerala', 'kerala coast', 'arabian sea',
            'bay of bengal', 'agriculture', 'kharif', 'crops', 'paddy', 'sugarcane', 'cotton',
            'मानसून', 'वर्षा', 'जलवायु', 'कृषि', 'फसलें',
            
            # 5. Geography, Administration, Culture & Heritage (Goa & Western Ghats)
            'goa', 'goan', 'panaji', 'panjim', 'vasco', 'vasco da gama', 'margao', 'konkani', 'marathi',
            'baga', 'calangute', 'anjuna', 'palolem', 'colva', 'vagator', 'arambol',
            'aguada', 'chapora', 'reis magos', 'bom jesus', 'cathedral', 'dudhsagar', 'mandovi', 'zuari',
            'bebinca', 'feni', 'xacuti', 'vindaloo', 'balchao', 'cafreal', 'poi', 'sol kadi',
            'shantadurga', 'shanta durga', 'mangeshi', 'mangueshi', 'tambdi surla', 'mahalasa', 'damodar', 'kamakshi', 'nagueshi',
            'shigmo', 'carnival', 'sao joao', 'bonderam', 'mando', 'fugdi', 'dhalo', 'ghumot',
            'fontainhas', 'divar', 'chorao', 'mapusa', 'arpora', 'operation vijay', 'liberation',
            
            # Indic Transliterations (Hindi, Kannada, Telugu, Tamil, Bengali, Marathi, Gujarati)
            'गोवा', 'पणजी', 'कोंकणी', 'मराठी', 'बेबिंका', 'फेनी', 'जाकुती', 'विंदालू', 'अगुआड़ा', 'दूधसागर', 'मंगेशी', 'शांतादुर्गा', 'तांबडी सुरला', 'शिगमो', 'खान-पान',
            'ಗೋವಾ', 'ಗೋವಾದ', 'ಪಣಜಿ', 'ಕೊಂಕಣಿ', 'ಮರಾಠಿ', 'ಬಾಗಾ', 'ಕಲಂಗೂಟ್', 'ಅಂಜುನಾ', 'ಮಂಗೇಶಿ', 'ಶಾಂತಾದುರ್ಗಾ', 'ದೂಧ್‌ಸಾಗರ್',
            'గోవా', 'పనాజీ', 'కొంకణి', 'మంగేషి', 'శాంతాదుర్గా', 'దూధ్‌సాగర్',
            'கோவா', 'பனாஜி', 'கொங்கணி', 'மங்கேஷி', 'சாந்தாதுர்கா',
            'গোয়া', 'পানাজি', 'মঙ্গেশি', 'শান্তাদুর্গা', 'দুধসাগর',
            'ખોરાક', 'દરિયાકિનારો', 'કિલ્લો', 'મંદિર', 'રાજધાની', 'ഭക്ഷണം', 'കടൽത്തീരം', 'കോട്ട', 'ക്ഷേത്രം', 'തലസ്ഥാനം'
        }

        self.generic_domain_intents = {
            'beach', 'beaches', 'fort', 'forts', 'church', 'churches', 'temple', 'temples', 'mandir', 'waterfall', 'waterfalls',
            'food', 'foods', 'seafood', 'fish curry', 'cuisine', 'cuisines', 'dish', 'dishes', 'traditional food',
            'festival', 'festivals', 'culture', 'tradition', 'traditions', 'history', 'liberation', 'market', 'markets', 'island', 'islands',
            'capital', 'language', 'official language',
            # Hindi
            'समुद्र तट', 'बीच', 'किला', 'किले', 'चर्च', 'मंदिर', 'त्योहार', 'उत्सव', 'झरना', 'व्यंजन', 'भोजन', 'खान-पान', 'संस्कृति', 'इतिहास', 'राजधानी', 'भाषा', 'राजभाषा',
            # Kannada
            'ಆಹಾರ', 'ಊಟ', 'ತಿಂಡಿ', 'ಕಡಲತೀರ', 'ಕಡಲತೀರಗಳು', 'ಬೀಚ್', 'ಕೋಟೆ', 'ಕೋಟೆಗಳು', 'ದೇವಸ್ಥಾನ', 'ದೇವಾಲಯ', 'ದೇವಾಲಯಗಳು', 'ರಾಜಧಾನಿ', 'ಹಬ್ಬ', 'ಸಂಸ್ಕೃತಿ', 'ಇತಿಹಾಸ', 'ಜಲಪಾತ', 'ಭಾಷೆ',
            # Telugu
            'ఆహారం', 'భోజనం', 'బీచ్', 'కోట', 'దేవాలయం', 'దేవాలయాలు', 'రాజధాని', 'పండుಗ', 'సంస్కృతి', 'చరిత్ర', 'జలపాతం', 'భాష',
            # Tamil
            'உணவு', 'கடற்கரை', 'கோட்டை', 'கோயில்', 'தலைநகரம்', 'திருவிழா', 'கலாச்சாரம்', 'வரலாறு', 'நீர்வீழ்ச்சி', 'மொழி',
            # Bengali
            'খাবার', 'সৈকত', 'কেল্লা', 'মন্দির', 'রাজধানী', 'উৎসব', 'সংস্কৃতি', 'ইতিಹಾಸ', 'জলপ্রপাত', 'ভাষা',
            # Marathi
            'जेवण', 'खाद्यपदार्थ', 'समुद्रकिनारा', 'किल्ला', 'देवूळ', 'सण', 'राजधानी', 'भाषा'
        }

        self.outside_entities = {
            'france', 'paris', 'tokyo', 'usa', 'america', 'london', 'uk', 'germany',
            'tesla', 'spacex', 'elon musk', 'microsoft', 'google', 'apple', 'amazon',
            'cricket', 'football', 'world cup', 'cake', 'baking', 'recipe for cake', 'astrology', 'horoscope', 'minister', 'president', 'prime minister'
        }

        self.greetings_phrases = [
            'hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'good afternoon',
            'how are you', 'who are you', 'what can you do', 'what is up', 'whats up', 'tell me a joke',
            'thank you', 'thanks', 'bye', 'goodbye', 'नमस्ते', 'हेलो'
        ]

        self.accent_map = {
            'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
            'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
            'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
            'ç': 'c', 'ñ': 'n'
        }

    def _normalize_text(self, text: str) -> str:
        t = text.lower().strip()
        for k, v in self.accent_map.items():
            t = t.replace(k, v)
        return t

    def _match_token(self, token: str, text: str) -> bool:
        norm_t = self._normalize_text(text)
        norm_tok = self._normalize_text(token)
        if any(ord(c) > 127 for c in norm_tok):
            return norm_tok in norm_t
        return bool(re.search(r'\b' + re.escape(norm_tok) + r'\b', norm_t))

    def evaluate_topic(self, query: str, domain_keywords: Optional[List[str]] = None) -> GuardrailVerdict:
        q_lower = self._normalize_text(query)
        words = set(re.findall(r'\w+', q_lower))

        if not words and not q_lower:
            return GuardrailVerdict(
                passed=False,
                flagged=True,
                score=0.0,
                reason="empty_query",
                action="refuse"
            )

        # Custom domain keyword override (e.g. test suites)
        if domain_keywords is not None:
            if any(self._match_token(dk, q_lower) for dk in domain_keywords):
                return GuardrailVerdict(
                    passed=True,
                    flagged=False,
                    score=0.90,
                    reason="in_domain_query",
                    action="allow"
                )
            return GuardrailVerdict(
                passed=False,
                flagged=True,
                score=0.10,
                reason="off_topic: query_outside_test_domain",
                action="refuse"
            )

        # 1. Conversational Greetings & AI Meta
        if any(q_lower == g or q_lower.startswith(g + ' ') or (' ' + g + ' ') in (' ' + q_lower + ' ') for g in self.greetings_phrases):
            if not any(k in q_lower for k in ['capital', 'beach', 'food', 'fort', 'france', 'cake', 'world cup']):
                return GuardrailVerdict(
                    passed=True,
                    flagged=False,
                    score=0.95,
                    reason="conversational_greeting",
                    action="allow"
                )

        # 2. Explicit MSMARCO-XI Domain Knowledge Keywords -> Allow
        if any(self._match_token(k, q_lower) for k in self.msmarco_domain_keywords):
            return GuardrailVerdict(
                passed=True,
                flagged=False,
                score=0.92,
                reason="in_domain_msmarco_xi_rag",
                action="allow"
            )

        # 3. Contextual Domain Intents (Capital, Language, Food, Forts, Beaches, Climate, Science) -> Allow
        if any(self._match_token(gi, q_lower) for gi in self.generic_domain_intents):
            return GuardrailVerdict(
                passed=True,
                flagged=False,
                score=0.88,
                reason="in_domain_contextual_rag",
                action="allow"
            )

        # 4. Strict Refusal for Clear Out-of-Domain Entities (e.g. Elon Musk, Cake Recipe, World Cup)
        if any(self._match_token(oe, q_lower) for oe in self.outside_entities):
            return GuardrailVerdict(
                passed=False,
                flagged=True,
                score=0.05,
                reason="off_topic: query_outside_indexed_dataset",
                action="refuse"
            )

        # 5. Dynamic Dataset Overlap: Allow if query words match indexed documents
        from app.core.dataset_loader import dataset_manager
        all_docs = dataset_manager.get_all_documents()
        for doc in all_docs:
            doc_norm = self._normalize_text(doc.title + " " + doc.content)
            matching_words = [w for w in words if len(w) > 3 and w in doc_norm]
            if len(matching_words) >= 2:
                return GuardrailVerdict(
                    passed=True,
                    flagged=False,
                    score=0.80,
                    reason="in_domain_dataset_overlap",
                    action="allow"
                )

        # 6. Default Active Abstention for Unmatched Inquiries
        return GuardrailVerdict(
            passed=False,
            flagged=True,
            score=0.10,
            reason="off_topic: query_outside_indexed_dataset",
            action="refuse"
        )
