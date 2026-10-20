import logging
import secrets
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Depends, status
from app.config import settings
from app.schemas import ChatRequest, ChatResponse, HealthResponse, IngestResponse
from app.rag.vectorstore import load_index, index_exists
from app.rag.chain import answer
from app.rag.ingest import run_ingest

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("farmeasy_ai")

state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FarmEasy AI Service...")
    try:
        if index_exists():
            state["vs"] = load_index()
            logger.info("FAISS vector index loaded successfully into memory.")
        else:
            state["vs"] = None
            logger.warning("FAISS vector index not found. Run /ingest or 'python -m app.rag.ingest' to build it.")
    except Exception as e:
        logger.error(f"Failed to load FAISS index during startup: {e}")
        state["vs"] = None
    yield
    logger.info("Shutting down FarmEasy AI Service...")
    state.clear()

app = FastAPI(
    title="FarmEasy AI Service",
    description="Internal FastAPI AI service for FarmEasy platform with Gemini and FAISS RAG.",
    version="1.0.0",
    lifespan=lifespan
)

def verify_internal_auth(
    x_internal_key: Optional[str] = Header(None, alias="X-Internal-Key")
):
    """Authenticate internal service-to-service calls using shared secret."""
    if not x_internal_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Missing X-Internal-Key header"
        )
    if not secrets.compare_digest(x_internal_key, settings.internal_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid internal service key"
        )

@app.get("/health", response_model=HealthResponse)
def health():
    """Health check endpoint indicating service and vector index status."""
    return {
        "ok": True,
        "index_loaded": state.get("vs") is not None,
        "chat_model": settings.chat_model,
        "embedding_model": settings.embedding_model,
    }

@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_internal_auth)])
def chat(req: ChatRequest):
    """Process a user question through the RAG pipeline."""
    try:
        vs = state.get("vs")
        # Attempt lazy load if index was generated after startup
        if vs is None and index_exists():
            try:
                state["vs"] = load_index()
                vs = state["vs"]
            except Exception as e:
                logger.warning(f"Lazy index load failed: {e}")

        answer_text, sources = answer(
            vs=vs,
            question=req.question,
            role=req.role,
            history=req.history,
            catalog=req.catalog,
        )
        return {"answer": answer_text, "sources": sources}

    except HTTPException:
        raise
    except TimeoutError as te:
        logger.error(f"Chat request timed out: {te}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI generation request timed out. Please try again."
        )
    except Exception as e:
        err_msg = str(e)
        logger.error(f"Error processing chat request: {err_msg}", exc_info=True)

        if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini API quota exceeded or rate limit reached. Please wait a moment and try again."
            )
        if "NOT_FOUND" in err_msg and "models/" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Configured Gemini model not found or unsupported for this account."
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the AI response."
        )

@app.post("/ingest", response_model=IngestResponse, dependencies=[Depends(verify_internal_auth)])
def ingest():
    """Trigger vectorstore document ingestion and update in-memory index."""
    try:
        result = run_ingest()
        state["vs"] = load_index()
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )