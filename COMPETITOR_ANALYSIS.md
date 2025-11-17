# Tính năng Phân tích Đối thủ Cạnh tranh

## Mô tả

Tính năng này cho phép phân tích chuyên sâu chiến lược thị trường của đối thủ cạnh tranh bằng cách sử dụng Gemini AI với Google Search. Hệ thống sẽ tự động thu thập và phân tích thông tin công khai về đối thủ theo 4 hạng mục chính.

## Cấu trúc File

```
backend/
├── core/
│   └── competitor_analysis.py      # Logic phân tích đối thủ cạnh tranh
├── models/
│   └── schemas.py                   # Schemas mới: CompetitorAnalysisRequest, CompetitorAnalysisResult
└── api/
    └── router.py                    # Endpoint: POST /v1/analyze_competitor

test_competitor_analysis.py          # Script test tính năng
```

## API Endpoint

### POST /v1/analyze_competitor

**Request Body:**
```json
{
  "competitor_name": "Tên đối thủ cạnh tranh"
}
```

**Response:**
```json
{
  "product_name": "Tên sản phẩm của đối thủ",
  "product_analysis": {
    "usps": ["USP 1", "USP 2", "..."],
    "key_specs": "Thông số kỹ thuật...",
    "quality_feedback": "Phản hồi về chất lượng...",
    "pricing_strategy": "Chiến lược định giá..."
  },
  "customer_focus": {
    "target_persona": "Chân dung khách hàng...",
    "missed_segments": "Phân khúc bị bỏ lỡ...",
    "pain_points": ["Pain point 1", "Pain point 2", "..."],
    "customer_journey": "Hành trình khách hàng..."
  },
  "marketing_strategy": {
    "key_channels": "Các kênh truyền thông...",
    "core_messaging": "Thông điệp cốt lõi...",
    "content_creative": "Nội dung sáng tạo..."
  },
  "distribution_market": {
    "distribution_channels": "Kênh phân phối...",
    "market_share_estimate": "Ước tính thị phần..."
  }
}
```

## Cách sử dụng

### 1. Cài đặt Dependencies

Đảm bảo đã cài đặt tất cả dependencies cần thiết:

```bash
pip install -r requirements.txt
```

### 2. Cấu hình Environment Variables

Trong file `.env`, đảm bảo có:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Khởi động Server

```bash
cd backend
uvicorn main:app --reload
```

### 4. Test tính năng

Chạy script test:

```bash
python test_competitor_analysis.py
```

Hoặc sử dụng curl:

```bash
curl -X POST "http://localhost:8000/v1/analyze_competitor" \
  -H "Content-Type: application/json" \
  -d '{"competitor_name": "Coca Cola"}'
```

## Prompt Engineering

Prompt được thiết kế để:

1. **Sử dụng Google Search**: Tích hợp tính năng tìm kiếm web của Gemini để thu thập thông tin công khai
2. **Cấu trúc rõ ràng**: Yêu cầu output theo định dạng JSON chặt chẽ với 4 hạng mục chính
3. **Ngôn ngữ Tiếng Việt**: Tất cả kết quả được trả về bằng tiếng Việt
4. **Chi tiết và toàn diện**: Phân tích sâu về sản phẩm, khách hàng, marketing và phân phối

## Các hạng mục phân tích

### 1. Product Analysis (Phân tích sản phẩm)
- Điểm bán hàng độc đáo (USPs)
- Thông số kỹ thuật nổi bật
- Phản hồi về chất lượng
- Chiến lược định giá

### 2. Customer Focus (Tập trung vào khách hàng)
- Chân dung khách hàng mục tiêu
- Phân khúc khách hàng bị bỏ lỡ
- Điểm đau của khách hàng
- Hành trình khách hàng

### 3. Marketing Strategy (Chiến lược Marketing)
- Kênh truyền thông chính
- Thông điệp cốt lõi
- Nội dung sáng tạo và KOLs

### 4. Distribution & Market (Phân phối & Thị trường)
- Kênh phân phối
- Ước tính thị phần

## Lưu ý

1. **Thời gian xử lý**: API có thể mất 30-60 giây để phân tích do cần tìm kiếm và xử lý nhiều thông tin
2. **Rate Limiting**: Gemini API có giới hạn request, nên cân nhắc implement caching cho các đối thủ đã phân tích
3. **Độ chính xác**: Kết quả phụ thuộc vào thông tin công khai có sẵn trên web về đối thủ cạnh tranh
4. **Ngôn ngữ**: Prompt được tối ưu cho tiếng Việt, nhưng có thể phân tích đối thủ quốc tế

## Ví dụ Response

Xem file `competitor_analysis_Coca_Cola.json` được tạo ra sau khi chạy test script.

## Tích hợp với Frontend

Để tích hợp vào frontend, có thể tạo component mới:

```javascript
// Example React component
const CompetitorAnalysis = () => {
  const [competitorName, setCompetitorName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCompetitor = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/v1/analyze_competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitor_name: competitorName })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render UI...
};
```

## Cải tiến trong tương lai

1. Thêm caching để giảm số lần gọi API
2. Implement export PDF/Word cho báo cáo phân tích
3. So sánh nhiều đối thủ cạnh tranh cùng lúc
4. Tích hợp biểu đồ và visualization
5. Theo dõi thay đổi theo thời gian
