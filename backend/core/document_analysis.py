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

from models.schemas import GeneratedContentResponse, ProductAnalysisResult

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


def _guess_product_name_from_text(text: str) -> str:
    """Heuristically guess a product name from document text.
    Strategy: pick the first non-empty line that looks like a title (3-120 chars).
    Fallback to 'Sản phẩm'.
    """
    try:
        for raw in text.splitlines():
            line = (raw or "").strip()
            if not line:
                continue
            # skip very long or very short lines
            if 3 <= len(line) <= 120:
                return line
    except Exception:
        pass
    return "Sản phẩm"


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


def generate_competitive_analysis(product_name: str, competitor_keywords: str) -> ProductAnalysisResult | None:
    """
    Perform a competitive/market analysis using Gemini search tools and return a ProductAnalysisResult.
    """
    prompt = f"""
Bạn là một chuyên gia nghiên cứu thị trường có nhiệm vụ phân tích bối cảnh cạnh tranh cho sản phẩm: '{product_name}'.

Sử dụng công cụ tìm kiếm được cung cấp để thực hiện nghiên cứu về thị trường và các đối thủ tương tự {competitor_keywords}.

Nhiệm vụ:
1.  Xu hướng Thị trường (Trends): Tổng hợp 3 xu hướng, sự kiện, hoặc nhu cầu mới nhất trên thị trường liên quan đến sản phẩm này trong 6 tháng gần đây.
2.  Tóm tắt Đối thủ Cạnh tranh: Phân tích ít nhất 3 đối thủ cạnh tranh chính. Tóm tắt điểm mạnh và điểm yếu cốt lõi của họ (ví dụ: Đối thủ A mạnh về giá, yếu về pin).
3.  Khoảng trống Thị trường (Market Gap): Dựa trên phân tích đối thủ và xu hướng, xác định một khoảng trống hoặc nhu cầu chưa được đáp ứng mà sản phẩm '{product_name}' có thể tận dụng để định vị chiến lược.

Đầu ra phải là một đối tượng JSON HỢP LỆ, chỉ chứa các khóa: 'usps' (mảng), 'pain_points' (mảng), 'target_persona' (chuỗi), 'infor' (chuỗi). KHÔNG có văn bản bổ sung.
Sử dụng tiếng Việt cho tất cả các mô tả.
"""

    logger.info("Running competitive analysis for product '%s' (keywords: %s)", product_name, competitor_keywords)

    try:
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            logger.error("Gemini client or API key missing for competitive analysis.")
            return None

        cfg = types.GenerateContentConfig(tools=[{"google_search": {}}]) if hasattr(types, "GenerateContentConfig") else None

        response = None
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=cfg
            )
        elif hasattr(client, "generate_content"):
            response = client.generate_content(prompt)
        else:
            logger.error("Gemini client missing generate_content for competitive analysis.")
            return None

        if not response or not getattr(response, "text", None):
            logger.warning("Gemini returned no text for competitive analysis of %s", product_name)
            return None

        # Parse JSON, allowing for code fences
        try:
            json_text = response.text.strip().replace('```json', '').replace('```', '').strip()
            data = json.loads(json_text)
        except Exception as e:
            logger.warning("Failed to parse JSON from Gemini competitive analysis: %s", e)
            logger.debug("Raw response: %s", getattr(response, "text", "")[:2000])
            return None

        # Normalization helpers
        def ensure_list_of_str(v):
            if v is None:
                return []
            if isinstance(v, list):
                return [str(x) for x in v]
            if isinstance(v, str):
                if "\n" in v:
                    return [s.strip() for s in v.splitlines() if s.strip()]
                if "," in v:
                    return [s.strip() for s in v.split(",") if s.strip()]
                return [v]
            return [str(v)]

        def ensure_str(v):
            if v is None:
                return "Chưa xác định"
            if isinstance(v, str):
                return v
            if isinstance(v, list):
                return ", ".join(str(x) for x in v)
            if isinstance(v, dict):
                try:
                    return json.dumps(v, ensure_ascii=False)
                except Exception:
                    return str(v)
            return str(v)

        usps = ensure_list_of_str(data.get('usps'))
        pain_points = ensure_list_of_str(data.get('pain_points'))
        target_persona = ensure_str(data.get('target_persona'))
        infor_field = ensure_str(data.get('infor'))

        try:
            return ProductAnalysisResult(
                product_name=product_name,
                usps=usps,
                pain_points=pain_points,
                target_persona=target_persona,
                infor=infor_field,
            )
        except Exception as e:
            logger.error("Error constructing ProductAnalysisResult: %s", e)
            return None

    except Exception as e:
        logger.error("Error running competitive analysis: %s", e)
        return None


