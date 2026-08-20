import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional, List, Dict, Any

from app.harness.orchestrator import orchestrator
from app.harness.structured_types import VoiceRAGRequest, VoiceRAGResponse

router = APIRouter(prefix="/rag", tags=["Voice RAG"])

@router.post("/query", response_model=VoiceRAGResponse)
async def query_rag_text(request: VoiceRAGRequest) -> VoiceRAGResponse:
    """
    Direct RAG query with text or base64 audio.
    Executes Guardrails -> Hybrid Retrieval -> LLM Synthesis -> Grounding Check -> Latency Waterfall.
    """
    if request.audio_base64:
        try:
            audio_bytes = base64.b64decode(request.audio_base64)
            return await orchestrator.execute_voice_pipeline(audio_bytes, request)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid audio base64 payload: {str(e)}")
    
    if not request.query_text or not request.query_text.strip():
        raise HTTPException(status_code=400, detail="Either 'query_text' or 'audio_base64' must be provided.")

    return await orchestrator.execute_text_pipeline(request)

@router.post("/voice", response_model=VoiceRAGResponse)
async def query_rag_voice(
    file: UploadFile = File(...),
    chunking_strategy: str = Form("recursive_hierarchical"),
    stt_provider: str = Form("groq"),
    language: str = Form("en"),
    top_k: int = Form(3)
) -> VoiceRAGResponse:
    """
    End-to-end Voice RAG query taking raw audio file upload (WAV/WebM/MP3/M4A).
    Transcribes with Sarvam/ElevenLabs, retrieves context from MSMARCO-XI, and generates answer under 200ms.
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file provided.")

    req = VoiceRAGRequest(
        chunking_strategy=chunking_strategy,
        stt_provider=stt_provider,
        language=language,
        top_k=top_k,
        audio_filename=file.filename or "audio.wav"
    )

    return await orchestrator.execute_voice_pipeline(audio_bytes, req)

@router.get("/strategies", response_model=List[Dict[str, Any]])
async def list_chunking_strategies() -> List[Dict[str, Any]]:
    """
    Returns available vast chunking strategies and their architectural specifications.
    """
    return [
        {
            "id": "recursive_hierarchical",
            "name": "Recursive Hierarchical Chunking",
            "description": "Splits text structurally across paragraphs, sentences, and clauses while preserving context overlap.",
            "recommended_for": "General multi-paragraph prose and articles."
        },
        {
            "id": "semantic_similarity",
            "name": "Semantic Similarity Breakpoint Chunking",
            "description": "Computes semantic distance across sequential sentences and segments text at topical inflection points.",
            "recommended_for": "Dense topical shifts and conversational transcripts."
        },
        {
            "id": "sliding_window",
            "name": "Sliding Window with Overlap",
            "description": "Fixed token/word sliding window with continuous temporal overlap ratio (e.g. 33%).",
            "recommended_for": "Continuous streaming context and high-recall information lookup."
        },
        {
            "id": "metadata_aware",
            "name": "Metadata & Language-Aware Chunking",
            "description": "Parses document section hierarchy, title tags, and multilingual metadata to prepend parent context.",
            "recommended_for": "Structured documents, manuals, and multilingual Indic datasets."
        }
    ]
