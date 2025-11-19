from fastapi import APIRouter, HTTPException, Depends
import json
from typing import List
from sqlalchemy.orm import Session
from db import get_db
from .auth_utils import get_current_user_email
from models.history import AnalysisRecord, ContentRecord, ImageRecord
from models.schemas import (
    AnalysisRecordOut,
    ContentRecordOut,
    ImageRecordOut,
    SaveStatus,
    SaveImageRequest,
    ProductAnalysisResult,
    SaveContentRequest,
)

history_router = APIRouter()


@history_router.get("/analyses", response_model=List[AnalysisRecordOut])
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


@history_router.post("/analyses", response_model=SaveStatus)
def save_analysis(payload: ProductAnalysisResult, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    try:
        # Kiểm tra xem record đã tồn tại chưa để tránh trùng lặp
        existing = (
            db.query(AnalysisRecord)
            .filter(
                AnalysisRecord.user_email == user_email,
                AnalysisRecord.product_name == payload.product_name,
                AnalysisRecord.target_persona == payload.target_persona,
            )
            .first()
        )
        if existing:
            return SaveStatus(id=existing.id, message="exists")

        rec = AnalysisRecord(
            user_email=user_email,
            product_name=payload.product_name,
            usps_json=json.dumps(payload.usps),
            pain_points_json=json.dumps(payload.pain_points),
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


@history_router.get("/contents", response_model=List[ContentRecordOut])
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


@history_router.post("/contents", response_model=SaveStatus)
def save_content(payload: SaveContentRequest, user_email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    try:
        # Kiểm tra xem record đã tồn tại chưa
        existing = (
            db.query(ContentRecord)
            .filter(
                ContentRecord.user_email == user_email,
                ContentRecord.title == payload.title,
                ContentRecord.content == payload.content,
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


@history_router.get("/images", response_model=List[ImageRecordOut])
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
            # Do not expose prompt history anymore
            prompt_used=None,
            reference_url=r.reference_url,
            created_at=r.created_at,
        )
        for r in rows
    ]


@history_router.post("/images", response_model=SaveStatus)
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
            # Do not store prompt content anymore
            prompt_used=None,
            reference_url=payload.reference_url,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return SaveStatus(id=rec.id, message="saved")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@history_router.delete("/analyses/{record_id}", response_model=SaveStatus)
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


@history_router.delete("/contents/{record_id}", response_model=SaveStatus)
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


@history_router.delete("/images/{record_id}", response_model=SaveStatus)
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
