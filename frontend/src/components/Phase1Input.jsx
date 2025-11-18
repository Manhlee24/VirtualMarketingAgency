// src/components/Phase1Input.jsx

import React from "react";
import { Target } from 'lucide-react';

function Phase1Input({ productName, setProductName, analysisMode, setAnalysisMode, documentFile, setDocumentFile, handleAnalysis, loading }) {
	return (
		<div className="lg:col-span-2 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 shadow-lg">
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
					<Target className="w-10 h-10 text-white" />
				</div>
				<h1 className="text-4xl font-extrabold text-gray-900 mb-2">GIAI ĐOẠN 1: Nhập Sản Phẩm</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Nhập tên sản phẩm hoặc tải lên tài liệu để AI thu thập dữ liệu công khai và phân tích chi tiết.
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
            <span className="font-medium text-gray-800">Phân tích theo Tên (Web Research)</span>
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
					</>
				)}

        {/* Upload file khi ở chế độ tài liệu */}
        {analysisMode === "document" && (
          <div className="mt-5">
            <label htmlFor="product-document" className="block text-lg font-bold text-indigo-800 mb-3">
              Tải lên Tài liệu Sản phẩm (PDF/DOCX)
            </label>
            <input
              id="product-document"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-lg focus:ring-indigo-600 focus:border-indigo-600 shadow-inner transition bg-white"
              required
            />
            {documentFile && (
              <p className="mt-2 text-sm text-gray-600">Đã chọn: {documentFile.name}</p>
            )}
          </div>
        )}

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
            : analysisMode === "name"
              ? "PHÂN TÍCH THEO TÊN (WEB)"
              : "PHÂN TÍCH THEO TÀI LIỆU (PDF/DOCX)"}
        </button>
      </form>
    </div>
  );
}

export default Phase1Input;