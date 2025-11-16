# Hướng dẫn Nhanh - Tính năng Phân tích Đối thủ Cạnh tranh

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Terminal 1 - Start backend
cd backend
uvicorn main:app --reload
```

Backend sẽ chạy tại: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Terminal 2 - Install dependencies (chỉ lần đầu)
cd frontend
npm install
npm install lucide-react

# Start frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3. Truy cập tính năng

Mở browser và truy cập:
- Trang chủ: `http://localhost:5173/`
- Phân tích đối thủ: `http://localhost:5173/competitor-analysis`

## 📋 Checklist trước khi chạy

- [ ] Backend đang chạy (`uvicorn main:app --reload`)
- [ ] Frontend đang chạy (`npm run dev`)
- [ ] Đã cài đặt `lucide-react` (`npm install lucide-react`)
- [ ] File `.env` có `GEMINI_API_KEY` hợp lệ
- [ ] Kết nối internet ổn định (cần cho Google Search)

## 🎯 Cách sử dụng

### Từ Homepage
1. Mở `http://localhost:5173/`
2. Click vào card **"Phân Tích Đối Thủ"** (màu tím)
3. Hoặc click link **"Phân tích Đối thủ"** trên Header

### Từ trang Competitor Analysis
1. Nhập tên đối thủ cạnh tranh (VD: Vinamilk, Coca Cola, Samsung)
2. Hoặc click vào gợi ý nhanh
3. Click nút **"Phân tích"**
4. Đợi 30-60 giây để AI phân tích
5. Xem kết quả qua 4 tabs:
   - 📦 Sản phẩm
   - 👥 Khách hàng  
   - 📈 Marketing
   - 🏪 Phân phối
6. Click **"Xuất JSON"** để tải kết quả

## 🎨 Giao diện

### Homepage
- Card mới màu tím: **Phân Tích Đối Thủ**
- Badge "Tính năng mới" màu vàng
- Link trực tiếp đến trang phân tích

### Header Navigation
- Menu mới: **"Phân tích Đối thủ"**
- Badge **"NEW"** màu vàng
- Luôn hiển thị (không cần đăng nhập)

### Competitor Analysis Page
- **Design độc lập**: Purple/Indigo gradient theme
- **4 Tabs**: Product, Customer, Marketing, Distribution
- **Icons**: Từ Lucide React
- **Responsive**: Desktop, Tablet, Mobile
- **Export**: Download JSON

## ⚙️ API Configuration

Nếu backend chạy ở port khác, cập nhật trong file:
`frontend/src/pages/CompetitorAnalysisPage.jsx`

```javascript
const API_BASE_URL = "http://localhost:8000/v1";
```

## 🐛 Troubleshooting

### Icons không hiển thị
```bash
cd frontend
npm install lucide-react
```

### Backend error: "upload_to_cloudinary not defined"
Lỗi này đã tồn tại từ trước, không ảnh hưởng đến tính năng mới.

### CORS Error
Kiểm tra backend có cấu hình CORS cho `localhost:5173`

### Gemini API Error
- Kiểm tra `GEMINI_API_KEY` trong file `.env`
- Kiểm tra quota API còn lại
- Kiểm tra kết nối internet

### Timeout Error
- Bình thường, phân tích có thể mất 30-60 giây
- Đợi hoặc thử lại nếu quá 2 phút

## 📱 Test Cases

1. **Test search với competitor hợp lệ**
   - Input: "Coca Cola"
   - Expected: Kết quả phân tích chi tiết

2. **Test empty input**
   - Input: ""
   - Expected: Error message

3. **Test tab switching**
   - Switch giữa 4 tabs
   - Expected: Nội dung thay đổi, không reload

4. **Test export**
   - Click "Xuất JSON"
   - Expected: File download với tên `competitor_analysis_<name>.json`

5. **Test responsive**
   - Resize browser
   - Expected: Layout adapt theo screen size

## 📂 Files đã tạo/sửa

### Backend
- ✅ `backend/core/competitor_analysis.py` - New
- ✅ `backend/models/schemas.py` - Updated
- ✅ `backend/api/router.py` - Updated

### Frontend
- ✅ `frontend/src/pages/CompetitorAnalysisPage.jsx` - New
- ✅ `frontend/src/pages/HomePage.jsx` - Updated
- ✅ `frontend/src/components/Header.jsx` - Updated
- ✅ `frontend/src/App.jsx` - Updated

### Test & Docs
- ✅ `test_competitor_analysis.py` - New
- ✅ `demo_competitor_analysis.py` - New
- ✅ `COMPETITOR_ANALYSIS.md` - New
- ✅ `frontend/COMPETITOR_ANALYSIS_FRONTEND.md` - New
- ✅ `QUICK_START.md` - New (file này)

## 🎉 Ready to Go!

Nếu tất cả đã setup đúng, bạn có thể:
1. Mở `http://localhost:5173/`
2. Click vào "Phân Tích Đối Thủ"
3. Nhập tên đối thủ và phân tích!

**Lưu ý**: Tính năng này hoàn toàn độc lập, không cần đăng nhập và có giao diện riêng biệt!
