// src/components/AnalysisForm.jsx

import React, { useState } from "react";
import axios from "axios";
import AnalysisResult from "./AnalysisResult.jsx";
import ContentGenerationForm from "./ContentGenerationForm.jsx";

function AnalysisForm() {
  const [productName, setProductName] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPhase2Active, setIsPhase2Active] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:8000/api/v1/analyze_product";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName) return;

    setLoading(true);
    setAnalysisData(null);
    setError(null);
    setIsPhase2Active(false);

    try {
      const response = await axios.post(BACKEND_URL, {
        product_name: productName,
      });
      setAnalysisData(response.data);
    } catch (err) {
      console.error("Lỗi khi gọi API phân tích:", err);
      // Bắt lỗi 404 từ backend hoặc lỗi kết nối
      if (err.response && err.response.status === 404) {
        setError(
          `Lỗi 404: Không tìm thấy dữ liệu phân tích cho sản phẩm "${productName}".`
        );
      } else {
        setError(
          "Lỗi kết nối Server. Vui lòng kiểm tra Server Python (cổng 8000) và log."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển sang Giai đoạn 2
  const handleNextPhase = () => {
    setIsPhase2Active(true);
  };

  // Hàm quay lại Form Input Giai đoạn 1
  const handleResetPhase = () => {
    setProductName("");
    setAnalysisData(null);
    setIsPhase2Active(false);
    setError(null);
  };

  // Hàm quay lại Form Kết quả Giai đoạn 1 (từ Form ContentGeneration)
  const handleBackToPhase1 = () => {
    setIsPhase2Active(false);
  };

  let content;

  if (isPhase2Active && analysisData) {
    // 1. Hiển thị GIAI ĐOẠN 2 & 3
    content = (
      <ContentGenerationForm
        analysisData={analysisData}
        onBack={handleBackToPhase1}
      />
    );
  } else if (analysisData) {
    // 2. Hiển thị KẾT QUẢ GIAI ĐOẠN 1
    content = (
      <AnalysisResult data={analysisData} onNextPhase={handleNextPhase} />
    );
  } else {
    // 3. Hiển thị FORM INPUT GIAI ĐOẠN 1
    content = (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h4 className="text-base font-bold text-gray-800 uppercase mb-3 border-b pb-2">
            QUY TRÌNH 3 BƯỚC
          </h4>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="font-semibold text-indigo-600">
              1. Nhập liệu: Tên sản phẩm.
            </li>
            <li>2. AI phân tích: Tìm kiếm USP, Pain Points, Persona.</li>
            <li>3. Nhận kết quả: Bộ dữ liệu cấu trúc hoàn chỉnh.</li>
            <li className="pt-2 text-xs italic text-gray-500">
              Mẹo: Cung cấp tên sản phẩm cụ thể và duy nhất để có kết quả tốt
              nhất.
            </li>
          </ol>
        </div>

        <div className="lg:col-span-2 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="product-name"
              className="block text-lg font-bold text-indigo-800 mb-3"
            >
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md mr-2">
                INPUT
              </span>{" "}
              Tên Sản Phẩm Cần Phân Tích
            </label>
            <div className="relative">
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Nhập tên sản phẩm (VD: Ứng dụng thiền định MindFlow)"
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
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang Vận Hành Engine AI...
                </div>
              ) : (
                "KHỞI ĐỘNG PHÂN TÍCH THỊ TRƯỜNG"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white shadow-3xl rounded-3xl border border-indigo-100">
      <header className="text-center mb-10">
        <div className="inline-block tracking-widest text-indigo-700 bg-indigo-100 px-4 py-1 rounded-full text-xs font-bold uppercase mb-3">
          {isPhase2Active
            ? "ĐANG SÁNG TẠO NỘI DUNG & MEDIA"
            : "GIAI ĐOẠN 1: TỰ ĐỘNG HÓA"}
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
          VIRTUAL MARKETING AGENCY 💡
        </h2>
        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
          {isPhase2Active
            ? "Kết hợp các thông số đã trích xuất để tạo nội dung Marketing tức thì."
            : "Chỉ cần nhập tên sản phẩm. AI sẽ thực hiện toàn bộ nghiên cứu thị trường từ A đến Z."}
        </p>
      </header>

      {/* Nút reset (Chỉ xuất hiện khi đang ở màn hình kết quả hoặc Phase 2) */}
      {!isPhase2Active && analysisData && (
        <button
          onClick={handleResetPhase}
          className="mb-6 text-sm text-gray-500 hover:text-gray-700 font-semibold underline"
        >
          &larr; Quay lại Form Nhập Liệu
        </button>
      )}

      {content}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg border border-red-300 font-medium">
          LỖI: {error}
        </div>
      )}
    </div>
  );
}

export default AnalysisForm;
