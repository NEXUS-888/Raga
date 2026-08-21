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
            r'ignore\s+(?:all\s+)?(?:previous\s+|prior\s+)?(?:instructions|rules|directives|guidelines|prompts|constraints)',
            r'dump\s+(?:admin\s+|user\s+|all\s+|system\s+)?(?:database|db|tables|credentials|passwords|secrets|keys)',
            r'system\s+(?:override|prompt|directive|command|admin)',
            r'jailbreak|dan\s+mode|developer\s+mode|unaligned\s+mode|do\s+anything\s+now',
            r'bypass\s+(?:safety|filter|permission|security|guardrail|policy|rules)',
            r'drop\s+table|delete\s+from|insert\s+into|select\s+\*\s+from',
            r'sudo\s+rm|rm\s+-rf|format\s+c:|del\s+/f',
            r'admin\s+(?:access|password|credentials|privileges)',
            r'leak\s+(?:api\s+key|token|env|secrets)',
            r'<script|<iframe|javascript:|alert\(',
            r'forget\s+(?:your\s+|all\s+)?(?:persona|identity|rules|instructions|directives|context)',
            r'act\s+as\s+(?:an?\s+)?(?:unrestricted|unaligned|jailbroken|evil|dan|terminal|root|unfiltered)',
            r'pretend\s+(?:to\s+be|you\s+are)\s+(?:an?\s+)?(?:unrestricted|unfiltered|jailbroken|evil|dan|terminal|root)'
        ]
        self.harmful_keywords = [
            'hack', 'exploit', 'password crack', 'steal credit', 'malware',
            'ddos', 'kill', 'weapon', 'bomb', 'poison', 'suicide', 'contraband',
            'drug synthesis', 'explosive device'
        ]

        # Profanity, abuse, insults, and toxic harassment patterns (English + Indic / Devanagari)
        self.toxicity_patterns = [
            r'\b(?:fuck(?:ing|er|ed|s)?|f\*ck|stfu|shit(?:ty)?|bullshit|bitch(?:es)?|bastard(?:s)?|asshole(?:s)?|dickhead(?:s)?|cunt(?:s)?|dick(?:s)?|pussy|slut(?:s)?|whore(?:s)?|motherfucker(?:s)?)\b',
            r'\b(?:chutiya|madarchod|bhenchod|behenchod|bhosdike|gaand|lauda|loda|lodu|harami|kamina|randi|saala|kutta)\b',
            r'\b(?:fuck\s+you|fuck\s+off|screw\s+you|eat\s+shit|piece\s+of\s+shit|shut\s+up|go\s+to\s+hell|kill\s+yourself|die\s+in\s+a\s+fire)\b',
            r'\b(?:stupid|idiot|moron|dumbass|retard|scumbag)\b',
            r'(?:चूतिया|मादरचोद|भेनचोद|भोसड़ीके|हरामी|कमीना|गांड|लौड़ा|लंड|साला|कुत्ता)'
        ]

    def evaluate_input(self, text: str) -> GuardrailVerdict:
        lower = text.lower().strip()
        
        # 1. Check prompt injection patterns
        for pattern in self.injection_patterns:
            if re.search(pattern, lower, re.IGNORECASE):
                return GuardrailVerdict(
                    passed=False,
                    flagged=True,
                    score=0.95,
                    reason="prompt_injection_detected",
                    action="refuse"
                )

        # 2. Check toxicity, profanity, and abusive language
        for pattern in self.toxicity_patterns:
            if re.search(pattern, lower, re.IGNORECASE):
                return GuardrailVerdict(
                    passed=False,
                    flagged=True,
                    score=0.98,
                    reason="safety_violation: abusive_or_toxic_language",
                    action="refuse"
                )

        # 3. Check harmful keywords
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

safety_guard = SafetyGuard()

