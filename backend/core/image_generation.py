import os
import base64
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")  # vẫn đọc nhưng sẽ bị bỏ qua nếu OPENAI_API_KEY có

# Sử dụng OpenAI mới (openai>=1.0.0)
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except Exception:
    openai_client = None

class ImageGenerationResponse(BaseModel):
    image_url: str = Field(..., description="URL công khai hoặc Data URL Base64 chứa ảnh Poster đã tạo.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo ảnh.")

def generate_marketing_poster(
    product_name: str,
    ad_copy: str,
    persona: str,
    infor: str,
    usp: str,
    # Cập nhật kích thước hỗ trợ cho 'gpt-image-1'
    size: str = "1024x1024",  
    n_images: int = 1
) -> Optional[ImageGenerationResponse]:
    """Chỉ dùng OpenAI images (ưu tiên). Nếu không có key hoặc lỗi -> mock URL."""
    image_prompt = f"""
    Create a premium, high-quality digital advertising poster for {product_name}, designed in a luxurious, contemporary Apple-style aesthetic.

The layout should be minimalist, elegant, and perfectly balanced, with cinematic lighting and a dark gradient background (black, graphite, or deep space gray).

The product should be the main visual focus, placed centrally or slightly offset, rendered with realistic reflections, fine metal textures, and soft shadows.

On one side of the poster, include clean, legible English text listing key specifications:
{infor}

The text must be crisp, sharp, and free of distortion, using a modern sans-serif font (similar to SF Pro or Helvetica Neue), in white or silver, with balanced line spacing and hierarchy.

Maintain a premium, cinematic, and modern advertising style, emphasizing simplicity, contrast, and precision.

No watermark, no spelling errors, no warped text, no excessive elements.
The final composition should look like an official Apple marketing poster — sleek, polished, and aspirational.
    """

    # Nếu có OpenAI client thì dùng nó (bỏ qua Gemini)
    if openai_client:
        try:
            print("Đang gọi OpenAI Images API (gpt-image-1)...")
            
            # Đảm bảo size hợp lệ cho mô hình 'gpt-image-1'
            allowed_sizes = {"1024x1024", "1024x1536", "1536x1024"}
            if size not in allowed_sizes:
                print(f"Warning: size '{size}' không hợp lệ cho 'gpt-image-1'. Sử dụng '1024x1024' thay thế.")
                size = "1024x1024"
                
            resp = openai_client.images.generate(
                model="gpt-image-1", 
                prompt=image_prompt,
                size=size,
                n=n_images,
                # ĐÃ XÓA THAM SỐ response_format gây lỗi
                # Nếu mô hình này trả về Base64, nó sẽ tự động đi vào resp.data[0].b64_json.
                # Nếu nó trả về URL, nó sẽ đi vào resp.data[0].url.
            )
            
            if resp and getattr(resp, "data", None) and len(resp.data) > 0:
                result_data = resp.data[0]
                
                # Ưu tiên lấy URL công khai (là mặc định cho hầu hết các mô hình DALL-E)
                if hasattr(result_data, 'url') and result_data.url:
                    print("Nhận được URL công khai.")
                    return ImageGenerationResponse(image_url=result_data.url, prompt_used=image_prompt.strip())
                
                # Nếu không có URL, kiểm tra Base64 (phù hợp với logic Base64 ban đầu của bạn)
                elif hasattr(result_data, 'b64_json') and result_data.b64_json:
                    print("Nhận được dữ liệu Base64.")
                    b64 = result_data.b64_json
                    data_url = f"data:image/png;base64,{b64}"
                    return ImageGenerationResponse(image_url=data_url, prompt_used=image_prompt.strip())
            
            # Nếu resp.data rỗng hoặc không có cả url và b64_json
            raise Exception("Phản hồi tạo ảnh hợp lệ nhưng không chứa URL hoặc Base64.")
            
        except Exception as e:
            # Xử lý ngoại lệ rõ ràng hơn
            error_message = str(e)
            if "content_policy_violation" in error_message:
                print("LỖI OpenAI Images API: Vi phạm chính sách nội dung. Vui lòng kiểm tra lại SẢN PHẨM và NỘI DUNG QUẢNG CÁO.")
            elif "Unknown parameter" in error_message:
                print(f"LỖI OpenAI Images API: Lỗi tham số. Có vẻ mô hình '{getattr(resp, 'model', 'gpt-image-1')}' không hỗ trợ tham số nào đó.")
            else:
                print(f"LỖI OpenAI Images API: {e}")

    # Nếu không có OpenAI hoặc lỗi -> trả mock
    mock_url = "https://via.placeholder.com/800x800.png?text=MOCK+KHI+THIEU+OPENAI+KEY+HOAC+LOI"
    print("CẢNH BÁO: Không tạo được ảnh thực. Dùng Mock data.")
    return ImageGenerationResponse(image_url=mock_url, prompt_used=image_prompt.strip())