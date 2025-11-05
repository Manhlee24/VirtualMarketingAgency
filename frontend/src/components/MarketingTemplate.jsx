import React, { useState } from "react";
function MarketingTemplate() {
  const [image, setImage] = useState(null);
  const [generatedText, setGeneratedText] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    // Giả lập xử lý AI (sau này bạn có thể gọi API thật)
    setGeneratedText("🌟 AI đã tạo nội dung: Sản phẩm của bạn giúp nâng tầm thương hiệu!");
    setGeneratedImage("https://via.placeholder.com/600x400?text=AI+Generated+Marketing+Image");
  };
  return (
    <div className="flex flex-col items-center justify-center text-center mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-indigo-600 mb-4">Tạo Mẫu Marketing Tự Động</h2>

      {/* Upload ảnh */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="border p-2 rounded-lg"
      />

      {/* Hiển thị ảnh preview */}
      {image && (
        <img
          src={image}
          alt="Uploaded"
          className="w-full max-w-md rounded-xl shadow-md mt-4"
        />
      )}

      {/* Nút tạo mẫu */}
      <button
        onClick={handleGenerate}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Tạo Mẫu
      </button>

      {/* Kết quả */}
      {generatedText && (
        <div className="mt-6 space-y-4">
          <p className="text-lg text-gray-700 font-medium">{generatedText}</p>
          <img
            src={generatedImage}
            alt="Generated Marketing"
            className="w-full max-w-lg rounded-xl shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
export default MarketingTemplate;
