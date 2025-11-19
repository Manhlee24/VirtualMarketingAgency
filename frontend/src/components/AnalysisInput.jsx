// src/components/AnalysisInput.jsx

import React, { useRef } from "react";
import { Target } from 'lucide-react';
function AnalysisInput({ productName, setProductName, analysisMode, setAnalysisMode, documentFile, setDocumentFile, handleAnalysis, loading }) {
  const fileInputRef = useRef(null);
  const prettySize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const sizes = ["B", "KB", "MB", "GB"]; let i = 0; let n = bytes;
    while (n >= 1024 && i < sizes.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(1)} ${sizes[i]}`;
  };

  return (
    
    <div className="lg:col-span-2 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg">
      	<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
					<Target className="w-10 h-10 text-white" />
				</div>
				<h1 className="text-4xl font-extrabold text-gray-900 mb-2">Phân Tích Sản Phẩm</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Nhập tên sản phẩm hoặc tải lên tài liệu để AI thu thập dữ liệu công khai và phân tích thị trường chi tiết.
				</p>
			</div>
      <form onSubmit={handleAnalysis}>
        {/* Chọn chế độ phân tích */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:space-x-6">
          <label className="inline-flex items-center space-x-2 mb-2 sm:mb-0">
            <input
              type="radio"
              name="analysisMode"
              value="name"
              checked={analysisMode === "name"}
              onChange={() => setAnalysisMode("name")}
              className="text-indigo-600 focus:ring-indigo-600"
            />
            <span className="font-medium text-gray-800">Phân tích theo Tên </span>
          </label>
          <label className="inline-flex items-center space-x-2">
            <input
              type="radio"
              name="analysisMode"
              value="document"
              checked={analysisMode === "document"}
              onChange={() => { setAnalysisMode("document"); setProductName(""); }}
              className="text-indigo-600 focus:ring-indigo-600"
            />
            <span className="font-medium text-gray-800">Phân tích theo Tài liệu (PDF/DOCX)</span>
          </label>
        </div>

        {analysisMode === "name" && (
          <>
            <label htmlFor="product-name" className="block text-lg font-bold text-indigo-800 mb-3">
              Tên Sản Phẩm Cần Phân Tích
            </label>
            <div className="relative">
              <input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="VD: iPhone 16 Pro Max"
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-lg focus:ring-indigo-600 focus:border-indigo-600 shadow-inner transition"
                required
              />
            </div>
          </>
        )}

        {/* Upload file khi ở chế độ tài liệu */}
        {analysisMode === "document" && (
          <div className="mt-5">
            <label htmlFor="product-document" className="block text-lg font-bold text-indigo-800 mb-3">
              Tải lên Tài liệu Sản phẩm (PDF/DOCX)
            </label>

            <input
              ref={fileInputRef}
              id="product-document"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              className="hidden"
              required
            />

            {!documentFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center font-bold py-3 rounded-lg text-lg transition duration-300 bg-white border-2 border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                + Chọn file PDF/DOCX để phân tích
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-2 rounded-lg bg-white border-indigo-300 shadow-sm">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">PDF</span>
                  <div>
                    <div className="font-semibold text-gray-900">{documentFile.name}</div>
                    <div className="text-sm text-gray-500">{prettySize(documentFile.size)}</div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentFile(null)}
                    className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full flex items-center justify-center font-bold py-3 rounded-lg text-lg transition duration-300 shadow-xl ${
            loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-400/50"
          }`}
        >
          {loading ? "Đang Vận Hành Engine AI..." : analysisMode === "name" ? "PHÂN TÍCH THEO TÊN (WEB)" : "PHÂN TÍCH THEO TÀI LIỆU (PDF/DOCX)"}
        </button>
      </form>
    </div>
  );
}

export default AnalysisInput;
