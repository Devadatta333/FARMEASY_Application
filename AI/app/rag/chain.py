import logging
import time
from typing import List, Tuple, Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.schemas import ChatMessage, CatalogItem

logger = logging.getLogger(__name__)

# Specialized System Prompt for Farmers
FARMER_SYSTEM_PROMPT = """You are FarmEasy AI, an expert agricultural advisor dedicated to Indian farmers.
You provide clear, practical, and scientifically sound advice on:
- Crop cultivation, sowing schedules, and field preparation
- Soil health, fertilizers (NPK), micro-nutrients, and organic manures
- Integrated pest, disease, and weed management with eco-friendly remedies
- Water conservation, drip irrigation, and micro-climate management

Strict Guidelines:
1. Ground your answer in the provided agricultural Reference Context whenever available.
2. If the Reference Context does not contain the answer, draw upon established agronomic best practices for Indian agriculture, but explicitly state that specific local guidance is not in the indexed knowledgebase and suggest consulting a local Krishi Vigyan Kendra (KVK) or agriculture officer.
3. NEVER fabricate citations, document titles, or facts.
4. DO NOT claim to have live weather readings or live market prices unless provided directly in the prompt.
5. Answer in the same language as the farmer's question (e.g., English, Hindi, Telugu, Tamil, Marathi, etc.).
6. Keep recommendations actionable, practical, and easy to understand for working farmers.

Reference Context:
{context}
"""

# Specialized System Prompt for Consumers
CONSUMER_SYSTEM_PROMPT = """You are FarmEasy AI, a knowledgeable marketplace assistant for consumers purchasing fresh farm produce.
You assist shoppers with:
- Produce quality, ripeness assessment, and seasonal availability
- Optimal domestic storage guidelines to keep fruits, vegetables, and grains fresh
- Nutritional information, culinary uses, and handling tips
- Recommending farm-fresh products available on FarmEasy

Strict Guidelines:
1. Ground your advice in the provided Reference Context and the Live Marketplace Catalog below.
2. If recommending products, ONLY suggest items that appear in the Live Marketplace Catalog with their actual prices and units. NEVER invent fake products, prices, farmer names, or discount claims.
3. If the user asks about purchasing items not in the catalog, politely let them know those items are currently not in stock on FarmEasy.
4. NEVER fabricate sources or citations.
5. Answer in the same language as the user's question.
6. Maintain a welcoming, helpful, and courteous tone.

Reference Context:
{context}

Live Marketplace Catalog:
{catalog_info}
"""

def get_candidate_models() -> List[str]:
    """Return ordered list of models to try for resilience against rate limits and demand spikes."""
    models = [settings.chat_model]
    if hasattr(settings, "fallback_models") and settings.fallback_models:
        for m in settings.fallback_models.split(","):
            m = m.strip()
            if m and m not in models:
                models.append(m)
    return models

def get_llm(model_name: str):
    """Instantiate ChatGoogleGenerativeAI with the given model name."""
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=settings.google_api_key,
        temperature=0.2,
        timeout=30,
        max_retries=1,
    )

def format_catalog(catalog: Optional[List[CatalogItem]]) -> str:
    """Format available marketplace catalog items into clean prompt text."""
    if not catalog:
        return "No specific live catalog items provided for this query."
    
    lines = ["Available FarmEasy Products:"]
    for item in catalog:
        cat_str = f" [{item.category}]" if item.category else ""
        price_str = f" - Rs. {item.price}/{item.unit or 'unit'}" if item.price is not None else ""
        stock_str = f" ({item.quantity} in stock)" if item.quantity is not None else ""
        lines.append(f"- {item.name}{cat_str}{price_str}{stock_str}")
    return "\n".join(lines)

def build_history_messages(history: Optional[List[ChatMessage]]):
    """Convert history schemas to LangChain message objects, bounded to last 6 turns."""
    if not history:
        return []
    bounded = history[-6:]
    messages = []
    for msg in bounded:
        if msg.role.lower() in ("user", "human"):
            messages.append(HumanMessage(content=msg.content))
        elif msg.role.lower() in ("assistant", "ai", "bot"):
            messages.append(AIMessage(content=msg.content))
    return messages

def clean_llm_output(output: Any) -> str:
    """Extract string cleanly across different LangChain output formats."""
    if isinstance(output, str):
        return output.strip()
    if isinstance(output, list):
        parts = []
        for block in output:
            if isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
            elif hasattr(block, "text"):
                parts.append(getattr(block, "text"))
            else:
                parts.append(str(block))
        return "\n".join(parts).strip()
    return str(output).strip()

def answer(
    vs,
    question: str,
    role: str = "farmer",
    history: Optional[List[ChatMessage]] = None,
    catalog: Optional[List[CatalogItem]] = None,
) -> Tuple[str, List[Dict[str, str]]]:
    """Execute RAG pipeline with candidate model failover and transient error recovery."""
    context_chunks = []
    sources = []

    if vs is not None:
        try:
            docs_with_scores = vs.similarity_search_with_score(question, k=settings.top_k)
            for doc, score in docs_with_scores:
                if score <= settings.score_threshold:
                    context_chunks.append(doc.page_content)
                    source_name = doc.metadata.get("source", "Agricultural Knowledgebase")
                    snippet = doc.page_content[:200].replace("\n", " ").strip()
                    if not any(s["source"] == source_name and s["snippet"] == snippet for s in sources):
                        sources.append({"source": source_name, "snippet": snippet})
        except Exception as e:
            logger.warning(f"FAISS retrieval error: {e}")

    context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else "No specific document context found for this query."

    is_consumer = role.lower() in ("consumer", "user")
    system_template = CONSUMER_SYSTEM_PROMPT if is_consumer else FARMER_SYSTEM_PROMPT
    catalog_text = format_catalog(catalog) if is_consumer else ""

    prompt_messages = [
        ("system", system_template),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ]
    prompt = ChatPromptTemplate.from_messages(prompt_messages)

    history_messages = build_history_messages(history)
    input_vars = {
        "context": context_text,
        "chat_history": history_messages,
        "question": question,
    }
    if is_consumer:
        input_vars["catalog_info"] = catalog_text

    models_to_try = get_candidate_models()
    last_error = None

    for model_name in models_to_try:
        try:
            logger.info(f"Invoking Gemini model '{model_name}'...")
            llm = get_llm(model_name)
            chain = prompt | llm | StrOutputParser()
            raw_response = chain.invoke(input_vars)
            answer_text = clean_llm_output(raw_response)
            return answer_text, sources
        except Exception as e:
            last_error = e
            err_str = str(e)
            logger.warning(f"Model '{model_name}' failed with {type(e).__name__}: {err_str[:80]}")
            # If 503, 429, or model not found, try the next model
            if any(err in err_str for err in ("503", "429", "RESOURCE_EXHAUSTED", "UNAVAILABLE", "NOT_FOUND")):
                time.sleep(1)
                continue
            # For other unexpected critical errors, re-raise
            raise e

    if last_error:
        raise last_error

    return "I am currently unable to generate a response. Please try again shortly.", sources