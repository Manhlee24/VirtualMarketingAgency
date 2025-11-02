from enum import Enum
from pydantic import BaseModel, Field
from typing import List

# Định nghĩa các tùy chọn Giọng điệu
class Tone(str, Enum):
    PROFESSIONAL = "Chuyên nghiệp (Professional)"
    EMOTIONAL = "Cảm xúc, gợi mở (Emotional & Relatable)"
    URGENT = "Khẩn cấp, thúc đẩy hành động (Urgent & Scarcity)"
    HUMOROUS = "Hài hước, vui vẻ (Humorous)"
    INFORMATIVE = "Cung cấp thông tin, giáo dục (Informative & Educational)"

# Định nghĩa các tùy chọn Định dạng
class Format(str, Enum):
    FACEBOOK_POST = "Bài viết Facebook/Blog (Dưới 300 từ)"
    AD_COPY = "Nội dung quảng cáo ngắn (Ad Copy)"
    VIDEO_SCRIPT = "Kịch bản video ngắn (Dưới 60 giây)"

# Định nghĩa Model cho Request từ Frontend
class ContentGenerationRequest(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm gốc.")
    target_persona: str = Field(..., description="Chân dung khách hàng mục tiêu.")
    selected_usp: str = Field(..., description="USP đã chọn để tập trung.")
    selected_tone: Tone = Field(..., description="Giọng điệu nội dung đã chọn.")
    selected_format: Format = Field(..., description="Định dạng nội dung đã chọn.")
    infor: str = Field(..., description="Các thông số sản phẩm nổi bật.")

# Định nghĩa Model cho Response trả về Frontend
class GeneratedContentResponse(BaseModel):
    title: str = Field(..., description="Tiêu đề gợi ý.")
    content: str = Field(..., description="Nội dung Marketing đã được tạo ra.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo nội dung (để kiểm tra).")