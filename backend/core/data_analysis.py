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
    Conduct market research for the product: '{product_name}'.
Using publicly available search data, analyze and extract the following parameters:

1. At least 3 Unique Selling Points (USPs) of the product.

2. At least 3 Customer Pain Points that the product addresses.

3. A brief description of the Target Customer Persona for this product.

4. Key Product Specifications, only using 5 short keywords.

The output must be a valid JSON object (no additional text outside the JSON)
with the following keys: 'usps' (list of strings), 'pain_points' (list of strings), 'infor' (string), and 'target_persona' (string)
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
            target_persona=data.get('target_persona', 'Chưa xác định'),
            infor=data.get('infor', 'Chưa xác định')
        )
        
    except Exception as e:
        # Bắt các lỗi kết nối hoặc lỗi API chung khác
        print(f"Lỗi API Gemini hoặc lỗi kết nối chung: {e}")
        return None