import json
from models.schemas import ContentGenerationRequest, GeneratedContentResponse
from core.ai_clients import get_gemini_client, GEMINI_API_KEY


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
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            return None
        # Try modern client method
        response = None
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        elif hasattr(client, "generate_content"):
            response = client.generate_content(prompt)
        if not response or not getattr(response, "text", None):
            return None
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