// src/components/ContentForm.jsx

import React from "react";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

function ContentForm({
  analysisData,
  selectedUsp,
  setSelectedUsp,
  selectedFormat,
  setSelectedFormat,
  selectedTone,
  setSelectedTone,
  handleContentGeneration,
  generatedContent,
  formatContent,
  loading,
  goBack,
  goToPoster,
}) {
  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-200">
      <button
        onClick={goBack}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
      >
        &larr; Quay lại Kết Quả Phân Tích (Giai đoạn 1)
      </button>

      <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
        GIAI ĐOẠN 2: Sáng Tạo Nội Dung ✍️
      </h3>

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

      {/* Hiển thị Kết Quả Nội Dung */}
      {generatedContent && (
        <div className="p-8 bg-indigo-50 rounded-xl border-2 border-indigo-300 shadow-inner mb-8">
          <h4 className="text-xl font-extrabold text-indigo-700 mb-4 border-b pb-2">
            KẾT QUẢ SÁNG TẠO NỘI DUNG
          </h4>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
            <p className="text-sm text-gray-500 font-semibold mb-2">TIÊU ĐỀ GỢI Ý:</p>
            <h5 className="text-2xl font-bold text-gray-900 leading-snug">
              {generatedContent.title}
            </h5>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-2">NỘI DUNG CHI TIẾT:</p>
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {formatContent(generatedContent.content)}
            </div>
          </div>

          <button
            onClick={goToPoster}
            className="mt-6 w-full flex items-center justify-center bg-orange-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-700 transition duration-300 shadow-lg shadow-orange-400/50"
          >
            ĐI TỚI GIAI ĐOẠN 3: TẠO POSTER
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentForm;
