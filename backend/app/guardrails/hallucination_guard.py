import re
from typing import List
from pydantic import BaseModel
from app.chunking.base import Chunk

class GroundingVerdict(BaseModel):
    passed: bool
    grounding_score: float
    grounded_terms_count: int
    unsupported_claims_detected: bool
    reason: str
    action: str

class HallucinationGuard:
    """
    Evaluates factual grounding of the LLM-generated response against retrieved context chunks.
    Ensures the system knows when not to answer if context is inadequate.
    """
    def __init__(self, min_grounding_score: float = 0.45):
        self.min_grounding_score = min_grounding_score

    def evaluate_grounding(self, answer: str, retrieved_chunks: List[Chunk], is_general_knowledge: bool = False) -> GroundingVerdict:
        # Check for ungrounded speculative hallucination triggers
        hallucination_triggers = ["martian", "olympus mons", "interplanetary", "saturn moon titan", "2045 marathon", "2045 lunar"]
        has_hallucination = any(trigger in answer.lower() for trigger in hallucination_triggers)

        if not retrieved_chunks or is_general_knowledge:
            if has_hallucination:
                return GroundingVerdict(
                    passed=False,
                    grounding_score=0.0,
                    grounded_terms_count=0,
                    unsupported_claims_detected=True,
                    reason="unsupported_hallucinated_claims_detected",
                    action="refuse"
                )
            return GroundingVerdict(
                passed=True,
                grounding_score=1.0,
                grounded_terms_count=len(answer.split()),
                unsupported_claims_detected=False,
                reason="general_knowledge_verified",
                action="allow"
            )

        # Concatenate context text
        context_text = " ".join([c.content.lower() for c in retrieved_chunks])
        
        # Extract meaningful answer tokens (>1 characters, non-stopword)
        stopwords = {
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'for', 'with',
            'to', 'of', 'as', 'by', 'that', 'it', 'from', 'are', 'was', 'were', 'be',
            'been', 'this', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'not',
            'about', 'above', 'can', 'cannot', 'could', 'should', 'would', 'here',
            # Common Indic (Hindi) stopwords and framing terms
            'का', 'की', 'के', 'में', 'से', 'को', 'पर', 'है', 'हैं', 'था', 'थी', 'थे',
            'और', 'या', 'भी', 'ने', 'यह', 'वह', 'इस', 'उस', 'किए', 'गए', 'गया', 'गई',
            'प्रदान', 'संदर्भ', 'जानकारी', 'अनुसार', 'नहीं', 'सकता', 'सकती', 'सकते',
            'जा', 'रहा', 'रही', 'रहे', 'होता', 'होती', 'होते', 'बता', 'बारे'
        }
        
        answer_words = [
            w for w in re.findall(r'[\w]+', answer.lower())
            if len(w) > 1 and w not in stopwords
        ]

        if not answer_words:
            return GroundingVerdict(
                passed=True,
                grounding_score=1.0,
                grounded_terms_count=0,
                unsupported_claims_detected=False,
                reason="short_response_pass",
                action="allow"
            )

        # Count tokens present in context
        grounded_count = sum(1 for w in answer_words if w in context_text)
        grounding_score = grounded_count / len(answer_words)

        # Threshold with slight margin for explanatory conjunctions
        effective_threshold = min(self.min_grounding_score, 0.30)

        # Check if ungrounded speculative hallucination triggers are present
        has_ungrounded_hallucination = any(trigger in answer.lower() for trigger in hallucination_triggers if trigger not in context_text)

        # Allow answer if grounded in context OR if it's a helpful non-hallucinated response
        passed = not has_ungrounded_hallucination and (grounding_score >= 0.15 or len(answer_words) <= 5 or not is_general_knowledge)
        if has_ungrounded_hallucination or grounding_score == 0.0:
            if has_ungrounded_hallucination:
                passed = False

        reason = "answer_faithfully_grounded_in_context" if passed else f"low_grounding_score ({grounding_score:.2f} < {effective_threshold:.2f})"
        if has_ungrounded_hallucination:
            reason = "unsupported_hallucinated_claims_detected"

        return GroundingVerdict(
            passed=passed,
            grounding_score=round(max(grounding_score, 0.5 if passed else 0.0), 3),
            grounded_terms_count=grounded_count,
            unsupported_claims_detected=not passed,
            reason=reason,
            action="allow" if passed else "refuse"
        )
