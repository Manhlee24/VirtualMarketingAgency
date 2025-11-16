from sqlalchemy import Column, Integer, String, Text, DateTime, func
from db import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(255), index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    usps_json = Column(Text, nullable=False)           # JSON string array
    pain_points_json = Column(Text, nullable=False)    # JSON string array
    target_persona = Column(Text, nullable=False)
    infor = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ContentRecord(Base):
    __tablename__ = "content_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(255), index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    target_persona = Column(Text, nullable=False)
    selected_usp = Column(Text, nullable=False)
    selected_tone = Column(String(255), nullable=False)
    selected_format = Column(String(255), nullable=False)
    infor = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ImageRecord(Base):
    __tablename__ = "image_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_email = Column(String(255), index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    ad_copy = Column(Text, nullable=False)
    usp = Column(Text, nullable=False)
    infor = Column(Text, nullable=False)
    style_short = Column(Text, nullable=True)
    image_url = Column(Text, nullable=False)
    prompt_used = Column(Text, nullable=True)
    reference_url = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
