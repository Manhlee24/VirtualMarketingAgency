// src/components/ContentForm.jsx

import React from "react";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

function ContentForm({
  analysisData,
  selectedUsps,
  setSelectedUsps,
  selectedFormat,
  setSelectedFormat,
  selectedTone,
  setSelectedTone,
  seoEnabled,
  setSeoEnabled,
  language,
  setLanguage,
  category,
  setCategory,
  desiredLength,
  setDesiredLength,
  customTitle,
  setCustomTitle,
  keyPoints,
  setKeyPoints,
  requiredKeywords,
  setRequiredKeywords,
  handleContentGeneration,
  generatedContent,
  formatContent,
  loading,
  goBack,
  goToPoster,
  onSaveContent,
  savingContent,
  savedContent,
}) {
  const handleSave = () => {
    onSaveContent({
      ...analysisData,
      // Store as a string for history compatibility
      selected_usp: Array.isArray(selectedUsps) ? selectedUsps.join(", ") : String(selectedUsps || ""),
      selected_format: selectedFormat,
      selected_tone: selectedTone,
      title: generatedContent.title,
      content: generatedContent.content,
    });
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
        Tạo Nội Dung ✍️
      </h3>

      <form
        onSubmit={handleContentGeneration}
        className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn USP (checkbox multi-select) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              1. Chọn Điểm Bán Hàng (USP) — có thể chọn nhiều
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
              {analysisData.usps.map((usp, index) => {
                const id = `usp_${index}`;
                const checked = selectedUsps.includes(usp);
                const label = typeof usp === 'string' && usp.length > 100 ? usp.slice(0, 100) + '…' : usp;
                return (
                  <div key={index} className="flex items-start gap-2">
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsps([...selectedUsps, usp]);
                        } else {
                          setSelectedUsps(selectedUsps.filter((u) => u !== usp));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor={id} className="text-sm text-gray-700 leading-snug cursor-pointer select-text">
                      {label}
                    </label>
                  </div>
                );
              })}
              {analysisData.usps.length === 0 && (
                <p className="text-xs text-gray-500">Không có USP nào được tìm thấy.</p>
              )}
            </div>
            {selectedUsps.length === 0 && (
              <p className="text-xs text-red-600 mt-1 font-medium">Vui lòng chọn ít nhất 1 USP.</p>
            )}
          </div>

          {/* Chọn Format */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              2. Chọn Định Dạng Nội Dung
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm clamp-1"
              required
            >
              {FormatOptions.map((option) => (
                <option key={option.value} value={option.value} className="option-ellipsis" title={option.label}>
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm clamp-1"
              required
            >
              {ToneOptions.map((option) => (
                <option key={option.value} value={option.value} className="option-ellipsis" title={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* New optional inputs */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">4. Bật SEO</label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
              <input
                id="seoFlag"
                type="checkbox"
                checked={seoEnabled}
                onChange={(e) => setSeoEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="seoFlag" className="text-sm text-gray-700">Ưu tiên chèn từ khoá (SEO)</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">5. Ngôn ngữ</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">6. Thể loại </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ví dụ: Quảng cáo, Giới thiệu, Hướng dẫn..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">7. Độ dài mong muốn (số từ)</label>
            <input
              type="number"
              min="50"
              max="1000"
              value={desiredLength}
              onChange={(e) => setDesiredLength(e.target.value)}
              placeholder="Ví dụ: 200"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">8. Tiêu đề gợi ý (nếu có)</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ví dụ: Sữa rửa mặt Clear"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">9. Ý chính / yêu cầu (có thể xuống dòng)</label>
            <textarea
              rows={4}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"Ví dụ:\n- Nguồn gốc từ Đức\n- Lành tính, dành cho da nhạy cảm\n- Có 2 loại theo mùa"}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">10. Từ khoá cần có (phân tách bằng dấu phẩy hoặc xuống dòng)</label>
            <textarea
              rows={3}
              value={requiredKeywords}
              onChange={(e) => setRequiredKeywords(e.target.value)}
              placeholder={"Ví dụ:\n- sữa rửa mặt\n- da nhạy cảm\n- lành tính"}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
            />
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

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-semibold break-words">
              USPs: {Array.isArray(selectedUsps) && selectedUsps.length > 0 ? selectedUsps.slice(0,5).join(" | ") : "(chưa chọn)"}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 font-semibold">Tone: {selectedTone}</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-semibold">Format: {selectedFormat}</span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
            <p className="text-sm text-gray-500 font-semibold mb-2">TIÊU ĐỀ GỢI Ý:</p>
            <h5 className="text-2xl font-bold text-gray-900 leading-snug">
              {generatedContent.title}
            </h5>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-semibold mb-2">NỘI DUNG CHI TIẾT:</p>
            <div className="prose max-w-none prose-p:my-2 prose-ul:my-2 prose-li:list-disc prose-li:ml-5 text-gray-800">
              {formatContent(generatedContent.content)}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(generatedContent.content)}
                className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold"
              >
                Sao chép nội dung
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
            onClick={goToPoster}
            className="w-full flex items-center justify-center bg-orange-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-700 transition duration-300 shadow-lg shadow-orange-400/50"
            >
              ĐI TỚI TẠO POSTER
            </button>
            <button
              onClick={handleSave}
              disabled={savingContent || savedContent}
              className={`w-full flex items-center justify-center ${savingContent ? 'bg-gray-400' : (savedContent ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700')} text-white font-bold py-3 rounded-lg text-lg transition duration-300 shadow-lg`}
            >
              {savingContent ? 'ĐANG LƯU...' : (savedContent ? 'ĐÃ LƯU' : 'LƯU NỘI DUNG')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentForm;
