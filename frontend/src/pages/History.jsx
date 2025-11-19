// src/pages/History.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function History() {
  const { token } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [contents, setContents] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      axios.get(`${BASE_URL}/history/analyses`, { headers }),
      axios.get(`${BASE_URL}/history/contents`, { headers }),
      axios.get(`${BASE_URL}/history/images`, { headers }),
    ])
      .then(([a, c, i]) => {
        setAnalyses(a.data || []);
        setContents(c.data || []);
        setImages(i.data || []);
      })
      .catch((e) => {
        console.error(e);
        setError("Không thể tải lịch sử.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <div className="p-6">Vui lòng đăng nhập để xem lịch sử.</div>;
  if (loading) return <div className="p-6">Đang tải lịch sử...</div>;

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filterStringFields = (value) =>
    typeof value === "string" && value.toLowerCase().includes(normalizedQuery);

  const filteredAnalyses = useMemo(() => {
    if (!normalizedQuery) return analyses;
    return analyses.filter((item) =>
      [
        item.product_name,
        item.target_persona,
        item.infor,
        ...(item.usps || []),
        ...(item.pain_points || []),
      ].some(filterStringFields)
    );
  }, [analyses, normalizedQuery]);

  const filteredContents = useMemo(() => {
    if (!normalizedQuery) return contents;
    return contents.filter((item) =>
      [
        item.product_name,
        item.title,
        item.infor,
        item.content,
        item.selected_usp,
        item.selected_tone,
        item.selected_format,
      ].some(filterStringFields)
    );
  }, [contents, normalizedQuery]);

  const filteredImages = useMemo(() => {
    if (!normalizedQuery) return images;
    return images.filter((item) =>
      [
        item.product_name,
        item.usp,
        item.infor,
        item.style_short,
      ].some(filterStringFields)
    );
  }, [images, normalizedQuery]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <h2 className="text-3xl font-extrabold">Lịch sử hoạt động</h2>
        <div className="w-full md:max-w-sm">
          <label htmlFor="history-search" className="sr-only">Tìm kiếm</label>
          <input
            id="history-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm trong tất cả bản ghi"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">{error}</div>
      )}

      <section className="mb-10">
        <h3 className="text-2xl font-bold mb-3">Kết quả phân tích đã lưu</h3>
        {analyses.length === 0 ? (
          <p className="text-gray-600">Chưa có bản ghi.</p>
        ) : filteredAnalyses.length === 0 ? (
          <p className="text-gray-600">Không tìm thấy kết quả phù hợp.</p>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded border shadow-sm">
                <div className="font-bold text-indigo-700">{r.product_name}</div>
                <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                <div className="mt-2 text-sm"><span className="font-semibold">Persona:</span> {r.target_persona}</div>
                <div className="mt-2 text-sm"><span className="font-semibold">Infor:</span> {r.infor}</div>
                <div className="mt-2 text-sm"><span className="font-semibold">USPs:</span> {r.usps.join(" | ")}</div>
                <div className="mt-2 text-sm"><span className="font-semibold">Pain points:</span> {r.pain_points.join(" | ")}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h3 className="text-2xl font-bold mb-3">Nội dung đã lưu</h3>
        {contents.length === 0 ? (
          <p className="text-gray-600">Chưa có bản ghi.</p>
        ) : filteredContents.length === 0 ? (
          <p className="text-gray-600">Không tìm thấy nội dung phù hợp.</p>
        ) : (
          <div className="space-y-3">
            {filteredContents.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded border shadow-sm">
                <div className="font-bold text-indigo-700">{r.product_name}</div>
                <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                <div className="mt-1 text-sm">USP: {r.selected_usp}</div>
                <div className="mt-1 text-sm">Tone: {r.selected_tone} | Format: {r.selected_format}</div>
                <div className="mt-1 text-sm">Infor: {r.infor}</div>
                <div className="mt-2 font-semibold">{r.title}</div>
                <pre className="mt-1 text-sm whitespace-pre-wrap">{r.content}</pre>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-bold mb-3">Poster đã lưu</h3>
        {images.length === 0 ? (
          <p className="text-gray-600">Chưa có bản ghi.</p>
        ) : filteredImages.length === 0 ? (
          <p className="text-gray-600">Không tìm thấy poster phù hợp.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredImages.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded border shadow-sm">
                <div className="font-bold text-indigo-700">{r.product_name}</div>
                <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</div>
                <img src={r.image_url} alt="saved" className="mt-2 rounded border" />
                <div className="mt-2 text-sm">USP: {r.usp}</div>
                <div className="mt-1 text-sm">Infor: {r.infor}</div>
                {r.style_short && <div className="mt-1 text-sm">Style: {r.style_short}</div>}
                {r.reference_url && (
                  <a className="mt-2 inline-block text-indigo-600 underline" href={r.reference_url} target="_blank" rel="noreferrer">Ảnh tham khảo</a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
