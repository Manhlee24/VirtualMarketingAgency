// src/components/AnalysisResult.jsx

import React, { useState } from "react";

function AnalysisResult({ analysisData, goToContent, goToPoster, goBackToInput, onSaveAnalysis, saving, saved }) {
  const hasData =
    (analysisData.usps && analysisData.usps.length > 0) ||
    (analysisData.pain_points && analysisData.pain_points.length > 0) ||
    !!analysisData.target_persona ||
    !!analysisData.infor;

  const [openSection, setOpenSection] = useState(null); // 'usp' | 'persona' | 'pain' | 'infor' | null

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const handleSave = () => {
    onSaveAnalysis(analysisData);
  };

  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-200">
      <button
        onClick={goBackToInput}
        className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center"
      >
        &larr; Quay lại Nhập Sản Phẩm
      </button>

      {hasData ? (
        <>
          <h3 className="text-3xl font-extrabold text-gray-900 mb-6">Kết quả phân tích</h3>
          <p className="text-gray-700 mb-6 border-l-4 border-green-500 pl-4 italic bg-green-50 p-4 rounded-md">
            Bộ dữ liệu cấu trúc đã sẵn sàng cho:{" "}
            <span className="font-bold text-indigo-700">{analysisData.product_name}</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <button
              type="button"
              onClick={() => toggleSection("usp")}
              className={`flex flex-col items-start rounded-xl border bg-cyan-50 px-4 py-3 text-left shadow-sm transition hover:shadow-md ${
                openSection === "usp" ? "border-cyan-500 ring-2 ring-cyan-200" : "border-cyan-200"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700">USP</span>
              <span className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                {(analysisData.usps || []).slice(0, 2).join(" | ") || "Không có dữ liệu"}
              </span>
              <span className="mt-1 text-[11px] text-cyan-800 font-semibold">{openSection === "usp" ? "Thu gọn" : "Nhấn để xem chi tiết"}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSection("persona")}
              className={`flex flex-col items-start rounded-xl border bg-purple-50 px-4 py-3 text-left shadow-sm transition hover:shadow-md ${
                openSection === "persona" ? "border-purple-500 ring-2 ring-purple-200" : "border-purple-200"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">Persona</span>
              <span className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                {analysisData.target_persona || "Không có dữ liệu"}
              </span>
              <span className="mt-1 text-[11px] text-purple-800 font-semibold">{openSection === "persona" ? "Thu gọn" : "Nhấn để xem chi tiết"}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSection("pain")}
              className={`flex flex-col items-start rounded-xl border bg-rose-50 px-4 py-3 text-left shadow-sm transition hover:shadow-md ${
                openSection === "pain" ? "border-rose-500 ring-2 ring-rose-200" : "border-rose-200"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">Pain points</span>
              <span className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                {(analysisData.pain_points || []).slice(0, 2).join(" | ") || "Không có dữ liệu"}
              </span>
              <span className="mt-1 text-[11px] text-rose-800 font-semibold">{openSection === "pain" ? "Thu gọn" : "Nhấn để xem chi tiết"}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSection("infor")}
              className={`flex flex-col items-start rounded-xl border bg-orange-50 px-4 py-3 text-left shadow-sm transition hover:shadow-md ${
                openSection === "infor" ? "border-orange-500 ring-2 ring-orange-200" : "border-orange-200"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">Thông tin thêm</span>
              <span className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                {analysisData.infor || "Không có dữ liệu"}
              </span>
              <span className="mt-1 text-[11px] text-orange-800 font-semibold">{openSection === "infor" ? "Thu gọn" : "Nhấn để xem chi tiết"}</span>
            </button>
          </div>

          {openSection && (
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              {openSection === "usp" && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" /> USP chi tiết
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {(analysisData.usps || []).length === 0 && (
                      <li className="text-gray-500 italic">Không có dữ liệu.</li>
                    )}
                    {(analysisData.usps || []).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-cyan-50/60 p-2.5 rounded-md border border-cyan-100"
                      >
                        <span className="font-bold text-base mr-2 text-cyan-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {openSection === "persona" && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-purple-500" /> Persona chi tiết
                  </h4>
                  <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-purple-50/60 p-3 rounded-md border border-purple-100">
                    {analysisData.target_persona || "Không có dữ liệu."}
                  </pre>
                </div>
              )}

              {openSection === "pain" && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> Pain points chi tiết
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    {(analysisData.pain_points || []).length === 0 && (
                      <li className="text-gray-500 italic">Không có dữ liệu.</li>
                    )}
                    {(analysisData.pain_points || []).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start bg-rose-50/60 p-2.5 rounded-md border border-rose-100"
                      >
                        <span className="font-bold text-base mr-2 text-rose-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {openSection === "infor" && (
                <div>
                  <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-500" /> Thông tin thêm chi tiết
                  </h4>
                  <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-orange-50/60 p-3 rounded-md border border-orange-100">
                    {analysisData.infor || "Không có dữ liệu."}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button
              onClick={goToContent}
              className="w-full flex items-center justify-center bg-green-600 text-white font-extrabold py-3 rounded-lg text-xl hover:bg-green-700 transition duration-300 shadow-lg shadow-green-400/50"
            >
              TẠO NỘI DUNG
            </button>
            <button
              onClick={goToPoster}
              className="w-full flex items-center justify-center bg-orange-600 text-white font-extrabold py-3 rounded-lg text-xl hover:bg-orange-700 transition duration-300 shadow-lg shadow-orange-400/50"
            >
              TẠO POSTER
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full flex items-center justify-center ${saving ? 'bg-gray-400' : (saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700')} text-white font-extrabold py-3 rounded-lg text-xl transition duration-300 shadow-lg`}
            >
              {saving ? 'ĐANG LƯU...' : (saved ? 'ĐÃ LƯU' : 'LƯU KẾT QUẢ')}
            </button>
          </div>
        </>
      ) : (
        <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-300 font-medium">
          Không tìm thấy dữ liệu phân tích chi tiết cho sản phẩm này.
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
