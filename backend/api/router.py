# backend/api/router.py

from fastapi import APIRouter, HTTPException, Query
from models.product import ProductAnalysisRequest, ProductAnalysisResult
from models.content import ContentGenerationRequest, GeneratedContentResponse
from core.data_analysis import analyze_product_data
from core.content_generation import generate_marketing_content
from core.image_generation import generate_marketing_poster, ImageGenerationResponse

router = APIRouter(prefix="/v1")

# ===============================================
# GIAI ĐOẠN 1: PHÂN TÍCH DỮ LIỆU THỊ TRƯỜNG
# ===============================================

@router.post("/analyze_product", response_model=ProductAnalysisResult)
def analyze_product(request: ProductAnalysisRequest):
    """
    Endpoint Giai đoạn 1: Nhận tên sản phẩm và trả về bộ dữ liệu cấu trúc (USP, Pain Points, Persona).
    """
    print(f"Bắt đầu phân tích sản phẩm: {request.product_name}")
    try:
        result = analyze_product_data(request.product_name)
        if result:
            return result
    except Exception as e:
        print(f"Lỗi phân tích dữ liệu ở Giai đoạn 1: {e}")
        # Trả về kết quả rỗng và thông báo lỗi 500 nếu có lỗi nghiêm trọng
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể phân tích sản phẩm. Lỗi chi tiết: {str(e)}")
        
    # Trả về kết quả rỗng (200 OK) nếu AI không tìm thấy dữ liệu
    return ProductAnalysisResult(product_name=request.product_name, usps=[], pain_points=[], target_persona="Không tìm thấy dữ liệu.")


# ===============================================
# GIAI ĐOẠN 2: SÁNG TẠO NỘI DUNG MARKETING
# ===============================================

@router.post("/generate_content", response_model=GeneratedContentResponse)
def generate_content(request: ContentGenerationRequest):
    """
    Endpoint Giai đoạn 2: Nhận ma trận Marketing và trả về nội dung (copy).
    """
    print(f"Bắt đầu tạo nội dung cho USP: {request.selected_usp}")
    try:
        result = generate_marketing_content(request)
        if result:
            return result
    except Exception as e:
        print(f"Lỗi tạo nội dung ở Giai đoạn 2: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể tạo nội dung. Lỗi chi tiết: {str(e)}")

    # Trả về lỗi nếu không tạo được nội dung
    raise HTTPException(status_code=400, detail="Không thể tạo nội dung, vui lòng thử lại với các thông số khác.")


# ===============================================
# GIAI ĐOẠN 3: SẢN XUẤT MEDIA (POSTER)
# ===============================================

@router.post("/generate_poster", response_model=ImageGenerationResponse)
def generate_poster(
    # Sử dụng Query để nhận các thông số qua URL Parameters
    product_name: str = Query(..., description="Tên sản phẩm."),
    ad_copy: str = Query(..., description="Nội dung quảng cáo (Ad Copy) đã tạo ở Giai đoạn 2."),
    target_persona: str = Query(..., description="Chân dung khách hàng."),
    selected_usp: str = Query(..., description="USP đang được tập trung.")
):
    """
    Endpoint Giai đoạn 3: Nhận các thông số và Ad Copy để tạo Poster/Ảnh quảng cáo.
    """
    print(f"Bắt đầu tạo Poster cho sản phẩm: {product_name}")
    try:
        # Gọi hàm tạo ảnh
        result = generate_marketing_poster(product_name, ad_copy, target_persona, selected_usp)
        if result:
            return result
    except Exception as e:
        print(f"Lỗi tạo Poster ở Giai đoạn 3: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể tạo Poster. Lỗi chi tiết: {str(e)}")

    # Trả về lỗi nếu không tạo được ảnh
    raise HTTPException(status_code=400, detail="Không thể tạo Poster, vui lòng kiểm tra log backend.")