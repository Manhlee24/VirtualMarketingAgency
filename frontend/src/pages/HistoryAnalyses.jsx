// src/pages/HistoryAnalyses.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function HistoryAnalyses() {
  const { token } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    axios
      .get(`${BASE_URL}/history/analyses`, { headers })
      .then((res) => setAnalyses(res.data || []))
      .catch((e) => {
        console.error(e);
        setError("Không thể tải lịch sử phân tích.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const ok = window.confirm("Bạn có chắc chắn muốn xóa bản ghi phân tích này?");
      if (!ok) return;
      await axios.delete(`${BASE_URL}/history/analyses/${id}`, { headers });
      setAnalyses((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      setError("Xóa bản ghi thất bại.");
    }
  };

  const handleContinue = (record) => {
    try {
      localStorage.setItem("resumeAnalysis", JSON.stringify(record));
    } catch {}
    navigate("/generator?resume=analysis");
  };

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const summarize = (arr = [], n = 2) => {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    const head = arr.slice(0, n);
    const more = arr.length - head.length;
    return head.join(" | ") + (more > 0 ? ` +${more} ...` : "");
  };

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử phân tích...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold">Lịch sử phân tích</h2>
        <nav className="text-sm space-x-3">
          <Link className="text-indigo-700 font-semibold" to="/history/analyses">Phân tích</Link>
          <Link className="text-gray-600 hover:text-indigo-700" to="/history/contents">Nội dung</Link>
          <Link className="text-gray-600 hover:text-indigo-700" to="/history/images">Poster</Link>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      {analyses.length === 0 ? (
        <p className="text-gray-600">Chưa có bản ghi.</p>
      ) : (
        <div className="space-y-2">
          {analyses.map((r) => (
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
                  <div className="mt-1 text-[11px]"><span className="font-semibold">Persona:</span> <span className="clamp-1 inline-block align-top" title={r.target_persona}>{r.target_persona}</span></div>
                  <div className="mt-1 text-[11px] text-gray-600">USP: {r.usps?.length || 0} | Pain: {r.pain_points?.length || 0}</div>
                </>
              ) : (
                <>
                  <div className="mt-2 text-sm"><span className="font-semibold">Persona:</span> {r.target_persona}</div>
                  <div className="mt-1 text-sm"><span className="font-semibold">Infor:</span> {r.infor}</div>
                  <div className="mt-1 text-sm"><span className="font-semibold">USPs:</span> {r.usps.join(' | ')}</div>
                  <div className="mt-1 text-sm"><span className="font-semibold">Pain points:</span> {r.pain_points.join(' | ')}</div>
                </>
              )}
              <div className="mt-2 flex items-center justify-between">
                <button onClick={() => toggle(r.id)} className="text-[11px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800">
                  {expanded[r.id] ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
                <div className="text-right">
                  <button
                    onClick={() => handleContinue(r)}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded font-semibold"
                  >
                    Tiếp tục tạo nội dung
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
