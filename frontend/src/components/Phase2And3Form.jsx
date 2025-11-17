// src/components/Phase2And3Form.jsx

import React from "react";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

function Phase2And3Form({
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
  styleShort,
  setStyleShort,
  setReferenceImageFile,
  referenceImagePreview,
  setReferenceImagePreview,
  handlePosterGeneration,
  generatedPoster,
  isGeneratingImage,
  imageError,
  loading,
  goToStep2,
}) {

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setReferenceImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setReferenceImagePreview(url);
    } else {
      setReferenceImagePreview(null);
    }
  };

  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-200">
      <button
        onClick={goToStep2}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
      >
        &larr; Quay lại Kết Quả Phân Tích
      </button>

      <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
        Sáng Tạo Nội Dung & Media ✨
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-blue-300 max-w-full overflow-hidden"
              required
            >
              {analysisData.usps.map((usp, index) => {
                const label = typeof usp === 'string' && usp.length > 80 ? usp.slice(0, 80) + '…' : usp;
                return (
                  <option key={index} value={usp} title={usp}>
                    {label}
                  </option>
                );
              })}
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
          <h4 className="text-lg font-bold text-gray-800 mb-3">Tùy chọn Poster</h4>
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
            onChange={handleFileChange}
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
}

export default Phase2And3Form;