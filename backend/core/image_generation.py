import os
import base64
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Optional
from io import BytesIO

# optional imports
try:
    from PIL import Image
except Exception:
    Image = None

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Gemini client (optional)
try:
    from google import generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')  # Dùng gemini-pro thay vì gemini-2.5-flash
    gemini_client = model if GEMINI_API_KEY else None
except Exception as e:
    print(f"Failed to initialize Gemini: {e}")
    gemini_client = None

# OpenAI client (optional, dùng SDK mới)
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except Exception:
    openai_client = None

class ImageGenerationResponse(BaseModel):
    image_url: str = Field(..., description="URL công khai hoặc Data URL Base64 chứa ảnh Poster đã tạo.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo ảnh.")

def _expand_style_with_gemini(style_short: str, product_name: str, infor: str, target_persona: str, selected_usp: str, ad_copy: str) -> Optional[str]:
    """
    Gọi Gemini 'gemini-2.5-flash' để mở rộng một yêu cầu phong cách ngắn thành prompt chi tiết.
    Trả về chuỗi prompt chi tiết hoặc None nếu thất bại.
    """
    if not style_short:
        return None

    instruction = (
        f"You are an expert prompt engineer for image generation. Expand the short style request below into a\n"
        f"detailed image-generation prompt suitable for photorealistic advertising posters.\n"
        f"Include composition, camera angle, focal length, lighting, color palette, materials/textures, mood, and stylistic keywords.\n"
        f"include key product higtlight with {infor} adding text overlays or UI. Output only the detailed prompt.\n\n"
        f"Short style request: {style_short}\n\n"
        f"Product context:\n"
        f"- Product: {product_name}\n"
        f"- Example ad copy: {ad_copy}\n"
        f"- Note: limit 100 words"
    )

    try:
        if gemini_client:
            response = gemini_client.generate_content(instruction)
            return response.text.strip()
    except Exception as e:
        print(f"Warning: gemini_client.responses.create failed: {e}")

    print("Info: Gemini expansion not available. Skipping style expansion.")
    return None

def generate_marketing_poster(
    product_name: str,
    ad_copy: str,
    persona: str,
    infor: str,
    usp: str,
    style_short: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
    size: str = "1024x1024",
    n_images: int = 1
) -> Optional[ImageGenerationResponse]:
    """
    Sinh prompt cuối cùng:
    - Nếu user không nhập style_short -> dùng base_prompt.
    - Nếu user nhập style_short và Gemini trả về prompt mở rộng -> CHỈ dùng prompt mở rộng.
    - Nếu user nhập style_short nhưng Gemini không trả về (None) -> fallback về base_prompt.
    """
    try:
        base_prompt = f"""
Create a premium, high-quality digital advertising poster for {product_name}.
Product details: {infor}
Target persona: {persona}
USP: {usp}
Ad copy sample: {ad_copy}

Requirements:
- Modern, minimalist, cinematic lighting.
- Product centered, realistic materials and reflections.
- No text overlays in the image itself (UI/text will be added separately).
""".strip()

        # Nếu user có nhập style ngắn -> cố gắng mở rộng bằng Gemini
        detailed_style = None
        if style_short:
            detailed_style = _expand_style_with_gemini(style_short, product_name, infor, persona, usp, ad_copy)

        # Quy tắc chọn final_prompt:
        # - Nếu có style_short và detailed_style không rỗng -> chỉ dùng detailed_style
        # - Ngược lại -> dùng base_prompt
        if style_short and detailed_style:
            final_prompt = detailed_style.strip()
            # (tùy chọn) thêm context ngắn về sản phẩm vào cuối prompt mở rộng để giữ thông tin cần thiết
            final_prompt = final_prompt + f"\n\nProduct context: {product_name}. Key info: {infor}. USP: {usp}."
        else:
            final_prompt = base_prompt

        # Nếu có ảnh tham khảo, thêm 1 câu ngắn (không chèn base64 lớn)
        if reference_image_bytes:
            final_prompt += "\n\nNote: A reference image was provided — use its composition, color palette and materials as inspiration."

        # Nếu có OpenAI client thì gọi Images API
        if openai_client:
            try:
                print("Calling OpenAI Images API (gpt-image-1)...")
                allowed_sizes = {"1024x1024", "1024x1536", "1536x1024"}
                if size not in allowed_sizes:
                    size = "1024x1024"

                resp = openai_client.images.generate(
                    model="gpt-image-1",
                    prompt=final_prompt,
                    size=size,
                    n=n_images,
                )
                # parse response
                if resp and getattr(resp, "data", None) and len(resp.data) > 0:
                    result_data = resp.data[0]
                    # url
                    url = getattr(result_data, "url", None)
                    if url:
                        return ImageGenerationResponse(image_url=url, prompt_used=final_prompt)
                    # base64 field
                    b64 = getattr(result_data, "b64_json", None) or getattr(result_data, "b64", None)
                    if b64:
                        data_url = f"data:image/png;base64,{b64}"
                        return ImageGenerationResponse(image_url=data_url, prompt_used=final_prompt)
                raise Exception("Image API returned no usable image data.")
            except Exception as e:
                print(f"OpenAI Images error: {e}")
                # fallthrough to mock

        # fallback: trả mock placeholder (an toàn)
        placeholder = "https://via.placeholder.com/1024x1024.png?text=Generated+Poster+Mock"
        return ImageGenerationResponse(image_url=placeholder, prompt_used=final_prompt)
    except Exception as e:
        err = str(e)
        print(f"Error in generate_marketing_poster: {err}")
        placeholder = "https://via.placeholder.com/1024x1024.png?text=ERROR"
        return ImageGenerationResponse(image_url=placeholder, prompt_used=f"ERROR: {err}")