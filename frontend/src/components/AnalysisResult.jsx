// src/components/AnalysisResult.jsx
import React from "react";

function AnalysisResult({ data, onNextPhase }) {
  const Card = ({
    title,
    bgColor,
    borderColor,
    items,
    isPersona = false,
    personaText,
  }) => (
    <div
      className={`p-6 rounded-xl shadow-md border-t-4 ${borderColor} ${bgColor} h-full flex flex-col`}
    >
      <div className="mb-4 pb-2 border-b border-gray-300">
        <h4 className="text-base font-bold text-gray-800 uppercase">{title}</h4>
      </div>

      <div className="flex-grow">
        {isPersona ? (
          <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-3 rounded-md border border-gray-200 shadow-inner">
            {personaText}
          </pre>
        ) : (
          <ul className="space-y-3 text-gray-700">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start text-sm bg-white p-3 rounded-md border border-gray-200 shadow-sm"
              >
                <span className="font-bold text-base mr-3 text-indigo-600">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const hasData =
    data &&
    (data.usps.length > 0 ||
      data.pain_points.length > 0 ||
      data.target_persona !== "Chưa xác định");

  return (
    <div className="mt-10 pt-8 border-t-2 border-gray-200">
      {hasData ? (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl text-green-600 mr-3">✓</span>
            BỘ DỮ LIỆU CẤU TRÚC HOÀN CHỈNH cho:{" "}
            <span className="text-indigo-600 ml-2">{data.product_name}</span>
          </h3>

          <p className="text-gray-700 mb-8 border-l-4 border-green-500 pl-4 italic bg-green-50 p-4 rounded-md">
            Dữ liệu đã sẵn sàng. Vui lòng kiểm tra và **Bấm nút để chuyển sang
            Giai đoạn 2** để bắt đầu tạo nội dung.
          </p>

          <h4 className="text-xl font-bold text-gray-700 mt-8 mb-4 border-b pb-2">
            1. Phân Tích Cạnh Tranh & Giá Trị
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card
              title="ĐIỂM BÁN HÀNG ĐỘC NHẤT (USP)"
              bgColor="bg-cyan-50"
              borderColor="border-cyan-500"
              items={data.usps}
            />

            <Card
              title="ĐIỂM ĐAU KHÁCH HÀNG (Pain Points)"
              bgColor="bg-rose-50"
              borderColor="border-rose-500"
              items={data.pain_points}
            />
          </div>

          <h4 className="text-xl font-bold text-gray-700 mt-8 mb-4 border-b pb-2">
            2. Chân Dung Khách Hàng Mục Tiêu
          </h4>

          <div className="mb-8">
            <Card
              title="HỒ SƠ KHÁCH HÀNG MỤC TIÊU"
              bgColor="bg-purple-50"
              borderColor="border-purple-500"
              isPersona={true}
              personaText={data.target_persona}
            />
          </div>

          <button
            onClick={onNextPhase}
            className="mt-6 w-full flex items-center justify-center bg-green-600 text-white font-extrabold py-3 rounded-lg text-xl hover:bg-green-700 transition duration-300 shadow-lg shadow-green-400/50"
          >
            BẮT ĐẦU GIAI ĐOẠN 2: SÁNG TẠO NỘI DUNG
          </button>
        </>
      ) : (
        <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-300 font-medium">
          Không tìm thấy dữ liệu phân tích chi tiết cho sản phẩm này. Vui lòng
          kiểm tra lại tên sản phẩm hoặc log lỗi Backend.
        </div>
      )}
    </div>
  );
}

export default AnalysisResult;
