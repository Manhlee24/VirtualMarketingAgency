# Tính năng Phân tích Đối thủ Cạnh tranh - Frontend

## Mô tả

Giao diện người dùng hiện đại và trực quan cho tính năng phân tích đối thủ cạnh tranh, được xây dựng với React và Tailwind CSS.

## Các component đã tạo

### 1. CompetitorAnalysisPage.jsx
Trang chính cho tính năng phân tích đối thủ với các tính năng:

- **Search Interface**: 
  - Input field với autocomplete suggestions
  - Quick examples (Coca Cola, Samsung, Nike)
  - Real-time validation

- **Loading State**:
  - Animated loading indicators
  - Progress information
  - Estimated time display

- **Results Display**:
  - 4 tabs chuyên biệt (Sản phẩm, Khách hàng, Marketing, Phân phối)
  - Color-coded sections với gradient backgrounds
  - Icon-based navigation với Lucide React

- **Export Functionality**:
  - Xuất kết quả ra file JSON
  - Tên file tự động theo tên đối thủ

## Thiết kế UI/UX

### Color Scheme
- **Purple/Indigo Gradient**: Primary brand colors
- **Section-specific colors**:
  - Product: Purple/Blue
  - Customer: Blue/Amber
  - Marketing: Blue/Pink/Purple
  - Distribution: Green/Orange

### Icons (Lucide React)
- `Target`: Logo chính
- `Search`: Tìm kiếm
- `Award`: USPs
- `Users`: Khách hàng
- `TrendingUp`: Marketing
- `ShoppingBag`: Phân phối
- `BarChart3`: Thống kê
- `Clock`: Loading
- `CheckCircle`: Success
- `AlertCircle`: Pain points/Errors

### Layout
- **Responsive Design**: Mobile-first approach
- **Max-width Container**: 7xl (1280px)
- **Spacing**: Consistent padding và margin
- **Shadows**: Layered shadow system cho depth

## Route

```
/competitor-analysis
```

**Public Route**: Không cần authentication (khác với /generator)

## Integration với Backend

### API Endpoint
```javascript
POST http://localhost:8000/v1/analyze_competitor
```

### Request Format
```json
{
  "competitor_name": "Tên đối thủ"
}
```

### Response Format
Xem `backend/models/schemas.py` - `CompetitorAnalysisResult`

## Cài đặt Dependencies

```bash
cd frontend
npm install lucide-react
```

## Chạy Development Server

```bash
cd frontend
npm run dev
```

Truy cập: `http://localhost:5173/competitor-analysis`

## Tính năng nổi bật

### 1. Tabbed Interface
- 4 tabs với nội dung riêng biệt
- Active state highlighting
- Smooth transitions

### 2. Smart Loading
- Animated loading indicators
- Estimated time display (30-60 seconds)
- Loading dots animation

### 3. Error Handling
- User-friendly error messages
- Retry suggestions
- Visual error indicators

### 4. Data Export
- One-click JSON export
- Automatic filename generation
- Clean formatted output

### 5. Responsive Design
- Desktop: Full layout với sidebar
- Tablet: Stacked layout
- Mobile: Single column

## Component Structure

```
CompetitorAnalysisPage
├── Header Section
│   ├── Logo
│   ├── Title
│   └── Description
├── Search Section
│   ├── Input Field
│   ├── Search Button
│   └── Quick Examples
├── Loading State
│   ├── Spinner
│   ├── Message
│   └── Progress Dots
├── Error Display
│   └── Error Message Card
└── Results Section
    ├── Results Header
    │   ├── Success Icon
    │   ├── Product Name
    │   └── Export Button
    ├── Tabs Navigation
    │   ├── Product Tab
    │   ├── Customer Tab
    │   ├── Marketing Tab
    │   └── Distribution Tab
    └── Tab Content
        ├── Product Analysis
        │   ├── USPs List
        │   ├── Key Specs
        │   ├── Quality Feedback
        │   └── Pricing Strategy
        ├── Customer Focus
        │   ├── Target Persona
        │   ├── Missed Segments
        │   ├── Pain Points
        │   └── Customer Journey
        ├── Marketing Strategy
        │   ├── Key Channels
        │   ├── Core Messaging
        │   └── Content Creative
        └── Distribution & Market
            ├── Distribution Channels
            └── Market Share Estimate
```

## Styling Guidelines

### Tailwind Classes Used
- **Gradients**: `bg-gradient-to-br`, `from-purple-50`, `to-indigo-100`
- **Shadows**: `shadow-xl`, `shadow-lg`
- **Rounded**: `rounded-2xl`, `rounded-xl`, `rounded-lg`
- **Spacing**: `p-8`, `py-4`, `px-6`, `gap-4`
- **Colors**: Purple/Indigo theme với accent colors
- **Transitions**: `transition-all`, `duration-300`
- **Hover Effects**: `hover:scale-105`, `hover:shadow-xl`

### Animation Classes
```css
animate-spin     /* Loading spinner */
animate-bounce   /* Loading dots */
```

## Accessibility

- Semantic HTML tags
- ARIA labels (có thể cải thiện thêm)
- Keyboard navigation support
- Color contrast ratio > 4.5:1
- Focus states visible

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ iOS Safari, Chrome Mobile

## Future Enhancements

1. **Comparison Mode**: So sánh nhiều đối thủ
2. **Data Visualization**: Charts và graphs
3. **Export Options**: PDF, Word export
4. **History**: Lưu lịch sử phân tích
5. **Share**: Share results via link
6. **Print View**: Optimized print layout
7. **Dark Mode**: Theme switching
8. **Localization**: Multi-language support

## Troubleshooting

### Icons không hiển thị
```bash
npm install lucide-react
```

### API connection failed
- Kiểm tra backend đang chạy (`uvicorn main:app --reload`)
- Kiểm tra CORS settings trong backend
- Verify API_BASE_URL trong component

### Styles không apply
- Chạy `npm run dev` lại
- Clear browser cache
- Kiểm tra Tailwind config

## Testing

### Manual Testing Checklist
- [ ] Search với competitor name hợp lệ
- [ ] Search với empty input
- [ ] Loading state hiển thị đúng
- [ ] Error handling hoạt động
- [ ] Tabs switching mượt mà
- [ ] Export JSON functionality
- [ ] Responsive trên mobile
- [ ] Responsive trên tablet
- [ ] Quick examples clickable

## Screenshots

_(Thêm screenshots sau khi test)_

1. Initial state
2. Loading state
3. Results - Product tab
4. Results - Customer tab
5. Results - Marketing tab
6. Results - Distribution tab
7. Mobile view
8. Error state
