// src/components/PosterGeneration.jsx

import React from "react";

function PosterGeneration({
  analysisData,
  styleShort,
  setStyleShort,
  setReferenceImageFile,
  referenceImagePreview,
  setReferenceImagePreview,
  handlePosterGeneration,
  generatedPoster,
  isGeneratingImage,
  imageError,
  goBack,
  onSaveImage,
  savingImage,
  savedImage,
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
        onClick={goBack}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
      >
        &larr; Quay lại Kết Quả Phân Tích
      </button>

      <h3 className="text-3xl font-extrabold text-gray-900 mb-6">
        Tạo Poster 🖼️
      </h3>

      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          Ảnh mẫu là <strong>bắt buộc</strong> để hệ thống chỉnh sửa/tạo poster.
        </div>
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
          Ảnh mẫu (bắt buộc)
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

        <button
          onClick={handlePosterGeneration}
          disabled={isGeneratingImage}
          className={`mt-6 w-full font-bold py-3 rounded-lg transition ${
            isGeneratingImage
              ? "bg-orange-300 text-white cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-400/50"
          }`}
        >
          {isGeneratingImage ? "ĐANG TẠO POSTER AI..." : "TẠO POSTER"}
        </button>
      </div>

      {/* Limitations intentionally hidden per request */}

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
                <span className="font-mono text-xs">{generatedPoster.prompt_used}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <a
                  href={generatedPoster.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition font-bold"
                >
                  Xem Poster
                </a>
                <a
                  href={generatedPoster.image_url}
                  download
                  className="inline-block text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-bold"
                >
                  Tải xuống
                </a>
                <button
                  onClick={onSaveImage}
                  disabled={savingImage || savedImage}
                  className={`inline-block ${savingImage ? 'bg-gray-400' : (savedImage ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700')} text-white py-2 px-4 rounded-lg transition font-bold`}
                >
                  {savingImage ? 'ĐANG LƯU...' : (savedImage ? 'ĐÃ LƯU' : 'LƯU POSTER')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PosterGeneration;
