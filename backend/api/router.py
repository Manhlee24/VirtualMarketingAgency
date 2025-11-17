

from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends
import json
import logging

logger = logging.getLogger(__name__)
from core.data_analysis import analyze_product_data
from core.content_generation import generate_marketing_content
from core.document_analysis import generate_product_analysis_from_document
from core.image_generation import generate_marketing_poster, upload_to_cloudinary, IMAGE_LIMITATIONS
from core.competitor_analysis import analyze_competitor_market
from models.schemas import (
    ProductAnalysisRequest,
    ProductAnalysisResult,
    ContentGenerationRequest,
    GeneratedContentResponse,
    ImageGenerationResponse,
    CompetitorAnalysisRequest,
    CompetitorAnalysisResult,
    SaveStatus,
    SaveContentRequest,
    SaveImageRequest,
    AnalysisRecordOut,
    ContentRecordOut,
    ImageRecordOut,

)
from pathlib import Path
import time
from typing import List, Optional
from sqlalchemy.orm import Session
from db import get_db
from .auth_utils import get_current_user_email
from models.history import AnalysisRecord, ContentRecord, ImageRecord
from .history_router import history_router

router = APIRouter()  # No version prefix; mounted under /api in main.py



# GIAI ĐOẠN 1: PHÂN TÍCH DỮ LIỆU THỊ TRƯỜNG

@router.post("/analyze_product", response_model=ProductAnalysisResult)
def analyze_product(request: ProductAnalysisRequest):
    print(f"Bắt đầu phân tích sản phẩm: {request.product_name}")
    try:
        result = analyze_product_data(request.product_name)
        if result:
            return result
    except Exception as e:
        print(f"Lỗi phân tích dữ liệu ở Giai đoạn 1: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể phân tích sản phẩm. Lỗi chi tiết: {str(e)}")
    
    return ProductAnalysisResult(product_name=request.product_name, usps=[], pain_points=[], infor="Khong tim thay du lieu", target_persona="Không tìm thấy dữ liệu.")


# ===============================================
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
    style_short: str = Form(None, description="Yêu cầu phong cách ngắn (tuỳ chọn)."),
    reference_image: UploadFile = File(..., description="Ảnh mẫu (bắt buộc) để chỉnh sửa/biến thể")
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
            style_short=style_short,
            original_image_bytes=ref_bytes,
            original_image_path=saved_path if reference_image else None
        )
        if result:
            return result
    except Exception as e:
        msg = str(e)
        print(f"Lỗi tạo Poster ở Giai đoạn 3: {msg}")
        raise HTTPException(status_code=500, detail=msg)
    raise HTTPException(status_code=400, detail="Không thể tạo Poster, vui lòng kiểm tra log backend.")

@router.get("/image_limitations")
def image_limitations():
    """Trả về danh sách các hạn chế đã biết của mô hình xử lý hình ảnh để hiển thị phía frontend."""
    return {"limitations": IMAGE_LIMITATIONS}

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

@router.post("/analyze_competitor", response_model=CompetitorAnalysisResult)
def analyze_competitor(request: CompetitorAnalysisRequest):
    """
    Endpoint để phân tích đối thủ cạnh tranh.
    """
    print(f"Bắt đầu phân tích đối thủ: {request.competitor_name} trên thị trường {request.market_description}")
    try:
        result = analyze_competitor_market(request)
        if result:
            return result
    except Exception as e:
        print(f"Lỗi phân tích đối thủ: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể phân tích đối thủ. Lỗi chi tiết: {str(e)}")
    
    raise HTTPException(status_code=400, detail="Không thể phân tích đối thủ, vui lòng thử lại.")

@router.post("/analyze_document", response_model=ProductAnalysisResult)
async def analyze_document(
    file: UploadFile = File(..., description="Tài liệu sản phẩm (PDF, DOCX, TXT)"),
    user_email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    """
    Endpoint để phân tích tài liệu sản phẩm và lưu kết quả.
    """
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ. Chỉ chấp nhận PDF, DOCX, TXT.")

    try:
        contents = await file.read()
        analysis_result = await generate_product_analysis_from_document(contents, file.filename)

        # Lưu kết quả vào DB
        analysis_record = AnalysisRecord(
            user_email=user_email,
            product_name=analysis_result.product_name,
            usps_json=json.dumps(analysis_result.usps),
            pain_points_json=json.dumps(analysis_result.pain_points),
            target_persona=analysis_result.target_persona,
            infor=analysis_result.infor
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)

        return analysis_result

    except Exception as e:
        db.rollback()
        print(f"Lỗi khi phân tích tài liệu: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: {str(e)}")