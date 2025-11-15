

from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from models.product import ProductAnalysisRequest, ProductAnalysisResult
from models.content import ContentGenerationRequest, GeneratedContentResponse
from core.data_analysis import analyze_product_data
from core.content_generation import generate_marketing_content
from core.image_generation import generate_marketing_poster, ImageGenerationResponse, upload_to_cloudinary

router = APIRouter(prefix="/v1")

# GIAI ĐOẠN 1: PHÂN TÍCH DỮ LIỆU THỊ TRƯỜNG

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
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể phân tích sản phẩm. Lỗi chi tiết: {str(e)}")
        
    return ProductAnalysisResult(product_name=request.product_name, usps=[], pain_points=[], infor="Khong tim thay du lieu", target_persona="Không tìm thấy dữ liệu.")


# GIAI ĐOẠN 2: SÁNG TẠO NỘI DUNG MARKETING

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
    raise HTTPException(status_code=400, detail="Không thể tạo nội dung, vui lòng thử lại với các thông số khác.")

# GIAI ĐOẠN 3: SẢN XUẤT MEDIA (POSTER)

@router.post("/generate_poster", response_model=ImageGenerationResponse)
async def generate_poster(
    product_name: str = Form(..., description="Tên sản phẩm."),
    ad_copy: str = Form(..., description="Nội dung quảng cáo (Ad Copy) đã tạo ở Giai đoạn 2."),
    persona: str = Form(..., description="Chân dung khách hàng."),
    usp: str = Form(..., description="USP đang được tập trung."),
    infor: str = Form(..., description="Các thông số sản phẩm nổi bật."),
    style_short: str = Form(None, description="Yêu cầu phong cách ngắn (tuỳ chọn)."),
    reference_image: UploadFile = File  (None, description="Hình ảnh tham khảo (tùy chọn)")
):
    """
    Endpoint Giai đoạn 3: Nhận các thông số và Ad Copy để tạo Poster/Ảnh quảng cáo.
    Nhận form-data (có thể kèm file).
    """
    print(f"Bắt đầu tạo Poster cho sản phẩm: {product_name}")
    try:
        ref_bytes = None
        if reference_image:
            ref_bytes = await reference_image.read()
        result = generate_marketing_poster(
            product_name=product_name,
            ad_copy=ad_copy,
            persona=persona,
            infor=infor,
            usp=usp,
            style_short=style_short,
            reference_image_bytes=ref_bytes
        )
        if result:
            return result
    except Exception as e:
        msg = str(e)
        print(f"Lỗi tạo Poster ở Giai đoạn 3: {msg}")
        raise HTTPException(status_code=500, detail=msg)
    raise HTTPException(status_code=400, detail="Không thể tạo Poster, vui lòng kiểm tra log backend.")

@router.post("/test_upload")
async def test_upload(image: UploadFile = File(...)):
    """
    Endpoint test để upload ảnh lên Cloudinary.
    Cách dùng với curl:
    curl -X POST "http://localhost:8000/api/v1/test_upload" -H "accept: application/json" -F "image=@/path/to/your/image.jpg"
    """
    try:
        contents = await image.read()
        cloudinary_url = upload_to_cloudinary(contents, "test")
        
        if cloudinary_url:
            return {
                "status": "success",
                "message": "Upload thành công",
                "cloudinary_url": cloudinary_url,
                "filename": image.filename
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Không thể upload lên Cloudinary"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi upload: {str(e)}"
        )