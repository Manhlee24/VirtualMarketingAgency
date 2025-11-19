// src/pages/HistoryContents.jsx

import React, { useEffect, useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
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

  useEffect(() => {
    setExpanded({});
  }, [searchTerm]);

  const filteredContents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return contents;
    return contents.filter((item) => {
      const fields = [
        item.product_name,
        item.title,
        item.infor,
        item.selected_usp,
        item.selected_tone,
        item.selected_format,
        item.content,
      ];
      return fields.some((value) =>
        typeof value === "string" && value.toLowerCase().includes(q)
      );
    });
  }, [contents, searchTerm]);

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử nội dung...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold">Lịch sử nội dung</h2>
          <nav className="mt-2 text-sm space-x-3">
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/analyses">Phân tích</Link>
            <Link className="text-indigo-700 font-semibold" to="/history/contents">Nội dung</Link>
            <Link className="text-gray-600 hover:text-indigo-700" to="/history/images">Poster</Link>
          </nav>
        </div>
        <div className="w-full md:max-w-xs">
          <label htmlFor="content-search" className="sr-only">Tìm kiếm</label>
          <input
            id="content-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên sản phẩm, tiêu đề, USP..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      {contents.length === 0 ? (
        <p className="text-gray-600">Chưa có bản ghi.</p>
      ) : filteredContents.length === 0 ? (
        <p className="text-gray-600">Không tìm thấy bản ghi phù hợp với "{searchTerm}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContents.map((r) => {
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
                    <>
                      <div className="mt-2 text-[13px] font-semibold text-gray-900 truncate" title={r.title}>{r.title}</div>
                      <div className="mt-1 text-[12px] text-gray-700 line-clamp-2 whitespace-pre-wrap leading-snug" title={r.content}>{r.content}</div>
                    </>
                  )}

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      <h3 className="text-base font-bold text-gray-900" title={r.title}>{r.title}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-md border border-indigo-100 bg-indigo-50/60 p-2">
                          <div className="text-[11px] font-semibold text-indigo-600">USP</div>
                          <div className="text-[12px] text-gray-800 break-words">{r.selected_usp || '—'}</div>
                        </div>
                        <div className="rounded-md border border-violet-100 bg-violet-50/60 p-2">
                          <div className="text-[11px] font-semibold text-violet-600">Tone</div>
                          <div className="text-[12px] text-gray-800">{r.selected_tone || '—'}</div>
                        </div>
                        <div className="rounded-md border border-fuchsia-100 bg-fuchsia-50/60 p-2">
                          <div className="text-[11px] font-semibold text-fuchsia-600">Format</div>
                          <div className="text-[12px] text-gray-800">{r.selected_format || '—'}</div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Thông tin thêm</div>
                        <p className="mt-1 text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">{r.infor || '—'}</p>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide">Nội dung tạo</div>
                        <pre className="mt-1 max-h-72 overflow-auto text-[12px] leading-relaxed whitespace-pre-wrap text-gray-900">{r.content}</pre>
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
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow"
                    >Tiếp tục tạo poster</button>
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
