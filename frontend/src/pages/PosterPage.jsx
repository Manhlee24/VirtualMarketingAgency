// src/pages/PosterPage.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { Target } from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000/api";

export default function PosterPage() {
  const { token } = useAuth();
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [styleShort, setStyleShort] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Limitations intentionally not displayed

  // Attribute selections
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

  const onFile = (e) => {
    const file = e.target.files?.[0] || null;
    setReferenceImageFile(file);
    if (file) setReferenceImagePreview(URL.createObjectURL(file));
    else setReferenceImagePreview(null);
  };

  const generate = async () => {
    if (isGenerating) return;
    setError(null);
    setResult(null);
    if (!productName.trim()) { setError("Vui lòng nhập tên sản phẩm"); return; }
    if (!referenceImageFile) { setError("Vui lòng chọn Ảnh mẫu (bắt buộc)"); return; }

    try {
      setIsGenerating(true);
      const fd = new FormData();
      fd.append("product_name", productName);
      if (styleShort) fd.append("style_short", styleShort);
      fd.append("reference_image", referenceImageFile);
      const res = await axios.post(`${BASE_URL}/generate_poster`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data || e?.message || "Lỗi khi tạo poster");
    } finally {
      setIsGenerating(false);
    }
  };
  // Bỏ tính năng gọi gợi ý prompt từ backend; chỉ ghép phong cách cục bộ
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
    // Merge with existing ideas instead of overwriting
    const existing = styleShort.trim();
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

  const save = async () => {
    if (!token || !result) return;
    setSaving(true);
    try {
      const payload = {
        product_name: productName,
        style_short: styleShort,
        image_url: result.image_url,
        prompt_used: result.prompt_used,
        reference_url: result.reference_url || null,
      };
      await axios.post(`${BASE_URL}/history/images`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
    } catch (e) {
      console.error(e);
      setError("Lưu poster thất bại");
    } finally {
      setSaving(false);
    }
  };
        

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-xl shadow">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
          <Target className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Tạo Ảnh Sản Phẩm</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto"> Chỉ cần cung cấp tên, ảnh sản phẩm và phong cách bạn muốn, chúng tôi sẽ giúp hiên thực được rõ nét ý tưởng thiết kế của bạn</p>
      </div>

      {/* Limitations hidden per request */}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Tên sản phẩm</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Ví dụ: Tai nghe chống ồn XM5" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Yêu cầu phong cách (tuỳ chọn)</label>
          <input value={styleShort} onChange={(e) => setStyleShort(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="minimal, cinematic lighting, product on marble" />

          {/* Product type + Attribute selectors with freeform inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
          <button onClick={composeStyleFromChoices} className="w-full mt-3 py-2 rounded font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">Tạo phong cách từ lựa chọn</button>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Ảnh mẫu (bắt buộc)</label>
          <input type="file" accept="image/*" onChange={onFile} />
          {referenceImagePreview && (
            <div className="mt-2">
              <img src={referenceImagePreview} alt="preview" className="max-w-xs rounded border" />
            </div>
          )}
        </div>
        <button onClick={generate} disabled={isGenerating} className={`w-full py-3 rounded font-bold ${isGenerating ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
          {isGenerating ? 'ĐANG TẠO...' : 'TẠO POSTER'}
        </button>
      </div>

      {error && <div className="mt-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded">{String(error)}</div>}

      {result && (
        <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded">
          <div className="font-bold text-indigo-800 mb-2">Kết quả</div>
          <img src={result.image_url} alt="poster" className="rounded border max-w-sm" />
          <p className="mt-3 text-xs text-gray-600">Prompt dùng: <span className="font-mono">{result.prompt_used}</span></p>
          <div className="mt-3 flex gap-3">
            <a href={result.image_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded">Xem / Tải</a>
            {token && (
              <button onClick={save} disabled={saving || saved} className={`px-4 py-2 rounded text-white ${saved ? 'bg-green-600' : (saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700')}`}>
                {saved ? 'ĐÃ LƯU' : (saving ? 'ĐANG LƯU...' : 'LƯU VÀO LỊCH SỬ')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
