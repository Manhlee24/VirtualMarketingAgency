# backend/api/router.py

from fastapi import APIRouter, HTTPException, Form, UploadFile, File
import logging

logger = logging.getLogger(__name__)
from core.data_analysis import analyze_product_data
from core.content_generation import generate_marketing_content
from core.document_analysis import generate_product_analysis_from_document
from core.image_generation import generate_marketing_poster
from models.schemas import (
    ProductAnalysisRequest,
    ProductAnalysisResult,
    ContentGenerationRequest,
    GeneratedContentResponse,
    ImageGenerationResponse,
)
from pathlib import Path
import time

router = APIRouter(prefix="/v1")

# ===============================================
# GIAI ĐOẠN 1: PHÂN TÍCH DỮ LIỆU THỊ TRƯỜNG
# ===============================================

@router.post("/analyze_product", response_model=ProductAnalysisResult)
def analyze_product(request: ProductAnalysisRequest):
    
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
    return ProductAnalysisResult(product_name=request.product_name, usps=[], pain_points=[], infor="Khong tim thay du lieu", target_persona="Không tìm thấy dữ liệu.")


@router.post("/analyze_document", response_model=ProductAnalysisResult)
async def analyze_document(
    product_name: str = Form(None, description="Tên sản phẩm (tùy chọn, có thể tự suy luận từ tài liệu)."),
    document: UploadFile = File(..., description="PDF or DOCX document containing product info")
):
    """
    Upload a PDF or DOCX document and analyze its content to extract structured product
    analysis (usps, pain_points, target_persona, infor) suitable for downstream
    marketing generation. Returns a ProductAnalysisResult.
    """
    logger.info("analyze_document called for product: %s, filename: %s", product_name, getattr(document, 'filename', None))
    try:
        contents = await document.read()
        # determine file type from filename
        filename = (document.filename or "").lower()
        if filename.endswith('.pdf'):
            file_type = 'pdf'
        elif filename.endswith('.docx'):
            file_type = 'docx'
        else:
            # try to guess or return error
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a .pdf or .docx file.")

        # Generate structured product analysis from the uploaded document
        result = generate_product_analysis_from_document(product_name or "", contents, file_type)
        if result:
            return result
        else:
            # Return an empty-but-valid ProductAnalysisResult to keep response_model consistent
            return ProductAnalysisResult(product_name=product_name or "Sản phẩm", usps=[], pain_points=[], infor="Không tìm thấy dữ liệu", target_persona="Không tìm thấy dữ liệu")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in analyze_document route: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


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
async def generate_poster(
    product_name: str = Form(..., description="Tên sản phẩm."),
    ad_copy: str = Form(..., description="Nội dung quảng cáo (Ad Copy) đã tạo ở Giai đoạn 2."),
    usp: str = Form(..., description="USP đang được tập trung."),
    infor: str = Form(..., description="Các thông số sản phẩm nổi bật."),
    style_short: str = Form(None, description="Yêu cầu phong cách ngắn (tuỳ chọn)."),
    reference_image: UploadFile = File  (None, description="Hình ảnh tham khảo (tùy chọn)")
):
    """
    Endpoint Giai đoạn 3: Nhận các thông số và Ad Copy để tạo Poster/Ảnh quảng cáo.
    Nhận form-data (có thể kèm file).
    """
    logger.info(f"generate_poster called for product: %s, reference_image present: %s", product_name, bool(reference_image))
    try:
        ref_bytes = None
        if reference_image:
            # Read bytes and also save to static uploads so core can use a file path if desired
            ref_bytes = await reference_image.read()
            try:
                uploads_dir = Path(__file__).resolve().parents[1] / "static" / "uploads"
                uploads_dir.mkdir(parents=True, exist_ok=True)
                filename = f"ref_{int(time.time())}_{reference_image.filename}"
                file_path = uploads_dir / filename
                with open(file_path, "wb") as f:
                    f.write(ref_bytes)
                saved_path = str(file_path)
            except Exception as e:
                print(f"Warning: failed to save uploaded reference image: {e}")
                saved_path = None
        # gọi hàm core (trả về ImageGenerationResponse)
        result = generate_marketing_poster(
            product_name=product_name,
            ad_copy=ad_copy,
            infor=infor,
            usp=usp,
            style_short=style_short,
            original_image_bytes=ref_bytes,
            original_image_path=saved_path if reference_image else None
        )
        if result:
            return result
    except Exception as e:
        # đảm bảo trả chuỗi, không trả object
        msg = str(e)
        print(f"Lỗi tạo Poster ở Giai đoạn 3: {msg}")
        raise HTTPException(status_code=500, detail=msg)
    # Trả về lỗi nếu không tạo được ảnh
    raise HTTPException(status_code=400, detail="Không thể tạo Poster, vui lòng kiểm tra log backend.")

