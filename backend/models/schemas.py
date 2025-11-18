from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any


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


# ===== New enums: Ad copy style, CTA intent, copy intensity =====
class AdCopyStyle(str, Enum):
    HUMAN_INTEREST = "human_interest"
    REASON_WHY = "reason_why"
    EDUCATIONAL = "educational"
    INSTITUTIONAL = "institutional"
    SUGGESTIVE = "suggestive"
    SOCIAL_PROOF = "social_proof"
    SAVINGS = "savings"
    X_REASONS = "x_reasons"
    NO_BRAINER = "no_brainer"
    OUTCOME = "outcome"
    STATISTIC = "statistic"
    US_VS_THEM = "us_vs_them"
    INGREDIENTS = "ingredients"
    DISCOUNT = "discount"


class CTAIntent(str, Enum):
    SALES = "sales"
    LEAD = "lead"
    ENGAGEMENT = "engagement"
    APP_INSTALL = "app_install"
    AWARENESS = "awareness"


class CopyIntensity(str, Enum):
    SOFT = "soft"
    NEUTRAL = "neutral"
    HARD = "hard"


# ===== Content generation (requests/responses) =====
class ContentGenerationRequest(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm gốc.")
    target_persona: str = Field(..., description="Chân dung khách hàng mục tiêu.")
    selected_usp: str = Field(..., description="USP đã chọn để tập trung.")
    selected_tone: Tone = Field(..., description="Giọng điệu nội dung đã chọn.")
    selected_format: Format = Field(..., description="Định dạng nội dung đã chọn.")
    infor: str = Field(..., description="Các thông số sản phẩm nổi bật.")
    # Optional advanced controls
    ad_copy_style: Optional[AdCopyStyle] = Field(None, description="(Optional) Specific ad copy style to enforce, e.g. human_interest, reason_why, social_proof.")
    cta_intent: Optional[CTAIntent] = Field(None, description="(Optional) CTA intent: sales, lead, engagement, app_install, awareness.")
    copy_intensity: Optional[CopyIntensity] = Field(None, description="(Optional) Copy intensity: soft, neutral, hard. If omitted the system auto-selects.")
    # Additional optional inputs from user (enhanced controls)
    industry: Optional[str] = Field(None, description="(Optional) Lĩnh vực/ngành hàng.")
    seo_enabled: Optional[bool] = Field(False, description="(Optional) Bật chế độ SEO: ưu tiên chèn từ khoá và cấu trúc phù hợp SEO.")
    language: Optional[str] = Field("vi", description="(Optional) Ngôn ngữ đầu ra, ví dụ: 'vi', 'en'. Mặc định 'vi'.")
    category: Optional[str] = Field(None, description="(Optional) Thể loại nội dung, ví dụ: Quảng cáo, Giới thiệu, Hướng dẫn.")
    topic: Optional[str] = Field(None, description="(Optional) Chủ đề bạn muốn viết.")
    desired_length: Optional[int] = Field(None, description="(Optional) Độ dài mong muốn (số từ).")
    custom_title: Optional[str] = Field(None, description="(Optional) Tiêu đề gợi ý/tự đặt.")
    key_points: Optional[str] = Field(None, description="(Optional) Mô tả các ý chính / yêu cầu (có thể xuống dòng).")
    required_keywords: Optional[str] = Field(None, description="(Optional) Từ khoá cần có (phân tách bằng dấu phẩy).")


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

# ===== Save request/response models =====
class SaveStatus(BaseModel):
    id: int
    message: str = "saved"


class SaveContentRequest(BaseModel):
    product_name: str
    target_persona: str
    selected_usp: str
    selected_tone: str
    selected_format: str
    infor: str
    title: str
    content: str
    # Preserve optional metadata when saving generated content
    ad_copy_style: Optional[str] = None
    cta_intent: Optional[str] = None
    copy_intensity: Optional[str] = None


class SaveImageRequest(BaseModel):
    product_name: str
    # These fields are deprecated and no longer required for image generation.
    # Keep them optional to maintain backward compatibility with existing DB schema.
    ad_copy: Optional[str] = ""
    usp: Optional[str] = ""
    infor: Optional[str] = ""
    style_short: Optional[str] = None
    image_url: str
    prompt_used: Optional[str] = None
    reference_url: Optional[str] = None


class AnalysisRecordOut(BaseModel):
    id: int
    product_name: str
    usps: List[str]
    pain_points: List[str]
    target_persona: str
    infor: str
    created_at: datetime

    class Config:
        json_encoders = {}


class ContentRecordOut(BaseModel):
    id: int
    product_name: str
    target_persona: str
    selected_usp: str
    selected_tone: str
    selected_format: str
    infor: str
    title: str
    content: str
    created_at: datetime


class ImageRecordOut(BaseModel):
    id: int
    product_name: str
    # Deprecated fields; may be empty strings for records created after simplification
    ad_copy: Optional[str]
    usp: Optional[str]
    infor: Optional[str]
    style_short: Optional[str]
    image_url: str
    prompt_used: Optional[str]
    reference_url: Optional[str]
    created_at: datetime



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
    # save & history
    "SaveStatus",
    "SaveContentRequest",
    "SaveImageRequest",
    "AnalysisRecordOut",
    "ContentRecordOut",
    "ImageRecordOut",
]
