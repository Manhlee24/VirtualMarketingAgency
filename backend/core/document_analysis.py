import os
import json
import logging
from dotenv import load_dotenv
from io import BytesIO
from typing import Optional
from core.ai_clients import get_gemini_client, GEMINI_API_KEY
from google.genai import types

# document parsing libraries
try:
    import docx
except Exception:
    docx = None

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

from models.schemas import GeneratedContentResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY không được tìm thấy. Vui lòng tạo file .env.")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a .docx file bytes."""
    if docx is None:
        logger.warning("python-docx not installed; cannot parse docx files.")
        return ""
    try:
        document = docx.Document(BytesIO(file_bytes))
        return "\n".join([p.text for p in document.paragraphs])
    except Exception as e:
        logger.warning("Error reading DOCX: %s", e)
        return ""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file bytes."""
    if PdfReader is None:
        logger.warning("pypdf not installed; cannot parse PDF files.")
        return ""
    try:
        reader = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.warning("Error reading PDF: %s", e)
        return ""


# NOTE: Product-level structured analysis removed per new requirement; only marketing generation retained.


def generate_marketing_from_document(product_name: str, file_bytes: bytes, file_type: str) -> Optional[GeneratedContentResponse]:
    """
    Extract text from a PDF/DOCX and use Gemini to generate marketing content (title + content).
    Returns a GeneratedContentResponse on success, otherwise None.
    """
    # Reuse extraction logic
    if file_type == 'pdf':
        full_document_text = extract_text_from_pdf(file_bytes)
    elif file_type == 'docx':
        full_document_text = extract_text_from_docx(file_bytes)
    else:
        logger.error("Unsupported file type for marketing generation: %s", file_type)
        return None

    if not full_document_text:
        logger.error("No text extracted from document for marketing generation.")
        return None

    MAX_TEXT_LENGTH = 15000
    truncated_text = full_document_text[:MAX_TEXT_LENGTH]

    prompt = f"""
You are a professional marketing copywriter. Based ONLY on the provided document content, produce a concise marketing package for the product '{product_name}'.

Requirements:
- Output must be a single JSON object and nothing else.
- The JSON must have two keys: "title" (a short engaging title) and "content" (the marketing copy, ~80-250 words).

Document Content:
---
{truncated_text}
---

Produce high-quality, persuasive ad copy suitable for use as an ad creative or short landing paragraph. Do not include analysis or metadata — only return the JSON object.
"""

    logger.info("Sending document to Gemini to generate marketing content (len=%d)...", len(truncated_text))

    try:
        client = get_gemini_client()
        if not client:
            logger.error("Gemini client not initialized; cannot generate marketing content.")
            return None
        resp = None
        cfg = types.GenerateContentConfig(response_mime_type="application/json") if hasattr(types, "GenerateContentConfig") else None
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            resp = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=cfg
            )
        elif hasattr(client, "generate_content"):
            resp = client.generate_content(prompt)
        else:
            logger.error("Gemini client lacks a known generate_content entrypoint.")
            return None

        text_out = getattr(resp, "text", None)
        if not text_out:
            logger.warning("Gemini returned empty text for marketing generation.")
            return None

        # Try to parse JSON first
        parsed = None
        try:
            parsed = json.loads(text_out.strip())
        except Exception:
            # try to clean fences if present
            cleaned = text_out.strip().replace('```json', '').replace('```', '').strip()
            try:
                parsed = json.loads(cleaned)
            except Exception:
                parsed = None

        if parsed and isinstance(parsed, dict):
            title = parsed.get('title') or parsed.get('headline') or f"{product_name}"
            content = parsed.get('content') or parsed.get('body') or json.dumps(parsed)
            return GeneratedContentResponse(title=title, content=content, prompt_used=prompt)

        # If parsing failed, fall back to using the full text as content
        # and derive a short title from the first sentence.
        fallback_content = text_out.strip()
        first_line = fallback_content.split('\n')[0][:120]
        title_guess = first_line if first_line else product_name
        return GeneratedContentResponse(title=title_guess, content=fallback_content, prompt_used=prompt)

    except Exception as e:
        logger.error("Error generating marketing content from document: %s", e)
        return None
