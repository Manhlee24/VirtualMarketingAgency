// src/pages/PosterPage.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { Target } from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000/api";

export default function PosterPage() {
  const { token } = useAuth();
  const [productName, setProductName] = useState("");
  const [styleShort, setStyleShort] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Limitations intentionally not displayed

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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Tạo Poster Từ Ảnh Mẫu</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">Không cần đi qua Giai đoạn 1 và 2. Chỉ cần cung cấp tên sản phẩm, (tuỳ chọn) phong cách, và Ảnh mẫu bắt buộc.</p>
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
