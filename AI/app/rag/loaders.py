import ipaddress
import logging
import socket
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import requests
from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

logger = logging.getLogger(__name__)

def is_safe_url(url: str) -> bool:
    """Validate URL to prevent SSRF and malicious protocol execution."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        
        hostname = parsed.hostname
        if not hostname:
            return False
        
        # Disallow localhost / local names directly
        if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
            return False

        # Resolve hostname to check for private / loopback IP address ranges
        addr_info = socket.getaddrinfo(hostname, None)
        for _, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                logger.warning(f"Blocked SSRF attempt to non-public IP: {ip_str} for URL {url}")
                return False
                
        return True
    except Exception as e:
        logger.warning(f"Failed URL safety validation for {url}: {e}")
        return False

def load_text(raw_dir=None):
    """Load all plain text documents from the configured directory."""
    dir_path = Path(raw_dir or settings.raw_data_dir)
    if not dir_path.exists():
        dir_path.mkdir(parents=True, exist_ok=True)
        return []

    loader = DirectoryLoader(
        str(dir_path),
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    docs = loader.load()
    for d in docs:
        # Standardize source metadata to file name for clean display
        source_path = Path(d.metadata.get("source", ""))
        d.metadata["source"] = source_path.name or "Document"
        d.metadata["type"] = "file"
    return docs

def load_web(urls_file=None):
    """Safely fetch and parse web documents from configured URL list."""
    p = Path(urls_file or settings.urls_file)
    if not p.exists():
        return []

    urls = [
        u.strip() for u in p.read_text(encoding="utf-8").splitlines()
        if u.strip() and not u.startswith("#")
    ]
    
    docs = []
    headers = {"User-Agent": "FarmEasy-Agronomy-Ingester/1.0 (Agricultural Intelligence)"}

    for url in urls:
        if not is_safe_url(url):
            logger.warning(f"Skipping unsafe or invalid URL: {url}")
            continue

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code != 200:
                logger.warning(f"Failed to fetch {url}: HTTP {resp.status_code}")
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            # Remove scripts, styles, navigation, headers, footers
            for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "iframe"]):
                tag.decompose()

            text = soup.get_text(separator="\n", strip=True)
            if len(text) > 100:  # Minimum substantive content check
                # Bound maximum document length to prevent memory exhaustion
                bounded_text = text[:60000]
                docs.append(Document(
                    page_content=bounded_text,
                    metadata={"source": url, "type": "web"}
                ))
        except Exception as e:
            logger.warning(f"Error fetching URL {url}: {e}")
            continue

    return docs

def split(docs):
    """Split documents into semantic chunks with overlap."""
    if not docs:
        return []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", " ", ""]
    )
    return splitter.split_documents(docs)