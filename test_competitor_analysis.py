"""
Script test để kiểm tra tính năng phân tích đối thủ cạnh tranh.
Chạy script này sau khi server đã được khởi động.
"""
import requests
import json

# URL của API endpoint
API_URL = "http://localhost:8000/v1/analyze_competitor"

# Test case
competitor_name = "Coca Cola"

def test_competitor_analysis():
    """Test endpoint phân tích đối thủ cạnh tranh"""
    
    print(f"\n{'='*60}")
    print(f"PHÂN TÍCH ĐỐI THỦ CẠNH TRANH: {competitor_name}")
    print(f"{'='*60}\n")
    
    # Tạo request
    payload = {
        "competitor_name": competitor_name
    }
    
    try:
        # Gọi API
        print("Đang gửi request đến API...")
        response = requests.post(API_URL, json=payload, timeout=120)
        
        # Kiểm tra status code
        if response.status_code == 200:
            print("✓ Request thành công!\n")
            
            # Parse kết quả
            result = response.json()
            
            # Hiển thị kết quả
            print(f"{'='*60}")
            print("KẾT QUẢ PHÂN TÍCH")
            print(f"{'='*60}\n")
            
            print(f"Tên sản phẩm: {result.get('product_name', 'N/A')}\n")
            
            # 1. Phân tích sản phẩm
            print(f"{'─'*60}")
            print("1. PHÂN TÍCH SẢN PHẨM")
            print(f"{'─'*60}")
            product_analysis = result.get('product_analysis', {})
            print(f"\nĐiểm bán hàng độc đáo (USPs):")
            for idx, usp in enumerate(product_analysis.get('usps', []), 1):
                print(f"  {idx}. {usp}")
            print(f"\nThông số kỹ thuật: {product_analysis.get('key_specs', 'N/A')}")
            print(f"\nPhản hồi chất lượng: {product_analysis.get('quality_feedback', 'N/A')}")
            print(f"\nChiến lược định giá: {product_analysis.get('pricing_strategy', 'N/A')}")
            
            # 2. Khách hàng mục tiêu
            print(f"\n{'─'*60}")
            print("2. TẬP TRUNG VÀO KHÁCH HÀNG")
            print(f"{'─'*60}")
            customer_focus = result.get('customer_focus', {})
            print(f"\nChân dung khách hàng mục tiêu: {customer_focus.get('target_persona', 'N/A')}")
            print(f"\nPhân khúc bị bỏ lỡ: {customer_focus.get('missed_segments', 'N/A')}")
            print(f"\nĐiểm đau của khách hàng:")
            for idx, pain in enumerate(customer_focus.get('pain_points', []), 1):
                print(f"  {idx}. {pain}")
            print(f"\nHành trình khách hàng: {customer_focus.get('customer_journey', 'N/A')}")
            
            # 3. Chiến lược Marketing
            print(f"\n{'─'*60}")
            print("3. CHIẾN LƯỢC MARKETING")
            print(f"{'─'*60}")
            marketing = result.get('marketing_strategy', {})
            print(f"\nKênh truyền thông chính: {marketing.get('key_channels', 'N/A')}")
            print(f"\nThông điệp cốt lõi: {marketing.get('core_messaging', 'N/A')}")
            print(f"\nNội dung sáng tạo: {marketing.get('content_creative', 'N/A')}")
            
            # 4. Phân phối & Thị trường
            print(f"\n{'─'*60}")
            print("4. PHÂN PHỐI & THỊ TRƯỜNG")
            print(f"{'─'*60}")
            distribution = result.get('distribution_market', {})
            print(f"\nKênh phân phối: {distribution.get('distribution_channels', 'N/A')}")
            print(f"\nƯớc tính thị phần: {distribution.get('market_share_estimate', 'N/A')}")
            
            print(f"\n{'='*60}\n")
            
            # Lưu kết quả ra file
            output_file = f"competitor_analysis_{competitor_name.replace(' ', '_')}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"✓ Kết quả đã được lưu vào file: {output_file}")
            
        else:
            print(f"✗ Lỗi: {response.status_code}")
            print(f"Chi tiết: {response.text}")
            
    except requests.exceptions.Timeout:
        print("✗ Request timeout! API mất quá nhiều thời gian để phản hồi.")
    except requests.exceptions.ConnectionError:
        print("✗ Không thể kết nối đến server. Hãy chắc chắn server đang chạy.")
    except Exception as e:
        print(f"✗ Lỗi: {e}")


if __name__ == "__main__":
    test_competitor_analysis()
