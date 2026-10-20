from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class ChatMessage(BaseModel):
    role: str = Field(description="Role of message sender: 'user' or 'assistant'")
    content: str = Field(description="Content of message")

class CatalogItem(BaseModel):
    name: str
    category: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = "kg"
    quantity: Optional[int] = 0

class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000, description="User's query")
    role: str = Field(default="farmer", description="User role verified by backend: 'farmer', 'consumer', or 'admin'")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Recent conversation turns")
    catalog: Optional[List[CatalogItem]] = Field(default=None, description="Available marketplace items for consumer recommendations")

    @field_validator("question")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Question must contain at least 2 non-whitespace characters.")
        return trimmed

class Source(BaseModel):
    source: str
    snippet: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)

class HealthResponse(BaseModel):
    ok: bool
    index_loaded: bool
    chat_model: str
    embedding_model: str

class IngestResponse(BaseModel):
    status: str
    documents: int
    chunks: int