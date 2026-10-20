import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.rag.loaders import is_safe_url, split
from app.rag.vectorstore import index_exists, load_index
from langchain_core.documents import Document

class TestFarmEasyAIService(unittest.TestCase):
    def test_01_ssrf_url_validation(self):
        """Verify SSRF protection strictly blocks internal, loopback, and metadata addresses."""
        self.assertFalse(is_safe_url("http://127.0.0.1/admin"))
        self.assertFalse(is_safe_url("http://localhost:8080"))
        self.assertFalse(is_safe_url("http://169.254.169.254/latest/meta-data"))
        self.assertFalse(is_safe_url("http://10.0.0.1/secret"))
        self.assertFalse(is_safe_url("http://192.168.1.1"))
        self.assertFalse(is_safe_url("ftp://example.com/file"))
        self.assertFalse(is_safe_url("file:///etc/passwd"))
        self.assertTrue(is_safe_url("https://example.com"))

    def test_02_document_chunking(self):
        """Verify document chunking retains content and source metadata."""
        docs = [
            Document(page_content="Fertilizer application in rice requires careful NPK balance. " * 30, metadata={"source": "rice_guide.txt"})
        ]
        chunks = split(docs)
        self.assertGreater(len(chunks), 1)
        self.assertEqual(chunks[0].metadata["source"], "rice_guide.txt")

    def test_03_faiss_index_exists_and_loads(self):
        """Verify that the generated FAISS index is valid and loaded."""
        self.assertTrue(index_exists())
        vs = load_index()
        self.assertIsNotNone(vs)
        results = vs.similarity_search("tomato", k=2)
        self.assertGreater(len(results), 0)
        self.assertIsNotNone(results[0].metadata.get("source"))

    def test_04_health_endpoint(self):
        """Verify unauthenticated health check endpoint with lifespan active."""
        with TestClient(app) as client:
            response = client.get("/health")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data["ok"])
            self.assertTrue(data["index_loaded"])
            self.assertIn("chat_model", data)

    def test_05_chat_unauthorized(self):
        """Verify that unauthorized requests without X-Internal-Key are rejected."""
        with TestClient(app) as client:
            response = client.post("/chat", json={"question": "What is wheat?"})
            self.assertEqual(response.status_code, 401)

    def test_06_chat_invalid_key(self):
        """Verify that requests with incorrect X-Internal-Key are rejected."""
        with TestClient(app) as client:
            response = client.post(
                "/chat",
                headers={"X-Internal-Key": "wrong-secret-key"},
                json={"question": "What is wheat?"}
            )
            self.assertEqual(response.status_code, 401)

    def test_07_chat_validation_empty_question(self):
        """Verify that empty or whitespace-only questions fail validation."""
        with TestClient(app) as client:
            response = client.post(
                "/chat",
                headers={"X-Internal-Key": settings.internal_api_key},
                json={"question": "     "}
            )
            self.assertEqual(response.status_code, 422)

    def test_08_chat_authenticated_flow(self):
        """Verify complete authenticated chat flow with Gemini and FAISS."""
        with TestClient(app) as client:
            response = client.post(
                "/chat",
                headers={"X-Internal-Key": settings.internal_api_key},
                json={
                    "question": "How do I prevent late blight in tomato?",
                    "role": "farmer"
                }
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("answer", data)
            self.assertGreater(len(data["answer"]), 20)
            self.assertIn("sources", data)
            self.assertIsInstance(data["sources"], list)
            self.assertGreater(len(data["sources"]), 0)

if __name__ == "__main__":
    unittest.main()
