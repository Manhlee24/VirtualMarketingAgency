from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ===== Shared Enums =====
class Tone(str, Enum):
    PROFESSIONAL = "Chuyên nghiệp (Professional)"
    EMOTIONAL = "Cảm xúc, gợi mở (Emotional & Relatable)"
    URGENT = "Khẩn cấp, thúc đẩy hành động (Urgent & Scarcity)"
    HUMOROUS = "Hài hước, vui vẻ (Humorous)"
    INFORMATIVE = "Cung cấp thông tin, giáo dục (Informative & Educational)"


class Format(str, Enum):
    FACEBOOK_POST = "Bài viết Facebook/Blog (Dưới 300 từ)"
    ADx_COPY = "Nội dung quảng cáo ngắn (Ad Copy)"
    VIDEO_SCRIPT = "Kịch bản video ngắn (Dưới 60 giây)"


# ===== Content generation (requests/responses) =====
class ContentGenerationRequest(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm gốc.")
    target_persona: str = Field(..., description="Chân dung khách hàng mục tiêu.")
    selected_usp: str = Field(..., description="USP đã chọn để tập trung.")
    selected_tone: Tone = Field(..., description="Giọng điệu nội dung đã chọn.")
    selected_format: Format = Field(..., description="Định dạng nội dung đã chọn.")
    infor: str = Field(..., description="Các thông số sản phẩm nổi bật.")


class GeneratedContentResponse(BaseModel):
    title: str = Field(..., description="Tiêu đề gợi ý.")
    content: str = Field(..., description="Nội dung Marketing đã được tạo ra.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo nội dung (để kiểm tra).")


# ===== Product analysis (requests/responses) =====
class ProductAnalysisRequest(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm người dùng nhập vào để phân tích.")


class ProductAnalysisResult(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm đã được phân tích.")
    usps: List[str] = Field(..., description="Danh sách các Điểm bán hàng độc nhất (USP).")
    pain_points: List[str] = Field(..., description="Danh sách các Điểm đau của khách hàng (Pain Points).")
    target_persona: str = Field(..., description="Chân dung khách hàng mục tiêu chi tiết.")
    infor: str = Field(..., description="Các thông số sản phẩm vượt trội.")


# ===== Image generation (responses) =====
class ImageGenerationResponse(BaseModel):
    image_url: str = Field(..., description="URL công khai hoặc Data URL Base64 chứa ảnh Poster đã tạo.")
    prompt_used: str = Field(..., description="Prompt đã sử dụng để tạo ảnh.")
    reference_url: Optional[str] = Field(None, description="URL ảnh tham khảo trên Cloudinary")


__all__ = [
    # enums
    "Tone",
    "Format",
    # content
    "ContentGenerationRequest",
    "GeneratedContentResponse",
    # product
    "ProductAnalysisRequest",
    "ProductAnalysisResult",
    # image
    "ImageGenerationResponse",
]
