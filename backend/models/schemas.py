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


# ===== Competitor Analysis (requests/responses) =====
class CompetitorAnalysisRequest(BaseModel):
    competitor_name: str = Field(..., description="Tên đối thủ cạnh tranh cần phân tích.")


class ProductAnalysisSection(BaseModel):
    usps: List[str] = Field(..., description="Các điểm bán hàng độc đáo (3-5 điểm).")
    key_specs: str = Field(..., description="Thông số kỹ thuật nổi bật.")
    quality_feedback: str = Field(..., description="Phản hồi chung về chất lượng và độ tin cậy.")
    pricing_strategy: str = Field(..., description="Chiến lược định giá và khuyến mãi.")


class CustomerFocusSection(BaseModel):
    target_persona: str = Field(..., description="Mô tả nhóm khách hàng mục tiêu.")
    missed_segments: str = Field(..., description="Phân khúc khách hàng bị bỏ lỡ.")
    pain_points: List[str] = Field(..., description="Các vấn đề khách hàng phàn nàn.")
    customer_journey: str = Field(..., description="Trải nghiệm mua hàng và dịch vụ sau bán.")


class MarketingStrategySection(BaseModel):
    key_channels: str = Field(..., description="Các kênh truyền thông chính.")
    core_messaging: str = Field(..., description="Thông điệp cốt lõi.")
    content_creative: str = Field(..., description="Các loại nội dung hiệu quả nhất.")


class DistributionMarketSection(BaseModel):
    distribution_channels: str = Field(..., description="Các kênh phân phối.")
    market_share_estimate: str = Field(..., description="Ước tính thị phần.")


class CompetitorAnalysisResult(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm của đối thủ.")
    product_analysis: ProductAnalysisSection
    customer_focus: CustomerFocusSection
    marketing_strategy: MarketingStrategySection
    distribution_market: DistributionMarketSection


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
    # competitor
    "CompetitorAnalysisRequest",
    "CompetitorAnalysisResult",
    "ProductAnalysisSection",
    "CustomerFocusSection",
    "MarketingStrategySection",
    "DistributionMarketSection",
]
