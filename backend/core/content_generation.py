import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.content import ContentGenerationRequest, GeneratedContentResponse

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
You are a professional copywriter. Create high-quality marketing content based on the following parameters:

CAMPAIGN DETAILS

Product: {request.product_name}

Customer Persona: {request.target_persona}

Focused Unique Selling Point (USP): {request.selected_usp}

Key Product Highlights: {request.infor}

Tone of Voice: {request.selected_tone.value}

Format: {request.selected_format.value}

OUTPUT REQUIREMENTS

Based on the Persona and USP, write a complete marketing piece with the specified {request.selected_tone.value} tone, tailored to the {request.selected_format.value} format.

The output must be a single, valid JSON object (no additional text outside the JSON) with the following two keys:

"title": (String) An engaging title suitable for the chosen format.

"content": (String) The detailed article/script content about 200 words.
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