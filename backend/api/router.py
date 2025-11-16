# backend/api/router.py

from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends, Header, status
import json
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
from core.auth import decode_access_token
from models.user import User
from models.history import AnalysisRecord, ContentRecord, ImageRecord

router = APIRouter(prefix="/v1")
def get_current_user_email(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")
    token = authorization.split()[1]
    payload = decode_access_token(token)
    if not payload or not payload.get("user_id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload["user_id"]
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return email


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
# SAVE & HISTORY ENDPOINTS (Authenticated)
# ===============================================

@router.post("/save_analysis", response_model=SaveStatus)
def save_analysis(payload: ProductAnalysisResult, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    try:
        # Prevent duplicate saves of identical analysis
        usps_s = json.dumps(payload.usps or [], ensure_ascii=False)
        pain_s = json.dumps(payload.pain_points or [], ensure_ascii=False)
        existing = (
            db.query(AnalysisRecord)
            .filter(
                AnalysisRecord.user_email == user_email,
                AnalysisRecord.product_name == payload.product_name,
                AnalysisRecord.usps_json == usps_s,
                AnalysisRecord.pain_points_json == pain_s,
                AnalysisRecord.target_persona == (payload.target_persona or ""),
                AnalysisRecord.infor == (payload.infor or ""),
            )
            .first()
        )
        if existing:
            return SaveStatus(id=existing.id, message="exists")

        rec = AnalysisRecord(
            user_email=user_email,
            product_name=payload.product_name,
            usps_json=usps_s,
            pain_points_json=pain_s,
            target_persona=payload.target_persona,
            infor=payload.infor,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return SaveStatus(id=rec.id, message="saved")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save_content", response_model=SaveStatus)
def save_content(payload: SaveContentRequest, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    try:
        # Prevent duplicate saves of identical content
        existing = (
            db.query(ContentRecord)
            .filter(
                ContentRecord.user_email == user_email,
                ContentRecord.product_name == payload.product_name,
                ContentRecord.title == payload.title,
                ContentRecord.content == payload.content,
                ContentRecord.selected_usp == payload.selected_usp,
                ContentRecord.selected_tone == payload.selected_tone,
                ContentRecord.selected_format == payload.selected_format,
                ContentRecord.infor == (payload.infor or ""),
            )
            .first()
        )
        if existing:
            return SaveStatus(id=existing.id, message="exists")

        rec = ContentRecord(
            user_email=user_email,
            product_name=payload.product_name,
            target_persona=payload.target_persona,
            selected_usp=payload.selected_usp,
            selected_tone=payload.selected_tone,
            selected_format=payload.selected_format,
            infor=payload.infor,
            title=payload.title,
            content=payload.content,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return SaveStatus(id=rec.id, message="saved")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save_image", response_model=SaveStatus)
def save_image(payload: SaveImageRequest, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    try:
        # Prevent duplicate saves (use image_url as primary key for idempotency)
        existing = (
            db.query(ImageRecord)
            .filter(
                ImageRecord.user_email == user_email,
                ImageRecord.image_url == payload.image_url,
            )
            .first()
        )
        if existing:
            return SaveStatus(id=existing.id, message="exists")

        rec = ImageRecord(
            user_email=user_email,
            product_name=payload.product_name,
            ad_copy=payload.ad_copy,
            usp=payload.usp,
            infor=payload.infor,
            style_short=payload.style_short,
            image_url=payload.image_url,
            prompt_used=payload.prompt_used,
            reference_url=payload.reference_url,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return SaveStatus(id=rec.id, message="saved")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/analyses", response_model=List[AnalysisRecordOut])
def list_analyses(user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rows = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_email == user_email)
        .order_by(AnalysisRecord.id.desc())
        .all()
    )
    out = []
    for r in rows:
        try:
            usps = json.loads(r.usps_json) if r.usps_json else []
        except Exception:
            usps = []
        try:
            pain = json.loads(r.pain_points_json) if r.pain_points_json else []
        except Exception:
            pain = []
        out.append(
            AnalysisRecordOut(
                id=r.id,
                product_name=r.product_name,
                usps=usps,
                pain_points=pain,
                target_persona=r.target_persona,
                infor=r.infor,
                created_at=r.created_at,
            )
        )
    return out


@router.get("/history/contents", response_model=List[ContentRecordOut])
def list_contents(user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rows = (
        db.query(ContentRecord)
        .filter(ContentRecord.user_email == user_email)
        .order_by(ContentRecord.id.desc())
        .all()
    )
    return [
        ContentRecordOut(
            id=r.id,
            product_name=r.product_name,
            target_persona=r.target_persona,
            selected_usp=r.selected_usp,
            selected_tone=r.selected_tone,
            selected_format=r.selected_format,
            infor=r.infor,
            title=r.title,
            content=r.content,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/history/images", response_model=List[ImageRecordOut])
def list_images(user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rows = (
        db.query(ImageRecord)
        .filter(ImageRecord.user_email == user_email)
        .order_by(ImageRecord.id.desc())
        .all()
    )
    return [
        ImageRecordOut(
            id=r.id,
            product_name=r.product_name,
            ad_copy=r.ad_copy,
            usp=r.usp,
            infor=r.infor,
            style_short=r.style_short,
            image_url=r.image_url,
            prompt_used=r.prompt_used,
            reference_url=r.reference_url,
            created_at=r.created_at,
        )
        for r in rows
    ]


# ===============================================
# DELETE HISTORY RECORDS (Authenticated)
# ===============================================

@router.delete("/history/analyses/{record_id}", response_model=SaveStatus)
def delete_analysis_record(record_id: int, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rec = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id, AnalysisRecord.user_email == user_email).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        db.delete(rec)
        db.commit()
        return SaveStatus(id=record_id, message="deleted")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/contents/{record_id}", response_model=SaveStatus)
def delete_content_record(record_id: int, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rec = db.query(ContentRecord).filter(ContentRecord.id == record_id, ContentRecord.user_email == user_email).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        db.delete(rec)
        db.commit()
        return SaveStatus(id=record_id, message="deleted")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/images/{record_id}", response_model=SaveStatus)
def delete_image_record(record_id: int, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    rec = db.query(ImageRecord).filter(ImageRecord.id == record_id, ImageRecord.user_email == user_email).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        db.delete(rec)
        db.commit()
        return SaveStatus(id=record_id, message="deleted")
    except Exception as e:
        db.rollback()
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

