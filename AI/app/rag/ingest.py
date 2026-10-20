import logging
from app.rag.loaders import load_text, load_web, split
from app.rag.vectorstore import build_index

logger = logging.getLogger(__name__)

def run_ingest():
    """Execute complete ingestion pipeline: load documents, split chunks, build FAISS index."""
    logger.info("Starting FarmEasy document ingestion...")
    text_docs = load_text()
    web_docs = load_web()
    docs = text_docs + web_docs

    if not docs:
        raise ValueError(
            "No source documents found in data/raw or data/urls.txt. "
            "Please ensure text files are present in data/raw."
        )

    logger.info(f"Loaded {len(docs)} total documents ({len(text_docs)} text, {len(web_docs)} web).")
    chunks = split(docs)
    logger.info(f"Generated {len(chunks)} text chunks for embedding.")

    build_index(chunks)
    logger.info("Ingestion and FAISS index build completed successfully.")
    return {
        "status": "success",
        "documents": len(docs),
        "chunks": len(chunks),
    }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = run_ingest()
    print("Ingestion result:", res)