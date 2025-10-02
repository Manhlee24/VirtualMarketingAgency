import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.content import ContentGenerationRequest, GeneratedContentResponse

# Tải biến môi trường
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY không được tìm thấy. Vui lòng tạo file .env.")
client = genai.Client(api_key=GEMINI_API_KEY)


def generate_marketing_content(request: ContentGenerationRequest) -> GeneratedContentResponse | None:
    """
    Sử dụng ma trận Persona x USP x Tone x Format để tạo nội dung Marketing.
    """
    
    # 1. Xây dựng Prompt Engineering từ các biến
    prompt = f"""
    Bạn là chuyên gia copywriter. Hãy tạo ra nội dung marketing chất lượng cao dựa trên các thông số sau:

    --- THÔNG SỐ CHIẾN DỊCH ---
    1. Sản phẩm: {request.product_name}
    2. Chân dung khách hàng (Persona): {request.target_persona}
    3. Điểm bán hàng độc nhất (USP) được tập trung: {request.selected_usp}
    4. Giọng điệu (Tone): {request.selected_tone.value}
    5. Định dạng (Format): {request.selected_format.value}

    --- YÊU CẦU ĐẦU RA ---
    Dựa trên Persona và USP, hãy viết một nội dung Marketing hoàn chỉnh với {request.selected_tone.value} tone, phù hợp với {request.selected_format.value}. 
    
    Đầu ra phải là một JSON Object duy nhất, HỢP LỆ (không có bất kỳ text nào khác ngoài JSON) với 2 keys:
    - "title": (String) Một tiêu đề hấp dẫn phù định dạng.
    - "content": (String) Nội dung bài viết/kịch bản chi tiết.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        if not response.text:
            return None
        
        # Xử lý và phân tích JSON
        import json
        json_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(json_text)
        
        return GeneratedContentResponse(
            title=data.get('title', 'Không có tiêu đề'),
            content=data.get('content', 'Không có nội dung được tạo.'),
            prompt_used=prompt
        )
        
    except Exception as e:
        print(f"Lỗi API Gemini hoặc lỗi phân tích JSON ở Giai đoạn 2: {e}")
        return None