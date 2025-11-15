// src/components/ContentGenerationForm.jsx

import React, { useState } from "react";
import axios from "axios";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

// --- 1. HELPER FUNCTIONS ---

const formatContent = (content) => {
  return content.split("\n").map((line, index) => (
  // Thay thế các dòng mới thành <br> cho hiển thị
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

// --- 2. MAIN COMPONENT (Tích hợp 3 Giai đoạn) ---

function ContentGenerationForm() {
  // --- STATE MANAGEMENT ---

  // Quản lý luồng 3 Giai đoạn (1: Input, 2: Analysis Result, 3: Content/Media)
  const [currentStep, setCurrentStep] = useState(1);

  // Giai đoạn 1 States
  const [productName, setProductName] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  // Giai đoạn 2 States
  const [selectedUsp, setSelectedUsp] = useState("");
  const [selectedTone, setSelectedTone] = useState(ToneOptions[0].value);
  const [selectedFormat, setSelectedFormat] = useState(FormatOptions[0].value);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isUspOpen, setIsUspOpen] =useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isToneOpen, setIsToneOpen] = useState(false);

  // Giai đoạn 3 States
  const [generatedPoster, setGeneratedPoster] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Additional states for style short & reference image (Phase 3)
  const [styleShort, setStyleShort] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  
  // General States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- API URLS ---
  const BASE_URL = "http://127.0.0.1:8000/api/v1";

  // --- 3. LOGIC XỬ LÝ API CALLS ---

  // GIAI ĐOẠN 1: Phân tích sản phẩm
  const handleAnalysis = async (e) => {
    e.preventDefault();
    if (!productName) return;

    setLoading(true);
    setAnalysisData(null);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/analyze_product`, {
        product_name: productName,
      });
      const data = response.data;

      setAnalysisData(data);
      setCurrentStep(2);

      if (data.usps && data.usps.length > 0) {
        setSelectedUsp(data.usps[0]);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API phân tích:", err);
      setError("Lỗi: Không thể phân tích sản phẩm. Kiểm tra Server Backend.");
    } finally {
      setLoading(false);
    }
  };

  // GIAI ĐOẠN 2: Tạo nội dung Marketing
  const handleContentGeneration = async (e) => {
    // Đảm bảo ngăn chặn hành vi reload mặc định
    e.preventDefault();

    if (!selectedUsp || !analysisData) {
      setError("Thiếu dữ liệu để tạo nội dung.");
      return;
    }

    setLoading(true);
    setGeneratedContent(null);
    setGeneratedPoster(null);
    setError(null);
    setImageError(null);

    try {
      const requestData = {
        product_name: analysisData.product_name,
        target_persona: analysisData.target_persona,
        selected_usp: selectedUsp,
        selected_tone: selectedTone,
        selected_format: selectedFormat,
        infor: analysisData.infor,
      };

      const response = await axios.post(
        `${BASE_URL}/generate_content`,
        requestData
      );
      setGeneratedContent(response.data);
    } catch (err) {
      console.error("Lỗi khi gọi API tạo nội dung:", err);
      setError("Lỗi: Không thể tạo nội dung. Vui lòng kiểm tra Server Python.");
    } finally {
      setLoading(false);
    }
  };

  // GIAI ĐOẠN 3: Tạo Poster Quảng cáo
  const handlePosterGeneration = async () => {
    if (!generatedContent || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedPoster(null);

    try {
      if (selectedFormat.includes("Ad Copy")) {
        const formData = new FormData();
        formData.append("product_name", analysisData.product_name);
        formData.append("ad_copy", generatedContent.content);
        formData.append("persona", analysisData.target_persona); // match backend param name
        formData.append("usp", selectedUsp);
        formData.append("infor", analysisData.infor);
        if (styleShort) formData.append("style_short", styleShort);
        if (referenceImageFile) formData.append("reference_image", referenceImageFile);

        const response = await axios.post(`${BASE_URL}/generate_poster`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setGeneratedPoster(response.data);
      } else {
        setImageError(
          "Chức năng tạo Poster chỉ khả dụng khi Định dạng nội dung là 'Nội dung quảng cáo ngắn (Ad Copy)'.",
        );
      }
    } catch (err) {
      console.error("Lỗi khi gọi API tạo Poster:", err);
      setImageError(stringifyError(err));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Helper: stringify backend/frontend error objects
  const stringifyError = (err) => {
    if (!err) return "Unknown error";
    // axios response with detail or validation errors
    if (err.response && err.response.data) {
      const d = err.response.data;
      if (typeof d === "string") return d;
      try {
        return JSON.stringify(d);
      } catch {
        return String(d);
      }
    }
    if (err.message) return err.message;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  // --- 4. LOGIC GIAO DIỆN HIỂN THỊ (VIEW RENDERING) ---

  // View 1: Nhập liệu Giai đoạn 1
  const renderPhase1Input = () => (
    <div className="lg:col-span-2 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg">
      <h3 className="text-3xl font-extrabold text-gray-900 mb-6"></h3>
      <form onSubmit={handleAnalysis}>
        <label
          htmlFor="product-name"
          className="block text-lg font-bold text-indigo-800 mb-3"
        >
          Tên Sản Phẩm Cần Phân Tích
        </label>
        <div className="relative">
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="VD: IPhone 16 Promax"
            className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-lg focus:ring-indigo-600 focus:border-indigo-600 shadow-inner transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full flex items-center justify-center font-bold py-3 rounded-lg text-lg transition duration-300 shadow-xl ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-400/50"
          }`}
        >
          {loading
            ? "Đang Vận Hành Engine AI..."
            : "KHỞI ĐỘNG PHÂN TÍCH THỊ TRƯỜNG"}
        </button>
      </form>
    </div>
  );

  // View 2: Hiển thị Kết quả Giai đoạn 1
  const renderPhase1Result = () => {
    if (!analysisData) return null;

    const hasData =
      analysisData.usps.length > 0 || analysisData.target_persona.length > 0;

    return (
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <button
          onClick={() => setCurrentStep(1)}
          className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
        >
          &larr; Quay lại Nhập Tên Sản Phẩm
        </button>

        {hasData ? (
          <>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
              GIAI ĐOẠN 1: Kết Quả Phân Tích Hoàn Chỉnh
            </h3>
            <p className="text-gray-700 mb-8 border-l-4 border-green-500 pl-4 italic bg-green-50 p-4 rounded-md">
              Bộ dữ liệu cấu trúc đã sẵn sàng cho:{" "}
              <span className="font-bold text-indigo-700">
                {analysisData.product_name}
              </span>
              .
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    {/* KHỐI 1: USP */}
    <div className="p-6 rounded-xl shadow-md border-t-4 border-cyan-500 bg-cyan-50">
        <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">
            Điểm Bán Hàng Độc Nhất (USP)
        </h4>
        <ul className="space-y-3 text-gray-700">
            {analysisData.usps.map((item, index) => (
                <li
                    key={index}
                    className="flex items-start text-sm bg-white p-3 rounded-md border shadow-sm"
                >
                    <span className="font-bold text-base mr-3 text-indigo-600">
                        •
                    </span>
                    {item}
                </li>
            ))}
        </ul>
    </div>

    {/* KHỐI 2: Chân Dung Khách Hàng (Persona) */}
    <div className="p-6 rounded-xl shadow-md border-t-4 border-purple-500 bg-purple-50">
        <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">
            Chân Dung Khách Hàng (Persona)
        </h4>
        <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-3 rounded-md border shadow-inner">
            {analysisData.target_persona}
        </pre>
    </div>
    
    {/* KHỐI 3 MỚI: Thông số Sản phẩm (Infor) */}
    {/* Giả định trường dữ liệu mới là analysisData.product_info_details */}
    <div className="p-6 rounded-xl shadow-md border-t-4 border-orange-500 bg-orange-50">
        <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">
            Thông số Sản phẩm Nổi bật
        </h4>
        <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-3 rounded-md border shadow-inner">
            {analysisData.infor} 
        </pre>
    </div>
</div>

            <button
              onClick={() => setCurrentStep(3)}
              className="mt-6 w-full flex items-center justify-center bg-green-600 text-white font-extrabold py-3 rounded-lg text-xl hover:bg-green-700 transition duration-300 shadow-lg shadow-green-400/50"
            >
              TIẾP TỤC GIAI ĐOẠN 2: TẠO NỘI DUNG
            </button>
          </>
        ) : (
          <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-300 font-medium">
            Không tìm thấy dữ liệu phân tích chi tiết cho sản phẩm này.
          </div>
        )}
      </div>
    );
  };

  // View 3: Form và Kết quả Giai đoạn 2 & 3
  const renderPhase2And3 = () => (
    <div className="mt-10 pt-8 border-t-2 border-gray-200">
      <button
        onClick={() => setCurrentStep(2)}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
      >
        &larr; Quay lại Kết Quả Phân Tích (Giai đoạn 1)
      </button>
      
      <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
        GIAI ĐOẠN 2 & 3: Sáng Tạo Nội Dung & Media ✨
      </h3>

      {/* Form Chọn Biến Số Marketing (Giai đoạn 2 Input) */}
      <form
        onSubmit={handleContentGeneration}
        className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn USP */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. Chọn Điểm Bán Hàng (USP)
            </label>
            <select
              value={selectedUsp}
              onChange={(e) => setSelectedUsp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-blue-300"
              required
            >
              {analysisData.usps.map((usp, index) => (
                <option key={index} value={usp}>
                  {usp}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Format */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. Chọn Định Dạng Nội Dung
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-blue-300"
              required
            >
              {FormatOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Tone */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              3. Chọn Giọng Điệu (Tone)
            </label>
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-blue-300"
              required
            >
              {ToneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full flex items-center justify-center font-bold py-3 rounded-lg text-lg transition duration-300 shadow-md ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-400/50"
          }`}
        >
          {loading ? "Đang Sáng Tạo Nội Dung AI..." : "TẠO NỘI DUNG MARKETING"}
        </button>
      </form>

      {/* Hiển thị Kết Quả Nội Dung (Giai đoạn 2 Output) */}
      {generatedContent && (
        <div className="p-8 bg-indigo-50 rounded-xl border-2 border-indigo-300 shadow-inner mb-8">
          <h4 className="text-xl font-extrabold text-indigo-700 mb-4 border-b pb-2">
            KẾT QUẢ SÁNG TẠO NỘI DUNG
          </h4>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
            <p className="text-sm text-gray-500 font-semibold mb-2">
              TIÊU ĐỀ GỢI Ý:
            </p>
            <h5 className="text-2xl font-bold text-gray-900 leading-snug">
              {generatedContent.title}
            </h5>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-2">
              NỘI DUNG CHI TIẾT:
            </p>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {formatContent(generatedContent.content)}
            </div>
          </div>
        </div>
      )}

      {/* Tùy chọn Poster - CHỈ HIỆN SAU KHI CÓ NỘI DUNG */}
      {generatedContent && (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3">Tùy chọn Poster (Giai đoạn 3)</h4>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Yêu cầu phong cách ngắn (ví dụ: "minimal, bright, product on marble table")
          </label>
          <input
            type="text"
            value={styleShort}
            onChange={(e) => setStyleShort(e.target.value)}
            placeholder="Nhập yêu cầu phong cách ngắn..."
            className="w-full px-3 py-2 border rounded-lg mb-3"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hình ảnh tham khảo (tùy chọn)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setReferenceImageFile(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setReferenceImagePreview(url);
              } else {
                setReferenceImagePreview(null);
              }
            }}
            className="w-full mb-3"
          />
          {referenceImagePreview && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Xem trước hình ảnh tham khảo:</p>
              <img src={referenceImagePreview} alt="Preview" className="max-w-xs rounded-md shadow-sm" />
            </div>
          )}

          {/* Button tạo poster */}
          <button
            onClick={handlePosterGeneration}
            disabled={isGeneratingImage}
            className={`mt-6 w-full font-bold py-3 rounded-lg transition ${
              isGeneratingImage
                ? "bg-orange-300 text-white cursor-not-allowed"
                : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-400/50"
            }`}
          >
            {isGeneratingImage
              ? "ĐANG TẠO POSTER AI..."
              : "BẮT ĐẦU GIAI ĐOẠN 3: TẠO POSTER"}
          </button>
        </div>
      )}

      {/* Hiển thị kết quả poster */}
      {(generatedPoster || imageError) && (
        <div className="p-8 bg-pink-50 rounded-xl border-2 border-pink-300 shadow-inner">
          <h4 className="text-xl font-extrabold text-pink-700 mb-4 border-b pb-2">
            KẾT QUẢ SẢN XUẤT MEDIA: POSTER
          </h4>

          {imageError ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-300 font-medium">
              Lỗi tạo Poster: {imageError}
            </div>
          ) : (
            <div className="text-center">
              <img
                src={generatedPoster.image_url}
                alt="Poster Marketing AI"
                className="mx-auto rounded-lg shadow-xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-300"
                style={{ maxWidth: "400px", maxHeight: "400px" }}
              />
              <p className="mt-4 text-sm text-gray-600 italic">
                Prompt đã dùng:{" "}
                <span className="font-mono text-xs">
                  {generatedPoster.prompt_used}
                 </span>
              </p>
              <a
                href={generatedPoster.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition font-bold"
              >
                Tải Poster (MOCK)
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // --- 5. RENDER CHÍNH ---

  const renderContent = () => {
    if (currentStep === 1) {
      return renderPhase1Input();
    } else if (currentStep === 2) {
      return renderPhase1Result();
    } else if (currentStep === 3) {
      return renderPhase2And3();
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white shadow-3xl rounded-3xl border border-indigo-100">
      <header className="text-center mb-10">
        <div className="inline-block tracking-widest text-indigo-700 bg-indigo-100 px-4 py-1 rounded-full text-xs font-bold uppercase mb-3">
          VIRTUAL MARKETING AGENCY
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
          QUY TRÌNH MARKETING TỰ ĐỘNG VỚI AI
        </h2>
      </header>

      {renderContent()}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg border border-red-300 font-medium">
          LỖI: {error}
        </div>
      )}
    </div>
  );
}

export default ContentGenerationForm;
