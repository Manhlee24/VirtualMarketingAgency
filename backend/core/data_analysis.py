import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models.product import ProductAnalysisResult

# Tải biến môi trường
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY không được tìm thấy. Vui lòng tạo file .env.")
client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_product_data(product_name: str) -> ProductAnalysisResult | None:
    """
    Sử dụng Gemini API với chức năng tìm kiếm web để phân tích và trích xuất dữ liệu.
    """
    
    # Kỹ thuật Prompt Engineering
    prompt = f"""
    Thực hiện nghiên cứu thị trường cho sản phẩm: '{product_name}'.
    Sử dụng dữ liệu tìm kiếm công khai, hãy phân tích để trích xuất các thông số sau:
    1.  Tối thiểu 3 **Điểm bán hàng độc nhất (USP)** của sản phẩm.
    2.  Tối thiểu 3 **Điểm đau của khách hàng (Pain Points)** mà sản phẩm này giải quyết.
    3.  Một **Chân dung khách hàng mục tiêu (Target Persona)** chi tiết, mô tả nhân khẩu học và tâm lý.

    Định dạng kết quả đầu ra **bắt buộc** phải là một JSON object HỢP LỆ (không có bất kỳ text nào khác ngoài JSON) 
    với các keys: 'usps' (list of strings), 'pain_points' (list of strings), và 'target_persona' (string).
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}] # Kích hoạt công cụ tìm kiếm
            )
        )
        
        # 1. KIỂM TRA NỘI DUNG PHẢN HỒI (KHẮC PHỤC 'NoneType' object has no attribute 'strip')
        if not response.text:
            print(f"Gemini API không trả về nội dung văn bản cho sản phẩm: {product_name}")
            return None
            
        # 2. XỬ LÝ VÀ PHÂN TÍCH JSON
        try:
            json_text = response.text.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(json_text)
        except json.JSONDecodeError as e:
            print(f"Lỗi phân tích JSON từ Gemini: {e}")
            print(f"Text gốc gây lỗi: {response.text[:200]}...")
            # Có thể trả về kết quả rỗng nếu không thể đọc được
            return None
        
        return ProductAnalysisResult(
            product_name=product_name,
            usps=data.get('usps', []),
            pain_points=data.get('pain_points', []),
            target_persona=data.get('target_persona', 'Chưa xác định')
        )
        
    except Exception as e:
        # Bắt các lỗi kết nối hoặc lỗi API chung khác
        print(f"Lỗi API Gemini hoặc lỗi kết nối chung: {e}")
        return None