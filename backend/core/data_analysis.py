import json
import logging
from google.genai import types
from models.schemas import ProductAnalysisResult
from core.ai_clients import get_gemini_client, GEMINI_API_KEY

logger = logging.getLogger(__name__)

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

4. Key Product Specifications, only using 5 short keywords.

The output must be a valid JSON object (no additional text outside the JSON)
with the following keys: 'usps' (list of strings), 'pain_points' (list of strings), 'infor' (string), and 'target_persona' (string)
    """

    try:
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            return None
        response = None
        cfg = types.GenerateContentConfig(tools=[{"google_search": {}}]) if hasattr(types, "GenerateContentConfig") else None
        # don't concatenate object to string; use comma or f-string to safely represent cfg
        print("cfg:", cfg)
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=cfg
            )
            print("response of gemini-2.5-flash")
        elif hasattr(client, "generate_content"):
            # Fallback without tools config
            response = client.generate_content(prompt)
        
        # 1. KIỂM TRA NỘI DUNG PHẢN HỒI (KHẮC PHỤC 'NoneType' object has no attribute 'strip')
        if not response or not getattr(response, "text", None):
            print(f"Gemini API không trả về nội dung văn bản cho sản phẩm: {product_name}")
            return None
            
        # 2. XỬ LÝ VÀ PHÂN TÍCH JSON
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
        # Bắt các lỗi kết nối hoặc lỗi API chung khác
        print(f"Lỗi API Gemini hoặc lỗi kết nối chung: {e}")
        return None