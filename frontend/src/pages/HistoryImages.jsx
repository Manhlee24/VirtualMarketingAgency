// src/pages/HistoryImages.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function HistoryImages() {
  const { token } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    axios
      .get(`${BASE_URL}/history/images`, { headers })
      .then((res) => setImages(res.data || []))
      .catch((e) => {
        console.error(e);
        setError("Không thể tải lịch sử poster.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const ok = window.confirm("Bạn có chắc chắn muốn xóa poster này?");
      if (!ok) return;
      await axios.delete(`${BASE_URL}/history/images/${id}`, { headers });
      setImages((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      setError("Xóa bản ghi thất bại.");
    }
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    setExpanded({});
  }, [searchTerm]);

  const filteredImages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return images;
    return images.filter((item) => {
      const fields = [
        item.product_name,
        item.usp,
        item.infor,
        item.style_short,
      ];
      return fields.some((value) =>
        typeof value === "string" && value.toLowerCase().includes(q)
      );
    });
  }, [images, searchTerm]);

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử poster...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold">Lịch sử poster</h2>
          <nav className="mt-2 text-sm space-x-3">
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/analyses">Phân tích</Link>
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/contents">Nội dung</Link>
            <Link className="text-indigo-700 font-semibold" to="/history/images">Poster</Link>
          </nav>
        </div>
        <div className="w-full md:max-w-xs">
          <label htmlFor="image-search" className="sr-only">Tìm kiếm</label>
          <input
            id="image-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, USP, style..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      {images.length === 0 ? (
        <p className="text-gray-600">Chưa có bản ghi.</p>
      ) : filteredImages.length === 0 ? (
        <p className="text-gray-600">Không tìm thấy bản ghi phù hợp với "{searchTerm}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredImages.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded border shadow-sm card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-indigo-700 clamp-1" title={r.product_name}>{r.product_name}</div>
                  <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </div>
              <img src={r.image_url} alt="saved" className="mt-2 rounded border max-h-60 object-contain w-full bg-gray-50" />
              {!expanded[r.id] ? (
                <>
                  {r.style_short && <div className="mt-2 text-sm clamp-1" title={r.style_short}>Style: {r.style_short}</div>}
                </>
              ) : (
                <>
                  {r.usp && <div className="mt-2 text-sm">USP: {r.usp}</div>}
                  {r.infor && <div className="mt-1 text-sm">Infor: {r.infor}</div>}
                  {r.style_short && <div className="mt-1 text-sm">Style: {r.style_short}</div>}
                  {r.prompt_used && (
                    <div className="mt-2 text-xs text-gray-700">
                      <span className="font-semibold">Prompt:</span> <span className="whitespace-pre-wrap">{r.prompt_used}</span>
                    </div>
                  )}
                  {r.reference_url && (
                    <a className="mt-2 inline-block text-indigo-600 underline" href={r.reference_url} target="_blank" rel="noreferrer">Ảnh tham khảo</a>
                  )}
                </>
              )}
              <div className="mt-3 flex items-center justify-between">
                <button onClick={() => toggle(r.id)} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800">
                  {expanded[r.id] ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
                <a
                  href={r.image_url}
                  download
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold"
                >
                  Tải xuống
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
