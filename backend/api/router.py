


from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends, Header, status
import json
import logging

logger = logging.getLogger(__name__)
from core.data_analysis import analyze_product_data
from core.content_generation import generate_marketing_content
from core.document_analysis import generate_product_analysis_from_document

from core.image_generation import (
    generate_marketing_poster,
    upload_to_cloudinary,
    IMAGE_LIMITATIONS,
    build_poster_brief_template,
    build_style_suggestion,
)

from core.competitor_analysis import analyze_competitor_market
from google.genai.errors import ServerError as GeminiServerError
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
    try:
        usps = []
        if getattr(request, "selected_usps", None):
            usps = [u for u in request.selected_usps if u]
        elif getattr(request, "selected_usp", None):
            usps = [str(request.selected_usp)]
        print(f"Bắt đầu tạo nội dung cho USP(s): {', '.join(usps)}")
    except Exception:
        print("Bắt đầu tạo nội dung cho USP(s): (không xác định)")
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


@router.get("/poster_prompt_template")
def poster_prompt_template(
    product_name: str,
    product_type: Optional[str] = None,
    lighting_overall: Optional[str] = None,
    lighting_effect: Optional[str] = None,
    style: Optional[str] = None,
    palette: Optional[str] = None,
    mood: Optional[str] = None,
    context: Optional[str] = None,
    detail: Optional[str] = None,
    camera: Optional[str] = None,
):
    """Sinh template hướng dẫn và gợi ý phong cách tóm tắt dựa trên tên/loại sản phẩm và (tuỳ chọn) các thuộc tính đã chọn."""
    try:
        text = build_poster_brief_template(
            product_name=product_name,
            product_type=product_type,
            lighting_overall=lighting_overall,
            lighting_effect=lighting_effect,
            style=style,
            palette=palette,
            mood=mood,
            context=context,
            detail=detail,
            camera=camera,
        )
        style_suggestion = build_style_suggestion(
            product_name=product_name,
            lighting_overall=lighting_overall,
            lighting_effect=lighting_effect,
            style=style,
            palette=palette,
            mood=mood,
            context=context,
            detail=detail,
            camera=camera,
        )
        return {
            "product_name": product_name,
            "product_type": product_type,
            "template": text,
            "style_suggestion": style_suggestion,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze_competitor", response_model=CompetitorAnalysisResult)
def analyze_competitor(request: CompetitorAnalysisRequest):
    """
    Endpoint để phân tích đối thủ cạnh tranh.
    """
    print(f"Bắt đầu phân tích đối thủ: {request.competitor_name}")
    try:
        # analyze_competitor_market expects a competitor name (string)
        result = analyze_competitor_market(request.competitor_name)
        if result:
            # Ensure response matches Pydantic model
            return CompetitorAnalysisResult(**result)
        # Không có kết quả nhưng không lỗi cụ thể -> 502 Bad Gateway (lỗi xử lý từ dịch vụ ngoài)
        raise HTTPException(status_code=502, detail="Không thể phân tích đối thủ (không nhận được dữ liệu hợp lệ từ mô hình). Vui lòng thử lại.")
    except GeminiServerError as ge:
        msg = str(ge)
        # Map đúng mã 503 khi model quá tải
        if getattr(ge, "status_code", None) == 503 or "UNAVAILABLE" in msg or "overloaded" in msg.lower():
            raise HTTPException(status_code=503, detail="Mô hình đang quá tải. Vui lòng thử lại sau.")
        # Các lỗi server khác của Gemini
        raise HTTPException(status_code=502, detail=f"Lỗi từ mô hình: {msg}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Lỗi phân tích đối thủ: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: Không thể phân tích đối thủ. Lỗi chi tiết: {str(e)}")

@router.post("/analyze_document", response_model=ProductAnalysisResult)
async def analyze_document(
    file: UploadFile = File(..., description="Tài liệu sản phẩm (PDF, DOCX, TXT)"),
    user_email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    """Phân tích tài liệu để trích xuất thông tin sản phẩm chuẩn hóa.

    Tự động suy luận loại file từ phần mở rộng. Hỗ trợ: pdf, docx, txt.
    """
    filename_lower = file.filename.lower()
    if not filename_lower.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Định dạng file không hợp lệ. Chỉ chấp nhận PDF, DOCX, TXT.")

    # Suy luận file_type
    if filename_lower.endswith(".pdf"):
        file_type = "pdf"
    elif filename_lower.endswith(".docx"):
        file_type = "docx"
    else:
        file_type = "txt"

    try:
        contents = await file.read()
        # Pass empty product_name to allow auto-guessing inside core function
        analysis_result = generate_product_analysis_from_document("", contents, file_type)
        if not analysis_result:
            raise HTTPException(status_code=500, detail="Không thể phân tích tài liệu (kết quả rỗng).")

        # Lưu kết quả vào DB
        analysis_record = AnalysisRecord(
            user_email=user_email,
            product_name=analysis_result.product_name,
            usps_json=json.dumps(analysis_result.usps, ensure_ascii=False),
            pain_points_json=json.dumps(analysis_result.pain_points, ensure_ascii=False),
            target_persona=analysis_result.target_persona,
            infor=analysis_result.infor
        )
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)

        return analysis_result

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.exception("Lỗi khi phân tích tài liệu")
        raise HTTPException(status_code=500, detail=f"Lỗi Server: {str(e)}")
