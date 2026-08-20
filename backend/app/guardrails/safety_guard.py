import re
from typing import List
from pydantic import BaseModel

class GuardrailVerdict(BaseModel):
    passed: bool
    flagged: bool
    score: float
    reason: str
    action: str  # "allow", "refuse", "sanitize"

class SafetyGuard:
    """
    Evaluates input queries for toxicity, unauthorized operations, prompt injection, and harmful instructions.
    """
    def __init__(self):
        # Patterns for prompt injection and harmful intents
        self.injection_patterns = [
            r'ignore\s+all\s+previous\s+instructions',
            r'system\s+prompt',
            r'jailbreak',
            r'bypass\s+(?:safety|filter|permission|security)',
            r'drop\s+table',
            r'sudo\s+rm'
        ]
        self.harmful_keywords = [
            'hack', 'exploit', 'password crack', 'steal credit', 'malware',
            'ddos', 'kill', 'weapon', 'bomb', 'poison', 'suicide'
        ]

    def evaluate_input(self, text: str) -> GuardrailVerdict:
        lower = text.lower().strip()
        
        # Check prompt injection patterns
        for pattern in self.injection_patterns:
            if re.search(pattern, lower, re.IGNORECASE):
                return GuardrailVerdict(
                    passed=False,
                    flagged=True,
                    score=0.95,
                    reason="prompt_injection_detected",
                    action="refuse"
                )

        # Check harmful keywords
        for kw in self.harmful_keywords:
            if kw in lower:
                return GuardrailVerdict(
                    passed=False,
                    flagged=True,
                    score=0.90,
                    reason=f"safety_violation: prohibited content ({kw})",
                    action="refuse"
                )

        return GuardrailVerdict(
            passed=True,
            flagged=False,
            score=0.05,
            reason="input_passed_safety_filters",
            action="allow"
        )
