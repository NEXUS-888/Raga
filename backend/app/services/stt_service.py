import io
import re
import time
import json
from pathlib import Path
import httpx
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings

def _clean_transcript(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'^[\s\.\,\?\!\-\_]+|[\s\.\,\?\!\-\_]+$', '', text.strip())
    # Reject common hallucination artifacts of silence
    if cleaned.lower() in ["you", "thank you", "subtitles by", "captioning", "silence", "thank you for watching", ""]:
        return ""
    return cleaned

class SpeechToTextService:
    """
    Unified Speech-to-Text service supporting Groq Whisper, Sarvam AI (Saaras) and ElevenLabs (Scribe),
    with robust error recovery and microsecond latency measurement.
    """
    def __init__(self):
        self.groq_whisper_endpoint = "https://api.groq.com/openai/v1/audio/transcriptions"
        self.sarvam_endpoint = "https://api.sarvam.ai/speech-to-text"
        self.elevenlabs_endpoint = "https://api.elevenlabs.io/v1/speech-to-text"

    async def transcribe(
        self,
        audio_bytes: bytes,
        provider: Optional[str] = None,
        language_code: str = "en-IN",
        filename: str = "recording.wav"
    ) -> Tuple[str, float, Dict[str, Any]]:
        """
        Transcribes voice audio bytes to text using chosen STT provider with automatic fallback.
        Returns: (transcript_text, latency_ms, metadata)
        """
        selected_provider = (provider or settings.stt_provider or "groq").lower()
        t0 = time.perf_counter()
        magic = audio_bytes[:4].hex() if len(audio_bytes) >= 4 else ""
        
        # Handle explicit mock provider (for unit tests only)
        if selected_provider in ["mock", "test"]:
            elapsed_ms = (time.perf_counter() - t0) * 1000
            test_text = "गोवा की राजधानी क्या है?" if "hi" in language_code.lower() else "What is the capital of Goa and what language is spoken there?"
            return test_text, elapsed_ms, {"provider": "mock_local_provider", "mode": "simulated_local", "language": language_code, "audio_bytes": len(audio_bytes)}

        # Check if language is an Indian language or Auto-detect where Sarvam Saaras excels
        is_indic_language = any(lang in language_code.lower() for lang in [
            "kn", "te", "ta", "mr", "bn", "gu", "ml", "pa", "or", "as", "hi", "kok", "ne", "auto"
        ])
        
        # If Indian language, Auto-detect, or explicit sarvam requested -> Use Sarvam AI Saaras as primary!
        if settings.sarvam_api_key and (selected_provider in ["sarvam", "saaras"] or is_indic_language):
            try:
                print(f"[STT DEBUG] Calling _transcribe_sarvam for Indic language: {language_code}...")
                transcript, meta = await self._transcribe_sarvam(audio_bytes, language_code, filename)
                cleaned = _clean_transcript(transcript)
                print(f"[STT DEBUG] Sarvam raw: {repr(transcript)}, cleaned: {repr(cleaned)}")
                if cleaned:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return cleaned, elapsed_ms, {"provider": "sarvam_saaras", **meta}
            except Exception as e:
                print(f"[STT Error] Sarvam STT failed: {e}")

        # 1. Primary for English / Global: Groq Whisper (Ultra-fast ~100-300ms)
        if settings.groq_api_key and selected_provider in ["groq", "whisper", "default"] or not is_indic_language:
            try:
                print(f"[STT DEBUG] Calling _transcribe_groq_whisper...")
                transcript, meta = await self._transcribe_groq_whisper(audio_bytes, filename, language_code)
                cleaned = _clean_transcript(transcript)
                print(f"[STT DEBUG] Groq Whisper raw: {repr(transcript)}, cleaned: {repr(cleaned)}")
                if cleaned:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return cleaned, elapsed_ms, {"provider": "groq_whisper_large_v3", **meta}
            except Exception as e:
                print(f"[STT Error] Groq Whisper API error: {e}")

        # 2. Secondary fallback to Sarvam AI Saaras if not already called
        if settings.sarvam_api_key and not is_indic_language:
            try:
                print(f"[STT DEBUG] Calling _transcribe_sarvam fallback...")
                transcript, meta = await self._transcribe_sarvam(audio_bytes, language_code, filename)
                cleaned = _clean_transcript(transcript)
                if cleaned:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return cleaned, elapsed_ms, {"provider": "sarvam_saaras", **meta}
            except Exception as e:
                print(f"[STT Error] Sarvam STT failed: {e}")

        # 3. Tertiary: ElevenLabs API fallback
        if settings.elevenlabs_api_key:
            try:
                transcript, meta = await self._transcribe_elevenlabs(audio_bytes, filename)
                cleaned = _clean_transcript(transcript)
                if cleaned:
                    elapsed_ms = (time.perf_counter() - t0) * 1000
                    return cleaned, elapsed_ms, {"provider": "elevenlabs_scribe", **meta}
            except Exception as e:
                print(f"[STT Error] ElevenLabs API error: {e}")

        elapsed_ms = (time.perf_counter() - t0) * 1000
        return "", elapsed_ms, {"provider": "none", "error": "All STT providers failed"}

    async def _transcribe_groq_whisper(self, audio_bytes: bytes, filename: str, language_code: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}"
        }
        ext = "wav"
        content_type = "audio/wav"
        if len(audio_bytes) >= 4 and audio_bytes[:4] == b"RIFF":
            ext = "wav"
            content_type = "audio/wav"
        elif len(audio_bytes) >= 4 and audio_bytes[:4] == b"\x1a\x45\xdf\xa3":
            ext = "webm"
            content_type = "audio/webm"
        elif len(audio_bytes) >= 3 and audio_bytes[:3] == b"ID3":
            ext = "mp3"
            content_type = "audio/mpeg"
        elif len(audio_bytes) >= 2 and audio_bytes[0] == 0xFF and (audio_bytes[1] & 0xE0) == 0xE0:
            ext = "mp3"
            content_type = "audio/mpeg"
        
        files = {
            "file": (f"recording.{ext}", audio_bytes, content_type)
        }
        data: Dict[str, Any] = {
            "model": "whisper-large-v3-turbo",
            "temperature": "0.0",
            "response_format": "json"
        }
        # If specific language is requested, set it; otherwise leave empty for Whisper Auto-Detection!
        if language_code and language_code.lower() != "auto":
            lang_prefix = language_code.split("-")[0].lower()
            data["language"] = lang_prefix
            if lang_prefix == "hi":
                data["prompt"] = "गोवा, पर्यटन, पणजी, कलंगूट, भोजन, संस्कृति, समुद्र तट, मौसम, इतिहास, यात्रा"
            elif lang_prefix in ["kn", "te", "ta", "mr", "bn", "gu", "ml", "pa", "or"]:
                data["prompt"] = "Goa, tourism, beaches, Panaji, food, culture, temples, history"
            else:
                data["language"] = "en"
                data["prompt"] = "Goa tourism, travel, food, beaches, Panaji, Calangute, heritage, culture, churches, seafood, sightseeing, weather"
        else:
            # Whisper Auto-Detection prompt covering Indian multilingual terminology
            data["prompt"] = "Goa tourism, travel, beaches, Panaji, Goa food, गोवा, पणजी, संस्कृति"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.groq_whisper_endpoint, headers=headers, data=data, files=files)
            resp.raise_for_status()
            res_json = resp.json()
            transcript = res_json.get("text", "")
            return transcript, {"raw": res_json}

    async def _transcribe_sarvam(self, audio_bytes: bytes, language_code: str, filename: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "api-subscription-key": settings.sarvam_api_key
        }
        
        # Complete Sarvam Saaras Indian BCP-47 language mapping
        sarvam_lang_map = {
            "kn": "kn-IN", "kannada": "kn-IN",
            "te": "te-IN", "telugu": "te-IN",
            "ta": "ta-IN", "tamil": "ta-IN",
            "mr": "mr-IN", "marathi": "mr-IN",
            "kok": "mr-IN", "konkani": "mr-IN",  # Sarvam processes Konkani via Marathi/Devanagari model
            "hi": "hi-IN", "hindi": "hi-IN", "hinglish": "hi-IN",
            "bn": "bn-IN", "bengali": "bn-IN",
            "gu": "gu-IN", "gujarati": "gu-IN",
            "ml": "ml-IN", "malayalam": "ml-IN",
            "pa": "pa-IN", "punjabi": "pa-IN",
            "or": "or-IN", "odia": "or-IN",
            "as": "as-IN", "assamese": "as-IN",
            "ne": "ne-NP", "nepali": "ne-NP",
            "en": "en-IN", "english": "en-IN",
            "auto": "unknown"
        }
        
        norm_code = language_code.lower().split("-")[0]
        sarvam_lang = sarvam_lang_map.get(norm_code, "en-IN")
        if language_code.lower() == "auto":
            sarvam_lang = "unknown"
            
        files = {
            "file": (filename if filename.endswith(('.wav', '.mp3', '.m4a', '.webm')) else "audio.wav", audio_bytes, "audio/wav")
        }
        data = {
            "language_code": sarvam_lang,
            "model": "saaras:v3"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.sarvam_endpoint, headers=headers, data=data, files=files)
            resp.raise_for_status()
            res_json = resp.json()
            transcript = res_json.get("transcript", "")
            return transcript, {"raw": res_json}

    async def _transcribe_elevenlabs(self, audio_bytes: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
        headers = {
            "xi-api-key": settings.elevenlabs_api_key
        }
        files = {
            "file": (filename or "audio.mp3", audio_bytes, "audio/mpeg")
        }
        data = {
            "model_id": "scribe_v1"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(self.elevenlabs_endpoint, headers=headers, data=data, files=files)
            resp.raise_for_status()
            res_json = resp.json()
            transcript = res_json.get("text", "")
            return transcript, {"raw": res_json}

stt_service = SpeechToTextService()
