import re
from typing import List, Optional
from app.guardrails.safety_guard import GuardrailVerdict

class TopicGuard:
    """
    Classifies user queries to verify domain alignment with the indexed MSMARCO-XI dataset.
    Detects off-topic queries and triggers structured abstention.
    """
    def __init__(self):
        self.goa_keywords = {
            'goa', 'goan', 'panaji', 'panjim', 'vasco', 'margao', 'konkani', 'marathi',
            'baga', 'calangute', 'anjuna', 'palolem', 'colva', 'vagator', 'arambol',
            'aguada', 'chapora', 'reis magos', 'bom jesus', 'cathedral', 'dudhsagar', 'mandovi',
            'bebinca', 'feni', 'xacuti', 'vindaloo', 'balchao', 'cafreal', 'poi', 'sol kadi',
            'monsoon', 'kerala monsoon', 'weather', 'climate',
            'गोवा', 'पणजी', 'कोंकणी', 'मराठी', 'बेबिंका', 'फेनी', 'जाकुती', 'विंदालू', 'अगुआड़ा', 'दूधसागर', 'खान-पान'
        }

        self.generic_goa_intents = {
            'beach', 'beaches', 'fort', 'forts', 'church', 'churches', 'waterfall', 'waterfalls',
            'food', 'foods', 'seafood', 'fish curry', 'cuisine', 'cuisines', 'dish', 'dishes', 'traditional food',
            'समुद्र तट', 'बीच', 'किला', 'किले', 'चर्च', 'झरना', 'व्यंजन', 'भोजन', 'खान-पान'
        }

        self.outside_entities = {
            'india', 'karnataka', 'kerala', 'maharashtra', 'delhi', 'mumbai', 'bangalore', 'bengaluru', 'tamil nadu',
            'france', 'paris', 'japan', 'tokyo', 'china', 'usa', 'america', 'london', 'uk', 'germany',
            'tesla', 'spacex', 'elon musk', 'microsoft', 'google', 'apple', 'amazon',
            'cricket', 'football', 'world cup', 'cake', 'astrology', 'horoscope', 'minister', 'president', 'prime minister',
            'भारत', 'कर्नाटक', 'दिल्ली', 'मुंबई'
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
            if not any(k in q_lower for k in ['capital', 'beach', 'food', 'fort', 'india', 'karnataka', 'france', 'भारत']):
                return GuardrailVerdict(
                    passed=True,
                    flagged=False,
                    score=0.95,
                    reason="conversational_greeting",
                    action="allow"
                )

        # 2. Outside entities without explicit Goa mention -> Strict Refusal
        has_outside = any(self._match_token(oe, q_lower) for oe in self.outside_entities)
        has_goa = any(self._match_token(gk, q_lower) for gk in ['goa', 'goan', 'गोवा'])
        if has_outside and not has_goa:
            return GuardrailVerdict(
                passed=False,
                flagged=True,
                score=0.05,
                reason="off_topic: non_goa_entity_query",
                action="refuse"
            )

        # 3. Explicit Goa specific domain keywords -> Allow
        if any(self._match_token(gk, q_lower) for gk in self.goa_keywords):
            return GuardrailVerdict(
                passed=True,
                flagged=False,
                score=0.90,
                reason="in_domain_goa_rag",
                action="allow"
            )

        # 4. Contextual domain intents (capital, language, beaches, forts, food) -> Allow
        if any(self._match_token(gi, q_lower) for gi in self.generic_goa_intents) or 'capital' in words or 'language' in words or 'राजधानी' in q_lower or 'भाषा' in q_lower:
            return GuardrailVerdict(
                passed=True,
                flagged=False,
                score=0.85,
                reason="in_domain_contextual_rag",
                action="allow"
            )

        # 5. Strict Default: Any question outside Goa domain is refused
        return GuardrailVerdict(
            passed=False,
            flagged=True,
            score=0.10,
            reason="off_topic: query_outside_indexed_goa_dataset",
            action="refuse"
        )
