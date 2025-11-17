"""
Script demo để test trực tiếp function phân tích đối thủ cạnh tranh
mà không cần khởi động server FastAPI.
"""
import sys
import os
import json

# Thêm thư mục backend vào path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from core.competitor_analysis import analyze_competitor_market


def demo_competitor_analysis():
    """Demo phân tích đối thủ cạnh tranh"""
    
    # Danh sách các đối thủ để test
    competitors = [
        "Vinamilk",
        "Grab",
        "Shopee",
    ]
    
    print("\n" + "="*70)
    print("DEMO PHÂN TÍCH ĐỐI THỦ CẠNH TRANH")
    print("="*70 + "\n")
    
    # Cho người dùng chọn hoặc nhập tên đối thủ
    print("Chọn đối thủ cạnh tranh để phân tích:")
    for idx, comp in enumerate(competitors, 1):
        print(f"  {idx}. {comp}")
    print(f"  {len(competitors) + 1}. Nhập tên khác")
    
    choice = input("\nLựa chọn của bạn (1-4): ").strip()
    
    if choice.isdigit() and 1 <= int(choice) <= len(competitors):
        competitor_name = competitors[int(choice) - 1]
    else:
        competitor_name = input("Nhập tên đối thủ cạnh tranh: ").strip()
    
    if not competitor_name:
        print("Tên đối thủ không hợp lệ!")
        return
    
    print(f"\n{'='*70}")
    print(f"Đang phân tích: {competitor_name}")
    print(f"{'='*70}\n")
    print("⏳ Vui lòng đợi... (có thể mất 30-60 giây)\n")
    
    # Gọi function phân tích
    result = analyze_competitor_market(competitor_name)
    
    if result:
        print("✓ Phân tích thành công!\n")
        
        # Hiển thị kết quả
        print(f"{'='*70}")
        print("KẾT QUẢ PHÂN TÍCH")
        print(f"{'='*70}\n")
        
        print(f"Sản phẩm: {result.get('product_name', 'N/A')}\n")
        
        # 1. Phân tích sản phẩm
        print(f"{'─'*70}")
        print("1. PHÂN TÍCH SẢN PHẨM")
        print(f"{'─'*70}")
        pa = result.get('product_analysis', {})
        print("\n📌 Điểm bán hàng độc đáo (USPs):")
        for idx, usp in enumerate(pa.get('usps', []), 1):
            print(f"   {idx}. {usp}")
        print(f"\n⚙️  Thông số kỹ thuật:\n   {pa.get('key_specs', 'N/A')}")
        print(f"\n⭐ Phản hồi chất lượng:\n   {pa.get('quality_feedback', 'N/A')}")
        print(f"\n💰 Chiến lược định giá:\n   {pa.get('pricing_strategy', 'N/A')}")
        
        # 2. Khách hàng
        print(f"\n{'─'*70}")
        print("2. TẬP TRUNG VÀO KHÁCH HÀNG")
        print(f"{'─'*70}")
        cf = result.get('customer_focus', {})
        print(f"\n👥 Chân dung khách hàng:\n   {cf.get('target_persona', 'N/A')}")
        print(f"\n🎯 Phân khúc bị bỏ lỡ:\n   {cf.get('missed_segments', 'N/A')}")
        print("\n😟 Điểm đau của khách hàng:")
        for idx, pain in enumerate(cf.get('pain_points', []), 1):
            print(f"   {idx}. {pain}")
        print(f"\n🛒 Hành trình khách hàng:\n   {cf.get('customer_journey', 'N/A')}")
        
        # 3. Marketing
        print(f"\n{'─'*70}")
        print("3. CHIẾN LƯỢC MARKETING")
        print(f"{'─'*70}")
        ms = result.get('marketing_strategy', {})
        print(f"\n📢 Kênh truyền thông:\n   {ms.get('key_channels', 'N/A')}")
        print(f"\n💬 Thông điệp cốt lõi:\n   {ms.get('core_messaging', 'N/A')}")
        print(f"\n🎨 Nội dung sáng tạo:\n   {ms.get('content_creative', 'N/A')}")
        
        # 4. Phân phối
        print(f"\n{'─'*70}")
        print("4. PHÂN PHỐI & THỊ TRƯỜNG")
        print(f"{'─'*70}")
        dm = result.get('distribution_market', {})
        print(f"\n🏪 Kênh phân phối:\n   {dm.get('distribution_channels', 'N/A')}")
        print(f"\n📊 Ước tính thị phần:\n   {dm.get('market_share_estimate', 'N/A')}")
        
        print(f"\n{'='*70}\n")
        
        # Lưu kết quả
        filename = f"competitor_analysis_{competitor_name.replace(' ', '_')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Kết quả đã được lưu vào: {filename}")
        
    else:
        print("✗ Không thể phân tích đối thủ cạnh tranh.")
        print("   Kiểm tra:")
        print("   - API key Gemini đã được cấu hình chưa?")
        print("   - Kết nối internet có ổn định không?")


if __name__ == "__main__":
    try:
        demo_competitor_analysis()
    except KeyboardInterrupt:
        print("\n\n✗ Đã hủy bởi người dùng.")
    except Exception as e:
        print(f"\n✗ Lỗi: {e}")
        import traceback
        traceback.print_exc()
