// src/pages/HistoryAnalyses.jsx

import React, { useEffect, useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
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
  useEffect(() => {
    setExpanded({});
  }, [searchTerm]);

  const filteredAnalyses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return analyses;
    return analyses.filter((item) => {
      const fields = [
        item.product_name,
        item.target_persona,
        item.infor,
        ...(item.usps || []),
        ...(item.pain_points || []),
      ];
      return fields.some((value) =>
        typeof value === "string" && value.toLowerCase().includes(q)
      );
    });
  }, [analyses, searchTerm]);

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử phân tích...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold">Lịch sử phân tích</h2>
          <nav className="mt-2 text-sm space-x-3">
            <Link className="text-indigo-700 font-semibold" to="/history/analyses">Phân tích</Link>
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/contents">Nội dung</Link>
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/images">Poster</Link>
          </nav>
        </div>
        <div className="w-full md:max-w-xs">
          <label htmlFor="analysis-search" className="sr-only">Tìm kiếm</label>
          <input
            id="analysis-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, persona, USP..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      {analyses.length === 0 ? (
        <p className="text-gray-600">Chưa có bản ghi.</p>
      ) : filteredAnalyses.length === 0 ? (
        <p className="text-gray-600">Không tìm thấy bản ghi phù hợp với "{searchTerm}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnalyses.map((r) => {
            const isOpen = !!expanded[r.id];
            return (
              <div
                key={r.id}
                className="relative rounded-xl border border-indigo-100 bg-white shadow-sm hover:shadow-md transition group"
              >
                <div className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-indigo-700 truncate" title={r.product_name}>{r.product_name}</div>
                      <div className="text-[11px] text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs font-medium px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >Xóa</button>
                  </div>

                  {/* Collapsed preview */}
                  {!isOpen && (
                    <div className="mt-2 space-y-1 text-[12px]">
                      <div className="font-semibold text-gray-900 truncate" title={r.target_persona}>Persona: {r.target_persona}</div>
                      <div className="text-gray-600 truncate" title={`USPs: ${(r.usps||[]).join(' | ')}`}>USPs: {(r.usps||[]).slice(0,3).join(' | ')}{(r.usps||[]).length>3 ? '…' : ''}</div>
                      <div className="text-gray-600 truncate" title={`Pain: ${(r.pain_points||[]).join(' | ')}`}>Pain: {(r.pain_points||[]).slice(0,3).join(' | ')}{(r.pain_points||[]).length>3 ? '…' : ''}</div>
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Persona</div>
                          <p className="mt-1 text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">{r.target_persona}</p>
                        </div>
                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                          <div className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">Infor</div>
                          <p className="mt-1 text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">{r.infor || '—'}</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                        <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">USPs</div>
                        <ul className="mt-1 space-y-1 text-[12px] text-gray-800 list-disc list-inside">
                          {(r.usps||[]).map((u,i)=>(<li key={i}>{u}</li>))}
                          {!(r.usps||[]).length && <li className="list-none text-gray-500">Không có</li>}
                        </ul>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                        <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wide">Pain Points</div>
                        <ul className="mt-1 space-y-1 text-[12px] text-gray-800 list-disc list-inside">
                          {(r.pain_points||[]).map((p,i)=>(<li key={i}>{p}</li>))}
                          {!(r.pain_points||[]).length && <li className="list-none text-gray-500">Không có</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => toggle(r.id)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                    >{isOpen ? 'Thu gọn' : 'Xem chi tiết'}</button>
                    <button
                      onClick={() => handleContinue(r)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow"
                    >Tiếp tục tạo nội dung</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
