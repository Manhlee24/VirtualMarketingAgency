from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <<-- THAY ĐỔI Ở ĐÂY
from api.router import router as api_router
from api.auth_router import router as auth_router
import sys
import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

app = FastAPI(title="Virtual Marketing Agency Backend")

# Danh sách các domain được phép truy cập API của bạn
# ĐẢM BẢO CHỌN ĐÚNG CỔNG FRONTEND REACT CỦA BẠN (3000 hoặc 5173)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Cổng phổ biến nếu dùng Vite
    "http://127.0.0.1:5173",
]

# Thêm CORSMiddleware vào ứng dụng
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             # Cho phép các nguồn gốc trong danh sách
    allow_credentials=True,            # Cho phép cookie/headers
    allow_methods=["*"],               # Cho phép tất cả các phương thức (POST là quan trọng nhất)
    allow_headers=["*"],               # Cho phép tất cả các header
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
@app.get("/")
def read_root():
    return {"message": "Virtual Marketing Agency Backend - Ready"}

# LƯU VÀ CHUYỂN SANG BƯỚC 3