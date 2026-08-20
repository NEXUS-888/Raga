from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Dict, Any
from app.services.stt_service import stt_service
from app.core.config import settings

router = APIRouter(prefix="/stt", tags=["Speech To Text"])

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    provider: str = Form("groq"),
    language_code: str = Form("en-IN")
) -> Dict[str, Any]:
    """
    Transcribes spoken voice audio using Groq Whisper, Sarvam AI (Saaras) or ElevenLabs (Scribe).
    """
    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file.")

    transcript, latency_ms, meta = await stt_service.transcribe(
        audio_bytes=audio_bytes,
        provider=provider,
        language_code=language_code,
        filename=file.filename or "recording.wav"
    )

    return {
        "transcript": transcript,
        "latency_ms": round(latency_ms, 2),
        "provider_used": meta.get("provider", provider),
        "metadata": meta
    }

@router.get("/providers")
async def get_providers_status() -> Dict[str, Any]:
    """
    Returns active configuration status for STT providers.
    """
    return {
        "active_default": settings.stt_provider,
        "groq": {
            "configured": bool(settings.groq_api_key),
            "model": "whisper-large-v3-turbo",
            "supported_languages": ["en", "hi", "multilingual"]
        },
        "sarvam": {
            "configured": bool(settings.sarvam_api_key),
            "model": "saaras:v3",
            "supported_languages": ["en-IN", "hi-IN", "bn-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "or-IN", "pa-IN", "ta-IN", "te-IN"]
        },
        "elevenlabs": {
            "configured": bool(settings.elevenlabs_api_key),
            "model": "scribe_v1",
            "supported_languages": ["multilingual"]
        },
        "local_fallback": {
            "status": "ready",
            "latency_estimate_ms": "<25ms"
        }
    }
