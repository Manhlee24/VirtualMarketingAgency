import os
import base64 # 👈 THÊM: Import thư viện base64 để mã hóa
from pydantic import BaseModel, Field
from google import genai 
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Khởi tạo client chỉ khi API Key có sẵn
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None 

class ImageGenerationResponse(BaseModel):
    # Description được cập nhật để phản ánh rằng nó là Data URL
    image_url: str = Field(..., description="URL công khai hoặc Data URL Base64 chứa ảnh Poster đã tạo.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo ảnh.")

def generate_marketing_poster(
    product_name: str, 
    ad_copy: str, 
    persona: str,
    usp: str
) -> Optional[ImageGenerationResponse]:
    """Tạo prompt hình ảnh và gọi API Gemini/Imagen để tạo Poster."""
    
    # Tạo Prompt hình ảnh chi tiết từ các đầu vào Marketing
    image_prompt = f"""
    Tạo một POSTER QUẢNG CÁO chất lượng cao, hiện đại và thu hút (Digital art, cinematic lighting, modern advertising, clean design). 
    
    Tập trung vào:
    - SẢN PHẨM: {product_name}
    - ĐỐI TƯỢNG (Persona): {persona}
    - ĐIỂM ĐỘC NHẤT (USP): {usp}
    - NỘI DUNG QUẢNG CÁO (Tham khảo ý tưởng): {ad_copy}
    - YÊU CẦU: Không thêm bất kỳ text (chữ) nào vào hình ảnh.
    """

    if client:
        try:
            # --- LOGIC GỌI API GEMINI/IMAGEN THỰC TẾ ---
            print("Đang gọi API tạo ảnh Gemini/Imagen thực tế...")
            
            result = client.models.generate_images(
                model='imagen-3.0-generate-002', 
                prompt=image_prompt,
                config=dict(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                    aspect_ratio="1:1" 
                )
            )
            
            if result.generated_images:
                # 1. Lấy dữ liệu bytes của ảnh
                image_data = result.generated_images[0].image.image_bytes
                
                # 2. Mã hóa bytes thành chuỗi Base64
                base64_image = base64.b64encode(image_data).decode('utf-8')
                
                # 3. Tạo Data URL để Frontend có thể hiển thị
                data_url = f"data:image/jpeg;base64,{base64_image}"
                
                print("Thành công: Đã chuyển ảnh thành Base64 Data URL.")
                
                return ImageGenerationResponse(
                    image_url=data_url, # Trả về Data URL chứa ảnh thật
                    prompt_used=image_prompt.strip()
                )

        except Exception as e:
            print(f"LỖI API tạo ảnh Gemini/Imagen (Giai đoạn 3): {e}")
            # Fallback về mock khi API lỗi
            mock_url = "https://via.placeholder.com/800x800.png?text=LOI+KET+NOI+API+GEMINI"
            return ImageGenerationResponse(
                image_url=mock_url, 
                prompt_used=image_prompt.strip()
            )

    # --- LOGIC MOCK BAN ĐẦU (Fallback nếu không có API Key) ---
    else:
        mock_url = "https://via.placeholder.com/800x800.png?text=MOCK+KHI+THIEU+API+KEY"
        print("CẢNH BÁO: GEMINI_API_KEY bị thiếu. Dùng Mock data.")
        
        return ImageGenerationResponse(
            image_url=mock_url, 
            prompt_used=image_prompt.strip()
        )