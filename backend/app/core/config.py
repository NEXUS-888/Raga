import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ensure .env is explicitly loaded from backend directory regardless of CWD
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(env_path), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "HH Goa Voice RAG Pipeline"
    app_version: str = "1.0.0"
    debug: bool = True

    # STT Provider Settings
    stt_provider: str = os.getenv("STT_PROVIDER", "groq")  # "groq", "sarvam", "elevenlabs"
    sarvam_api_key: str = os.getenv("SARVAM_API_KEY", "")
    elevenlabs_api_key: str = os.getenv("ELEVENLABS_API_KEY", "")

    # LLM Settings (for sub-200ms generation)
    llm_provider: str = os.getenv("LLM_PROVIDER", "groq")  # "groq", "gemini", or "mock"
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "groq/compound-mini")

    # Latency Constraints (ms)
    latency_target_ms: float = 200.0
    embedding_dimension: int = 128

    # Dataset Settings
    dataset_name: str = "ai4bharat/MSMARCO-XI"
    default_language: str = "en"  # "en", "hi", "multilingual"
    default_chunking_strategy: str = "recursive_hierarchical"

    # Guardrail Thresholds
    grounding_threshold: float = 0.55
    safety_toxicity_threshold: float = 0.70
    topic_similarity_threshold: float = 0.25

    # CORS
    allowed_origins: List[str] = ["*"]
    allowed_methods: List[str] = ["*"]
    allowed_headers: List[str] = ["*"]

settings = Settings()
