import json
import logging
from typing import Optional
from google.genai import types
from core.ai_clients import get_gemini_client, GEMINI_API_KEY

logger = logging.getLogger(__name__)


def analyze_competitor_market(competitor_name: str) -> dict | None:
    """
    Sử dụng Gemini API với chức năng tìm kiếm web để phân tích chiến lược thị trường 
    của đối thủ cạnh tranh.
    
    Args:
        competitor_name: Tên đối thủ cạnh tranh cần phân tích
        
    Returns:
        dict: Kết quả phân tích theo cấu trúc JSON định sẵn hoặc None nếu có lỗi
    """
    
    # Prompt Engineering để lấy phân tích chi tiết
    prompt = f"""Thực hiện phân tích chuyên sâu về chiến lược thị trường của đối thủ cạnh tranh trực tiếp: '{competitor_name}'.

Sử dụng tính năng tìm kiếm web công khai, phân tích và trích xuất thông tin theo 4 hạng mục chính dưới đây.

Đầu ra BẮT BUỘC phải là một **ĐỐI TƯỢNG JSON HỢP LỆ** (JSON Object). KHÔNG thêm bất kỳ văn bản giới thiệu, giải thích, hoặc kết luận nào ngoài khối JSON.

Sử dụng ngôn ngữ Tiếng Việt cho tất cả các kết quả.

Cấu trúc JSON phải là:

{{
  "product_name": "Tên sản phẩm của đối thủ",
  "product_analysis": {{
    "usps": [
      "Điểm bán hàng độc đáo 1 (3-5 điểm)",
      "Điểm bán hàng độc đáo 2",
      "..."
    ],
    "key_specs": "Thông số kỹ thuật nổi bật (tốc độ, độ bền, dung lượng, chất liệu).",
    "quality_feedback": "Tóm tắt phản hồi chung của khách hàng về chất lượng và độ tin cậy/tỷ lệ lỗi.",
    "pricing_strategy": "Họ định giá (cao cấp, trung bình, rẻ) và chiến lược giảm giá, khuyến mãi, gói dịch vụ."
  }},
  "customer_focus": {{
    "target_persona": "Mô tả nhóm tuổi, thu nhập, sở thích hoặc nhu cầu cụ thể họ nhắm đến.",
    "missed_segments": "Phân khúc khách hàng nào họ có vẻ bỏ lỡ hoặc phục vụ kém (cơ hội cho sản phẩm của tôi).",
    "pain_points": [
      "Vấn đề khách hàng thường phàn nàn về sản phẩm/dịch vụ của đối thủ 1",
      "Vấn đề 2",
      "..."
    ],
    "customer_journey": "Tóm tắt trải nghiệm mua hàng (online/offline) và dịch vụ sau bán hàng (bảo hành, hỗ trợ)."
  }},
  "marketing_strategy": {{
    "key_channels": "Các kênh truyền thông chính họ chi tiêu nhiều nhất (Facebook Ads, TikTok, SEO, TVC) và tần suất hoạt động/tương tác trên mạng xã hội.",
    "core_messaging": "Thông điệp cốt lõi họ truyền tải về sản phẩm và mức độ khác biệt so với thị trường.",
    "content_creative": "Các loại nội dung hiệu quả nhất (video, bài viết chuyên sâu) và việc sử dụng KOLs/Influencers."
  }},
  "distribution_market": {{
    "distribution_channels": "Các kênh phân phối (Siêu thị, chuỗi bán lẻ, website riêng, Sàn TMĐT) và mức độ bao phủ thị trường.",
    "market_share_estimate": "Ước tính mức độ thống trị/thị phần của họ trên thị trường."
  }}
}}"""

    try:
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            logger.error("Gemini client không khả dụng hoặc API key không được cấu hình")
            return None
        
        response = None
        # Cấu hình để sử dụng Google Search
        cfg = types.GenerateContentConfig(
            tools=[{"google_search": {}}]
        ) if hasattr(types, "GenerateContentConfig") else None
        
        logger.info(f"Đang phân tích đối thủ cạnh tranh: {competitor_name}")
        
        # Gọi Gemini API với Google Search
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=cfg
            )
        elif hasattr(client, "generate_content"):
            # Fallback nếu không có tools config
            response = client.generate_content(prompt)
        else:
            logger.error("Không thể gọi generate_content từ Gemini client")
            return None
        
        # Xử lý response an toàn (có thể text bị None)
        raw_text = getattr(response, "text", None)
        if not raw_text:
            logger.warning("Gemini trả về response không có text cho đối thủ '%s'", competitor_name)
            return None

        raw_text = raw_text.strip()
        logger.info("Phản hồi từ Gemini: %s...", raw_text[:200])

        # Làm sạch markdown code fences nếu có
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()

        # Thử parse trực tiếp
        try:
            parsed_data = json.loads(cleaned)
            logger.info("Phân tích đối thủ thành công")
            return parsed_data
        except json.JSONDecodeError:
            # Thử tìm đoạn JSON cân bằng dấu ngoặc
            def _balanced_json_fragment(text: str):
                start = text.find('{')
                if start == -1:
                    return None
                depth = 0
                in_string = False
                escape = False
                for i in range(start, len(text)):
                    ch = text[i]
                    if in_string:
                        if escape:
                            escape = False
                        elif ch == '\\':
                            escape = True
                        elif ch == '"':
                            in_string = False
                    else:
                        if ch == '"':
                            in_string = True
                        elif ch == '{':
                            depth += 1
                        elif ch == '}':
                            depth -= 1
                            if depth == 0:
                                return text[start:i+1]
                return None

            frag = _balanced_json_fragment(cleaned)
            if frag:
                try:
                    parsed_data = json.loads(frag)
                    logger.info("Phân tích đối thủ thành công (từ JSON fragment)")
                    return parsed_data
                except Exception as je2:
                    logger.error("Lỗi parse JSON fragment: %s", je2)
                    logger.debug("Fragment: %s", frag[:500])
            logger.error("Không thể parse JSON từ phản hồi Gemini")
            logger.debug("Raw text: %s", raw_text[:2000])
            return None
            
    except Exception as e:
        logger.error(f"Lỗi khi phân tích đối thủ cạnh tranh: {e}", exc_info=True)
        return None
