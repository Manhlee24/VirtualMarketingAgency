import os
import logging
from typing import Optional, Any
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Expose keys for optional logging elsewhere
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Optional SDK imports
try:
    from google import genai  # type: ignore
except Exception:
    genai = None  # type: ignore

try:
    from openai import OpenAI  # type: ignore
except Exception:
    OpenAI = None  # type: ignore

_gemini_client: Any = None
_openai_client: Any = None


def get_gemini_client() -> Optional[Any]:
    """Return a Gemini client instance if possible, else None.
    Keeps initialization minimal; individual modules decide model usage.
    """
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    if not GEMINI_API_KEY or genai is None:
        _gemini_client = None
        return _gemini_client
    # Prefer modern Client() if available, else return configured module
    try:
        if hasattr(genai, "Client"):
            _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        elif hasattr(genai, "configure"):
            genai.configure(api_key=GEMINI_API_KEY)
            _gemini_client = genai
        else:
            _gemini_client = None
    except Exception as e:
        logger.info("Gemini client init failed: %s", e)
        _gemini_client = None
    return _gemini_client


def get_openai_client() -> Optional[Any]:
    """Return an OpenAI client instance if possible, else None."""
    global _openai_client
    if _openai_client is not None:
        return _openai_client
    if OpenAI is None or not OPENAI_API_KEY:
        _openai_client = None
        return _openai_client
    try:
        _openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        logger.info("OpenAI client init failed: %s", e)
        _openai_client = None
    return _openai_client


__all__ = [
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "get_gemini_client",
    "get_openai_client",
]
