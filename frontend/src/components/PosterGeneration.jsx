// src/components/PosterGeneration.jsx

import React, { useState } from "react";

// const BASE_URL = "http://127.0.0.1:8000/api"; // not used after removing remote prompt suggestion

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
  const [productType, setProductType] = useState("");

  const LIGHTING_OVERALL = ["mạnh mẽ", "dịu nhẹ", "tự nhiên", "được dàn dựng", "cinematic", "rim light"];
  const LIGHTING_EFFECT = ["Tia sáng xuyên qua", "Lấp lánh", "Phản chiếu", "Bóng đổ sắc nét", "Bokeh ánh sáng"];
  const STYLES = ["sang trọng", "tối giản", "tươi mới", "công nghệ cao", "kịch tính", "organic", "high-fashion"];
  const PALETTES = ["ấm", "lạnh", "rực rỡ", "đơn sắc", "pastel"];
  const MOODS = ["Sự tự tin", "khao khát", "yên bình", "sức mạnh", "hiện đại", "gần gũi", "sảng khoái"];
  const CONTEXTS = ["studio tối giản", "thiên nhiên tươi mát", "đô thị tương lai", "phòng tắm hiện đại", "khu vườn lãng mạn", "quán cà phê", "bàn gỗ studio"];
  const DETAILS = ["giọt nước", "lá xanh", "hơi nước", "phản chiếu kim loại", "bokeh nền mờ", "texture vải", "đá viên"];
  const CAMERAS = ["cận cảnh (macro)", "góc mắt thường", "góc thấp", "góc cao", "bố cục 1/3"];
  const PRODUCT_TYPES = ["mỹ phẩm", "điện thoại", "laptop", "điện tử", "đồ uống", "thời trang", "thực phẩm"];

  const [selLighting, setSelLighting] = useState("");
  const [selEffect, setSelEffect] = useState("");
  const [selStyle, setSelStyle] = useState("");
  const [selPalette, setSelPalette] = useState("");
  const [selMood, setSelMood] = useState("");
  const [selContext, setSelContext] = useState("");
  const [selDetail, setSelDetail] = useState("");
  const [selCamera, setSelCamera] = useState("");
  // Custom freeform inputs
  const [customProductType, setCustomProductType] = useState("");
  const [customLighting, setCustomLighting] = useState("");
  const [customEffect, setCustomEffect] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customPalette, setCustomPalette] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [customCamera, setCustomCamera] = useState("");

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

  // Bỏ tính năng gọi gợi ý prompt; chỉ dùng ghép phong cách cục bộ

  const composeStyleFromChoices = () => {
    const styleVal = (customStyle || selStyle || "").trim();
    const paletteVal = (customPalette || selPalette || "").trim();
    const moodVal = (customMood || selMood || "").trim();
    const lightingVal = (customLighting || selLighting || "").trim();
    const effectVal = (customEffect || selEffect || "").trim();
    const contextVal = (customContext || selContext || "").trim();
    const detailVal = (customDetail || selDetail || "").trim();
    const cameraVal = (customCamera || selCamera || "").trim();

    const parts = [];
    if (styleVal) parts.push(styleVal);
    if (paletteVal) parts.push(`tông ${paletteVal}`);
    if (moodVal) parts.push(moodVal.toLowerCase());
    if (lightingVal) parts.push(`ánh sáng ${lightingVal}`);
    if (effectVal) parts.push(effectVal.toLowerCase());
    if (contextVal) parts.push(contextVal);
    if (detailVal) parts.push(`chi tiết: ${detailVal}`);
    if (cameraVal) parts.push(`góc máy: ${cameraVal}`);
    // Merge with existing styleShort instead of overwriting
    const existing = (styleShort || "").trim();
    if (!existing) {
      setStyleShort(parts.join(", "));
      return;
    }
    const existingParts = existing.split(/\s*,\s*/).filter(Boolean);
    const normalizedExisting = existingParts.map(p => p.toLowerCase());
    const newUnique = parts.filter(p => !normalizedExisting.includes(p.toLowerCase()));
    const combined = [...existingParts, ...newUnique];
    setStyleShort(combined.join(", "));
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
        Tạo Ảnh 🖼️
      </h3>

      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          Ảnh mẫu là <strong>bắt buộc</strong> để hệ thống chỉnh sửa/tạo ảnh.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Loại sản phẩm (tuỳ chọn)</label>
            <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border rounded px-3 py-2 mb-2">
              <option value="">— Chọn loại —</option>
              {PRODUCT_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customProductType} onChange={(e) => setCustomProductType(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Tùy chỉnh loại sản phẩm (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ánh sáng tổng thể</label>
            <select value={selLighting} onChange={(e) => setSelLighting(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {LIGHTING_OVERALL.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customLighting} onChange={(e) => setCustomLighting(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh ánh sáng (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hiệu ứng ánh sáng</label>
            <select value={selEffect} onChange={(e) => setSelEffect(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {LIGHTING_EFFECT.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customEffect} onChange={(e) => setCustomEffect(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh hiệu ứng (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phong cách</label>
            <select value={selStyle} onChange={(e) => setSelStyle(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {STYLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh phong cách (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Gam màu</label>
            <select value={selPalette} onChange={(e) => setSelPalette(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {PALETTES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customPalette} onChange={(e) => setCustomPalette(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh gam màu (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tâm trạng/Cảm xúc</label>
            <select value={selMood} onChange={(e) => setSelMood(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {MOODS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customMood} onChange={(e) => setCustomMood(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh cảm xúc (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bối cảnh</label>
            <select value={selContext} onChange={(e) => setSelContext(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {CONTEXTS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customContext} onChange={(e) => setCustomContext(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh bối cảnh (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Chi tiết đặc biệt</label>
            <select value={selDetail} onChange={(e) => setSelDetail(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {DETAILS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customDetail} onChange={(e) => setCustomDetail(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh chi tiết (tuỳ chọn)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Góc máy & Bố cục</label>
            <select value={selCamera} onChange={(e) => setSelCamera(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">— Chọn —</option>
              {CAMERAS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <input value={customCamera} onChange={(e) => setCustomCamera(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" placeholder="Tùy chỉnh góc máy/bố cục (tuỳ chọn)" />
          </div>
        </div>
        <button type="button" onClick={composeStyleFromChoices} className="w-full mb-4 py-2 rounded font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">Tạo phong cách từ lựa chọn</button>
        {/* Bỏ khối hiển thị gợi ý chi tiết */}

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
