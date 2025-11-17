// src/pages/HistoryContents.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function HistoryContents() {
  const { token } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    axios
      .get(`${BASE_URL}/history/contents`, { headers })
      .then((res) => setContents(res.data || []))
      .catch((e) => {
        console.error(e);
        setError("Không thể tải lịch sử nội dung.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const ok = window.confirm("Bạn có chắc chắn muốn xóa bản ghi nội dung này?");
      if (!ok) return;
      await axios.delete(`${BASE_URL}/history/contents/${id}`, { headers });
      setContents((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      setError("Xóa bản ghi thất bại.");
    }
  };

  const handleContinue = (record) => {
    try {
      localStorage.setItem("resumeContent", JSON.stringify(record));
    } catch {}
    navigate("/generator?resume=content");
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử nội dung...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold">Lịch sử nội dung</h2>
        <nav className="text-sm space-x-3">
          <Link className="text-gray-600 hover:text-indigo-700" to="/history/analyses">Phân tích</Link>
          <Link className="text-indigo-700 font-semibold" to="/history/contents">Nội dung</Link>
          <Link className="text-gray-600 hover:text-indigo-700" to="/history/images">Poster</Link>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      {contents.length === 0 ? (
        <p className="text-gray-600">Chưa có bản ghi.</p>
      ) : (
        <div className="space-y-2">
          {contents.map((r) => (
            <div key={r.id} className="p-2 text-xs bg-white rounded border shadow-sm card-hover">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-indigo-700 clamp-1 text-sm" title={r.product_name}>{r.product_name}</div>
                  <div className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded whitespace-nowrap"
                >
                  Xóa
                </button>
              </div>
              {!expanded[r.id] ? (
                <>
                  <div className="mt-1 font-semibold clamp-1 text-[12px]" title={r.title}>{r.title}</div>
                  <div className="mt-1 text-[11px] text-gray-700 clamp-1 whitespace-pre-wrap">{r.content}</div>
                </>
              ) : (
                <>
                  <div className="mt-1 text-sm">USP: {r.selected_usp}</div>
                  <div className="mt-1 text-sm">Tone: {r.selected_tone} | Format: {r.selected_format}</div>
                  <div className="mt-1 text-sm">Infor: {r.infor}</div>
                  <div className="mt-2 font-semibold">{r.title}</div>
                  <pre className="mt-1 text-sm whitespace-pre-wrap">{r.content}</pre>
                </>
              )}
              <div className="mt-2 flex items-center justify-between">
                <button onClick={() => toggle(r.id)} className="text-[11px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800">
                  {expanded[r.id] ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
                <button
                  onClick={() => handleContinue(r)}
                  className="text-[11px] bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded font-semibold"
                >
                  Tiếp tục tạo poster
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
