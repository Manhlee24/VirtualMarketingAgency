import os
import base64
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Optional
from io import BytesIO

try:
    from PIL import Image
except Exception:
    Image = None

try:
    import cloudinary
    import cloudinary.uploader
    import time
except Exception as e:
    print(f"Warning: Optional module import failed: {e}")

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

try:
    from google import generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash') 
    gemini_client = model if GEMINI_API_KEY else None
except Exception as e:
    print(f"Failed to initialize Gemini: {e}")
    gemini_client = None

try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except Exception:
    openai_client = None

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"), 
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Cập nhật model response
class ImageGenerationResponse(BaseModel):
    image_url: str = Field(..., description="URL công khai hoặc Data URL Base64 chứa ảnh Poster đã tạo.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo ảnh.")
    reference_url: Optional[str] = Field(None, description="URL ảnh tham khảo trên Cloudinary")

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
    try:
        # Upload ảnh tham khảo lên Cloudinary nếu có
        reference_url = None
        if reference_image_bytes:
            reference_url = upload_to_cloudinary(reference_image_bytes)
            print(f"Đã upload ảnh tham khảo lên Cloudinary: {reference_url}")
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

        detailed_style = None
        if style_short:
            detailed_style = _expand_style_with_gemini(style_short, product_name, infor, persona, usp, ad_copy)

        # Chọn prompt chính
        if style_short and detailed_style:
            final_prompt = detailed_style.strip()
            final_prompt = final_prompt + f"\n\nProduct context: {product_name}. Key info: {infor}. USP: {usp}."
        else:
            final_prompt = base_prompt

        # Thêm reference image URL vào prompt nếu upload thành công
        if reference_url:
            final_prompt += (
                f"\n\nReference image URL: {reference_url}\n"
                "IMPORTANT: Use the EXACT product shown in the reference image as the main subject. "
                "Match the product's shape, proportions, colors, materials and any visible labels or branding. "
                "Do not replace or invent a different product. You may change background, lighting, camera angle and styling to match the requested style."
            )

        # Gọi OpenAI API
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
                if resp and getattr(resp, "data", None) and len(resp.data) > 0:
                    result_data = resp.data[0]
                    url = getattr(result_data, "url", None)
                    if url:
                        return ImageGenerationResponse(
                            image_url=url, 
                            prompt_used=final_prompt,
                            reference_url=reference_url
                        )

                    # Nếu engine trả base64 (b64_json / b64) -> decode và upload lên Cloudinary
                    b64 = getattr(result_data, "b64_json", None) or getattr(result_data, "b64", None)
                    if b64:
                        try:
                            img_bytes = base64.b64decode(b64)
                            uploaded_url = upload_to_cloudinary(img_bytes, public_id_prefix="generated_poster")
                            if uploaded_url:
                                return ImageGenerationResponse(
                                    image_url=uploaded_url,
                                    prompt_used=final_prompt,
                                    reference_url=reference_url
                                )
                            # nếu upload thất bại -> fallback trả data URL
                            data_url = f"data:image/png;base64,{b64}"
                            return ImageGenerationResponse(
                                image_url=data_url,
                                prompt_used=final_prompt,
                                reference_url=reference_url
                            )
                        except Exception as e:
                            print(f"Warning: failed to upload generated image to Cloudinary: {e}")
                            data_url = f"data:image/png;base64,{b64}"
                            return ImageGenerationResponse(
                                image_url=data_url,
                                prompt_used=final_prompt,
                                reference_url=reference_url
                            )

                raise Exception("Image API returned no usable image data.")
            except Exception as e:
                print(f"OpenAI Images error: {e}")

        # Fallback to mock
        placeholder = "https://via.placeholder.com/1024x1024.png?text=Generated+Poster+Mock"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=final_prompt,
            reference_url=reference_url 
        )
    except Exception as e:
        err = str(e)
        print(f"Error in generate_marketing_poster: {err}")
        placeholder = "https://via.placeholder.com/1024x1024.png?text=ERROR"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=f"ERROR: {err}",
            reference_url=None
        )

# Thêm hàm upload Cloudinary
def upload_to_cloudinary(image_bytes: bytes, public_id_prefix: str = "ref") -> Optional[str]:
    """Upload ảnh lên Cloudinary và trả về public URL."""
    try:
        with BytesIO(image_bytes) as img_buffer:
            response = cloudinary.uploader.upload(
                img_buffer,
                folder="marketing_agency/references",
                public_id=f"{public_id_prefix}_{int(time.time())}",
                resource_type="auto"
            )
            return response.get('secure_url')
    except Exception as e:
        print(f"Lỗi upload Cloudinary: {e}")
        return None