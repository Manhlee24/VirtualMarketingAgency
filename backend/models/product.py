# models/product.py

from pydantic import BaseModel, Field
from typing import List

# Model cho Request (Input) từ Frontend - Giai đoạn 1
class ProductAnalysisRequest(BaseModel):
    """Định nghĩa dữ liệu đầu vào khi người dùng yêu cầu phân tích sản phẩm."""
    product_name: str = Field(..., description="Tên sản phẩm người dùng nhập vào để phân tích.")

# Model cho Response (Output) trả về Frontend - Giai đoạn 1
class ProductAnalysisResult(BaseModel):
    """Định nghĩa kết quả phân tích thị trường trả về Frontend."""
    product_name: str = Field(..., description="Tên sản phẩm đã được phân tích.")
    usps: List[str] = Field(..., description="Danh sách các Điểm bán hàng độc nhất (USP).")
    pain_points: List[str] = Field(..., description="Danh sách các Điểm đau của khách hàng (Pain Points).")
    target_persona: str = Field(..., description="Chân dung khách hàng mục tiêu chi tiết.")
    infor: str = Field(..., description="Các thông số sản phẩm vượt trội.")