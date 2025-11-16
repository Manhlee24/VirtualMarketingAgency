// src/pages/HistoryAnalyses.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export default function HistoryAnalyses() {
  const { token } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        <div className="space-y-3">
          {analyses.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-indigo-700">{r.product_name}</div>
                  <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </div>
              <div className="mt-2 text-sm"><span className="font-semibold">Persona:</span> {r.target_persona}</div>
              <div className="mt-2 text-sm"><span className="font-semibold">Infor:</span> {r.infor}</div>
              <div className="mt-2 text-sm"><span className="font-semibold">USPs:</span> {r.usps.join(" | ")}</div>
              <div className="mt-2 text-sm"><span className="font-semibold">Pain points:</span> {r.pain_points.join(" | ")}</div>
              <div className="mt-3 text-right">
                <button
                  onClick={() => handleContinue(r)}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded font-semibold"
                >
                  Tiếp tục tạo nội dung
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
