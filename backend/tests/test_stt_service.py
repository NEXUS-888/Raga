"""
Unit tests for Speech-To-Text Service (Sarvam AI, ElevenLabs, and Resilient Local Fallback).
"""
import pytest
import io
import wave
from app.services.stt_service import SpeechToTextService

def generate_dummy_wav(duration_sec: float = 0.5) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        num_frames = int(16000 * duration_sec)
        wav.writeframes(b'\x00' * (num_frames * 2))
    return buf.getvalue()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_stt_local_fallback():
    stt = SpeechToTextService()
    audio = generate_dummy_wav(0.5)
    
    transcript, latency_ms, meta = await stt.transcribe(
        audio_bytes=audio,
        provider="mock",
        language_code="en-IN"
    )
    
    assert len(transcript) > 0
    assert latency_ms > 0
    assert "simulated" in meta.get("mode", "") or "local" in meta.get("provider", "")

@pytest.mark.asyncio
@pytest.mark.unit
async def test_stt_indic_language_handling():
    stt = SpeechToTextService()
    audio = generate_dummy_wav(0.7)
    
    transcript, latency_ms, meta = await stt.transcribe(
        audio_bytes=audio,
        provider="mock",
        language_code="hi-IN"
    )
    
    assert len(transcript) > 0
    assert latency_ms > 0
    assert meta["audio_bytes"] == len(audio)

@pytest.mark.asyncio
@pytest.mark.unit
async def test_stt_latency_measurement_accuracy():
    stt = SpeechToTextService()
    audio = generate_dummy_wav(0.2)
    
    _, latency_ms, _ = await stt.transcribe(audio_bytes=audio, provider="mock")
    # Sub-50ms local ASR latency
    assert latency_ms < 60.0
