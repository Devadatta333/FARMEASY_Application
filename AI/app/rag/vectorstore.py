import shutil
import logging
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import settings

logger = logging.getLogger(__name__)

def get_embeddings():
    """Instantiate Google Generative AI embeddings matching configuration."""
    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.google_api_key,
    )

def index_exists() -> bool:
    """Check if a valid FAISS index exists in the configured directory."""
    index_path = Path(settings.index_dir)
    faiss_file = index_path / "index.faiss"
    pkl_file = index_path / "index.pkl"
    return index_path.is_dir() and faiss_file.is_file() and pkl_file.is_file()

def build_index(chunks):
    """Build and atomically save FAISS vector index to prevent corruption."""
    if not chunks:
        raise ValueError("Cannot build index from empty document chunks.")

    logger.info(f"Generating embeddings for {len(chunks)} chunks...")
    embeddings = get_embeddings()
    vs = FAISS.from_documents(chunks, embeddings)

    target_dir = Path(settings.index_dir)
    temp_dir = target_dir.parent / (target_dir.name + "_tmp")

    try:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        temp_dir.mkdir(parents=True, exist_ok=True)

        vs.save_local(str(temp_dir))

        # Verify generated files
        if not (temp_dir / "index.faiss").exists() or not (temp_dir / "index.pkl").exists():
            raise RuntimeError("FAISS files failed to serialize during save_local.")

        # Atomic replacement of target directory
        if target_dir.exists():
            backup_dir = target_dir.parent / (target_dir.name + "_old")
            if backup_dir.exists():
                shutil.rmtree(backup_dir)
            target_dir.rename(backup_dir)
            temp_dir.rename(target_dir)
            shutil.rmtree(backup_dir, ignore_errors=True)
        else:
            temp_dir.rename(target_dir)

        logger.info(f"Successfully saved FAISS index to {target_dir}")
        return vs
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)

def load_index():
    """Load existing verified FAISS index."""
    if not index_exists():
        raise FileNotFoundError(
            f"FAISS index files not found in '{settings.index_dir}'. Ingestion must be executed first."
        )

    # Safe: the index is generated strictly locally by your own ingest script, never user-uploaded
    return FAISS.load_local(
        settings.index_dir,
        get_embeddings(),
        allow_dangerous_deserialization=True
    )