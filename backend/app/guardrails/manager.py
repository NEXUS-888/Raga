from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.guardrails.safety_guard import SafetyGuard, GuardrailVerdict
from app.guardrails.topic_guard import TopicGuard
from app.guardrails.hallucination_guard import HallucinationGuard, GroundingVerdict
from app.chunking.base import Chunk

class GuardrailPipelineReport(BaseModel):
    safety: GuardrailVerdict
    topic: GuardrailVerdict
    grounding: Optional[GroundingVerdict] = None
    all_passed: bool
    refusal_message: Optional[str] = None

class GuardrailManager:
    def __init__(self):
        self.safety_guard = SafetyGuard()
        self.topic_guard = TopicGuard()
        self.hallucination_guard = HallucinationGuard()

    def check_input(self, query: str) -> GuardrailPipelineReport:
        safety_v = self.safety_guard.evaluate_input(query)
        if not safety_v.passed:
            return GuardrailPipelineReport(
                safety=safety_v,
                topic=GuardrailVerdict(passed=False, flagged=False, score=0.0, reason="skipped_due_to_safety", action="refuse"),
                all_passed=False,
                refusal_message="I cannot assist with this request as it violates safety guidelines."
            )

        topic_v = self.topic_guard.evaluate_topic(query)
        if not topic_v.passed:
            return GuardrailPipelineReport(
                safety=safety_v,
                topic=topic_v,
                all_passed=False,
                refusal_message="This query appears to be outside the domain scope of the indexed knowledge dataset (ai4bharat/MSMARCO-XI)."
            )

        return GuardrailPipelineReport(
            safety=safety_v,
            topic=topic_v,
            all_passed=True
        )

    def check_output(self, answer: str, chunks: List[Chunk], report: GuardrailPipelineReport) -> GuardrailPipelineReport:
        is_general = (report.topic.reason == "general_knowledge_query")
        grounding_v = self.hallucination_guard.evaluate_grounding(answer, chunks, is_general_knowledge=is_general)
        report.grounding = grounding_v

        if not grounding_v.passed:
            report.all_passed = False
            report.refusal_message = (
                "I am unable to provide an answer because the generated claims cannot be verified or grounded "
                "within the retrieved MSMARCO-XI dataset passages."
            )

        return report

guardrail_manager = GuardrailManager()
