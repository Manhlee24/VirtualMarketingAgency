// src/components/AnalysisResult.jsx

import React from "react";

function AnalysisResult({ analysisData, goToContent, goToPoster, goBackToInput, onSaveAnalysis, saving, saved }) {
  const hasData = analysisData.usps.length > 0 || analysisData.target_persona.length > 0;

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
          <p className="text-gray-700 mb-8 border-l-4 border-green-500 pl-4 italic bg-green-50 p-4 rounded-md">
            Bộ dữ liệu cấu trúc đã sẵn sàng cho: {" "}
            <span className="font-bold text-indigo-700">{analysisData.product_name}</span>.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl shadow-md border-t-4 border-cyan-500 bg-cyan-50">
              <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">USP</h4>
              <ul className="space-y-3 text-gray-700">
                {analysisData.usps.map((item, index) => (
                  <li key={index} className="flex items-start text-sm bg-white p-3 rounded-md border shadow-sm">
                    <span className="font-bold text-base mr-3 text-indigo-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl shadow-md border-t-4 border-purple-500 bg-purple-50">
              <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">Persona</h4>
              <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-3 rounded-md border shadow-inner">
                {analysisData.target_persona}
              </pre>
            </div>

            <div className="p-6 rounded-xl shadow-md border-t-4 border-orange-500 bg-orange-50">
              <h4 className="font-bold text-gray-800 uppercase mb-3 border-b pb-2">Thông số nổi bật</h4>
              <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-3 rounded-md border shadow-inner">
                {analysisData.infor}
              </pre>
            </div>
          </div>

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
              onClick={onSaveAnalysis}
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
