from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.chunking.base import Chunk
from app.guardrails.manager import GuardrailPipelineReport

class VoiceRAGRequest(BaseModel):
    audio_base64: Optional[str] = None
    query_text: Optional[str] = None
    chunking_strategy: str = "recursive_hierarchical"
    stt_provider: str = "sarvam"  # "sarvam", "elevenlabs", "mock"
    llm_provider: Optional[str] = None
    top_k: int = 3
    language: str = "en"
    audio_filename: str = "input_voice.wav"

class LatencyWaterfall(BaseModel):
    stt_ms: float = 0.0
    guardrail_input_ms: float = 0.0
    embedding_ms: float = 0.0
    vector_search_ms: float = 0.0
    bm25_search_ms: float = 0.0
    total_retrieval_ms: float = 0.0
    generation_ms: float = 0.0
    guardrail_output_ms: float = 0.0
    total_pipeline_ms: float = 0.0
    target_met: bool = True  # True if total <= 200ms

class HarnessTraceStep(BaseModel):
    step_name: str
    status: str  # "success", "retried", "recovered", "refused", "skipped"
    execution_time_ms: float
    details: Dict[str, Any] = Field(default_factory=dict)

class VoiceRAGResponse(BaseModel):
    query: str
    transcript: str
    answer: str
    is_refusal: bool = False
    refusal_reason: Optional[str] = None
    citations: List[Chunk] = Field(default_factory=list)
    guardrails: GuardrailPipelineReport
    latency: LatencyWaterfall
    harness_trace: List[HarnessTraceStep] = Field(default_factory=list)
    strategy_used: str
    stt_provider_used: str
