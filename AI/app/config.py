from pathlib import Path
from pydantic_settings import BaseSettings

# Base directory for the AI application
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    google_api_key: str
    chat_model: str = "gemini-3.6-flash"
    fallback_models: str = "gemini-3.6-flash,gemini-3.5-flash,gemini-3.8-flash"
    embedding_model: str = "models/gemini-embedding-001"
    index_dir: str = str(BASE_DIR / "data" / "faiss_index")
    raw_data_dir: str = str(BASE_DIR / "data" / "raw")
    urls_file: str = str(BASE_DIR / "data" / "urls.txt")
    internal_api_key: str = "long-random-string"
    top_k: int = 4
    score_threshold: float = 1.3  # FAISS L2 distance threshold

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"

settings = Settings()