def generate_product_analysis_from_document(product_name: str, file_bytes: bytes, file_type: str) -> ProductAnalysisResult | None:
    """
    Extract text from an uploaded document (PDF/DOCX) and analyze it to produce
    a ProductAnalysisResult (usps, pain_points, target_persona, infor).

    This function mirrors the output shape of `data_analysis.analyze_product_data` so
    downstream marketing generation can re-use the same schema.
    """
    # Extract text
    if file_type == 'pdf':
        full_document_text = extract_text_from_pdf(file_bytes)
    elif file_type == 'docx':
        full_document_text = extract_text_from_docx(file_bytes)
    else:
        logger.error("Unsupported file type for product analysis: %s", file_type)
        return None

    if not full_document_text:
        logger.error("No text extracted from document for product analysis.")
        return None

    MAX_TEXT_LENGTH = 15000
    truncated_text = full_document_text[:MAX_TEXT_LENGTH]

    # If product_name is missing/empty, try to guess from the document text
    effective_product_name = product_name.strip() if product_name else ""
    if not effective_product_name:
        effective_product_name = _guess_product_name_from_text(truncated_text)

    prompt = f"""
Bạn là một chuyên gia phân tích sản phẩm dành cho mục đích marketing. Dựa CHỈ trên nội dung tài liệu được cung cấp dưới đây và tên sản phẩm, hãy trích xuất các thông tin cấu trúc phù hợp để phục vụ việc tạo nội dung quảng cáo và định vị sản phẩm.

Input:
- product_name: "{effective_product_name}"
- document_text:
---
{truncated_text}
---

Yêu cầu đầu ra (bắt buộc):
Trả về DUY NHẤT một OBJECT JSON hợp lệ có các khóa: "usps" (mảng các chuỗi), "pain_points" (mảng các chuỗi), "target_persona" (chuỗi), và "infor" (chuỗi gồm tối đa 5 từ khóa/cụm, cách nhau bằng dấu phẩy).

Quy tắc:
1) "usps": trả về 3–6 điểm bán hàng nổi bật (mỗi mục ngắn 3–20 từ). Nếu không đủ thông tin, trả về những gì suy luận được.
2) "pain_points": trả về 3–6 điểm đau khách hàng (mỗi mục 3–20 từ). Nếu không có, trả về mảng rỗng.
3) "target_persona": một đoạn 1–3 câu (20–60 từ) mô tả khách hàng mục tiêu.
4) "infor": tối đa 5 từ khoá/ngắn cụm, là các thông số kỹ thuật hoặc tính năng nổi bật.
5) Chỉ dựa trên "document_text" và "product_name" — KHÔNG thêm thông tin từ Internet.
6) Trả về duy nhất JSON, không có chú thích, không có markdown hoặc code fences.
"""

    logger.info("Generating product analysis from document for '%s' (len=%d)...", product_name, len(truncated_text))

    try:
        client = get_gemini_client()
        if not client:
            logger.error("Gemini client not initialized; cannot generate product analysis from document.")
            return None

        cfg = types.GenerateContentConfig(response_mime_type="application/json") if hasattr(types, "GenerateContentConfig") else None

        response = None
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=cfg
            )
        elif hasattr(client, "generate_content"):
            response = client.generate_content(prompt)
        else:
            logger.error("Gemini client missing generate_content for document product analysis.")
            return None

        if not response or not getattr(response, "text", None):
            logger.warning("Gemini returned no text for document product analysis of %s", product_name)
            return None

        # Parse and normalize
        try:
            json_text = response.text.strip().replace('```json', '').replace('```', '').strip()
            data = json.loads(json_text)
        except Exception as e:
            logger.warning("Failed to parse JSON from Gemini document analysis: %s", e)
            logger.debug("Raw response: %s", getattr(response, "text", "")[:2000])
            return None

        # Reuse normalization helpers (same behavior as data_analysis.analyze_product_data)
        def ensure_list_of_str(v):
            if v is None:
                return []
            if isinstance(v, list):
                return [str(x) for x in v]
            if isinstance(v, str):
                if "\n" in v:
                    return [s.strip() for s in v.splitlines() if s.strip()]
                if "," in v:
                    return [s.strip() for s in v.split(",") if s.strip()]
                return [v]
            return [str(v)]

        def ensure_str(v):
            if v is None:
                return "Chưa xác định"
            if isinstance(v, str):
                return v
            if isinstance(v, list):
                return ", ".join(str(x) for x in v)
            if isinstance(v, dict):
                try:
                    return json.dumps(v, ensure_ascii=False)
                except Exception:
                    return str(v)
            return str(v)

        usps = ensure_list_of_str(data.get('usps'))
        pain_points = ensure_list_of_str(data.get('pain_points'))
        target_persona = ensure_str(data.get('target_persona'))
        infor_field = ensure_str(data.get('infor'))

        try:
            return ProductAnalysisResult(
                product_name=effective_product_name,
                usps=usps,
                pain_points=pain_points,
                target_persona=target_persona,
                infor=infor_field,
            )
        except Exception as e:
            logger.error("Error constructing ProductAnalysisResult from document: %s", e)
            return None

    except Exception as e:
        logger.error("Error generating product analysis from document: %s", e)
        return None
