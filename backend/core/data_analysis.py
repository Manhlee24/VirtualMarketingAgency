import json
import logging
import time
import random
from google.genai import types
from models.schemas import ProductAnalysisResult
from core.ai_clients import get_gemini_client, GEMINI_API_KEY

logger = logging.getLogger(__name__)
# Reduce noisy logs from Google SDK if desired
try:
    logging.getLogger("google").setLevel(logging.WARNING)
    logging.getLogger("google.genai").setLevel(logging.WARNING)
except Exception:
    pass

def analyze_product_data(product_name: str) -> ProductAnalysisResult | None:
    """
    Sử dụng Gemini API với chức năng tìm kiếm web để phân tích và trích xuất dữ liệu.
    """
    
    # Kỹ thuật Prompt Engineering
    prompt = f"""
    Conduct market research for the product: '{product_name}'.
Using publicly available search data, analyze and extract the following parameters:

1. At least 3 Unique Selling Points (USPs) of the product.

2. At least 3 Customer Pain Points that the product addresses.

3. A brief description of the Target Customer Persona for this product.

4. Key Product Specifications.

The output must be a valid JSON object (no additional text outside the JSON)
with the following keys: 'usps' (list of strings), 'pain_points' (list of strings), 'infor' (string), and 'target_persona' (string)
Use Vietnamese language for all outputs.
    """

    try:
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            return None

        cfg = types.GenerateContentConfig(tools=[{"google_search": {}}]) if hasattr(types, "GenerateContentConfig") else None
        logger.debug("Gemini config prepared: %s", cfg)

        def do_call(model_name: str, use_cfg: bool):
            if hasattr(client, "models") and hasattr(client.models, "generate_content"):
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=(cfg if use_cfg else None)
                )
            elif hasattr(client, "generate_content"):
                # Fallback without tools config
                return client.generate_content(prompt)
            return None

        # Retry with exponential backoff and final fallback model/config
        response = None
        last_err = None
        models_try = [
            ("gemini-2.5-flash", True),
            ("gemini-2.5-flash", True),
            ("gemini-2.5-flash", False),
            ("gemini-1.5-flash", False),
        ]
        for attempt, (model_name, use_cfg) in enumerate(models_try, start=1):
            try:
                response = do_call(model_name, use_cfg)
                if response and getattr(response, "text", None):
                    break
                else:
                    raise RuntimeError("Empty response text from Gemini")
            except Exception as e:
                last_err = e
                msg = str(e)
                # Backoff only for transient overloads/timeouts
                if attempt < len(models_try) and any(t in msg for t in ["503", "UNAVAILABLE", "overloaded", "timeout", "temporarily"]):
                    delay = min(2 ** attempt + random.uniform(0, 0.5), 8)
                    logging.info("Gemini call failed (attempt %d/%d, model=%s, cfg=%s). Retrying in %.1fs...", attempt, len(models_try), model_name, use_cfg, delay)
                    time.sleep(delay)
                    continue
                else:
                    logging.warning("Gemini call failed (attempt %d/%d): %s", attempt, len(models_try), msg)
                    if attempt < len(models_try):
                        continue
                    break

        if not response or not getattr(response, "text", None):
            print(f"Gemini API không trả về nội dung văn bản cho sản phẩm: {product_name}")
            if last_err:
                print(f"Lỗi API Gemini hoặc lỗi kết nối chung: {last_err}")
            return None
            
        try:
            json_text = response.text.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(json_text)
        except json.JSONDecodeError as e:

            logger.warning("Lỗi phân tích JSON từ Gemini: %s", e)
            logger.debug("Text gốc gây lỗi: %s", getattr(response, "text", "")[:1000])
            # Có thể trả về kết quả rỗng nếu không thể đọc được
            return None

        # Normalize fields to expected types (ProductAnalysisResult expects strings for some fields)
        def ensure_list_of_str(v):
            if v is None:
                return []
            if isinstance(v, list):
                return [str(x) for x in v]
            if isinstance(v, str):
                # try splitting by newline or comma if it looks like a single string list
                if "\n" in v:
                    return [s.strip() for s in v.splitlines() if s.strip()]
                if "," in v:
                    return [s.strip() for s in v.split(",") if s.strip()]
                return [v]
            # fallback: stringify
            return [str(v)]

        def ensure_str(v):
            if v is None:
                return "Chưa xác định"
            if isinstance(v, str):
                return v
            if isinstance(v, list):
                return ", ".join(str(x) for x in v)
            if isinstance(v, dict):
                # Prefer a concise representation
                try:
                    return json.dumps(v, ensure_ascii=False)
                except Exception:
                    return str(v)
            return str(v)

        logger.debug("Parsed Gemini data: %s", data)

        usps = ensure_list_of_str(data.get('usps'))
        pain_points = ensure_list_of_str(data.get('pain_points'))
        target_persona = ensure_str(data.get('target_persona'))
        infor_field = ensure_str(data.get('infor'))

        return ProductAnalysisResult(
            product_name=product_name,
            usps=usps,
            pain_points=pain_points,
            target_persona=target_persona,
            infor=infor_field,
        )
        
    except Exception as e:
        print(f"Lỗi API Gemini hoặc lỗi kết nối chung: {e}")
        return None