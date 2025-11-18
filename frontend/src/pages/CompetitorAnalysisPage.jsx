// src/pages/CompetitorAnalysisPage.jsx

import React, { useState } from 'react';
import { 
    Search, TrendingUp, Users, Target, BarChart3, 
    DollarSign, MessageSquare, ShoppingBag, Award,
    Clock, CheckCircle, AlertCircle, Download, Share2
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api";

function CompetitorAnalysisPage() {
    const [competitorName, setCompetitorName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('product');

    const handleAnalyze = async () => {
        if (!competitorName.trim()) {
            setError('Vui lòng nhập tên đối thủ cạnh tranh');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/analyze_competitor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ competitor_name: competitorName }),
            });

            if (!response.ok) {
                throw new Error('Không thể phân tích đối thủ cạnh tranh');
            }

            const data = await response.json();
            setResult(data);
            setActiveTab('product'); // Reset về tab đầu tiên
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportJSON = () => {
        if (!result) return;
        
        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `competitor_analysis_${competitorName.replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'product', label: 'Sản phẩm', icon: Award },
        { id: 'customer', label: 'Khách hàng', icon: Users },
        { id: 'marketing', label: 'Marketing', icon: TrendingUp },
        { id: 'distribution', label: 'Phân phối', icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Phân Tích Đối Thủ Cạnh Tranh
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Khám phá chiến lược thị trường của đối thủ với phân tích chuyên sâu về sản phẩm, 
                        khách hàng, marketing và phân phối bằng AI
                    </p>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="max-w-4xl mx-auto">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                            Tên đối thủ cạnh tranh
                        </label>
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={competitorName}
                                    onChange={(e) => setCompetitorName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                    placeholder="Ví dụ: Vinamilk, Grab, Shopee..."
                                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-lg"
                                    disabled={loading}
                                />
                                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !competitorName.trim()}
                                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                                    loading || !competitorName.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Clock className="w-5 h-5 animate-spin" />
                                        Đang phân tích...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Phân tích
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {/* Quick Examples */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-500">Gợi ý:</span>
                            {['Coca Cola', 'Samsung', 'Nike'].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setCompetitorName(example)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
                                    disabled={loading}
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800 mb-1">Có lỗi xảy ra</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <Clock className="w-8 h-8 text-purple-600 animate-spin" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Đang phân tích đối thủ cạnh tranh...
                        </h3>
                        <p className="text-gray-600">
                            AI đang thu thập và phân tích dữ liệu từ nhiều nguồn. Quá trình này có thể mất 30-60 giây.
                        </p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {result && !loading && (
                    <div className="space-y-6">
                        {/* Result Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-8 h-8" />
                                    <h2 className="text-3xl font-bold">
                                        Kết quả phân tích: {result.product_name}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportJSON}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition"
                                    >
                                        <Download className="w-5 h-5" />
                                        Xuất JSON
                                    </button>
                                </div>
                            </div>
                            <p className="text-purple-100">
                                Phân tích được tạo bởi AI dựa trên dữ liệu công khai từ web
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex border-b border-gray-200">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-semibold transition ${
                                                activeTab === tab.id
                                                    ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {/* Product Analysis Tab */}
                                {activeTab === 'product' && (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Award className="w-6 h-6 text-purple-600" />
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    Điểm Bán Hàng Độc Đáo (USPs)
                                                </h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {result.product_analysis.usps.map((usp, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                                                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-800">{usp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-blue-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                                    <h4 className="font-bold text-gray-900">Thông Số Kỹ Thuật</h4>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.product_analysis.key_specs}
                                                </p>
                                            </div>

                                            <div className="p-6 bg-green-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                                    <h4 className="font-bold text-gray-900">Phản Hồi Chất Lượng</h4>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.product_analysis.quality_feedback}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <DollarSign className="w-6 h-6 text-orange-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Chiến Lược Định Giá</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.product_analysis.pricing_strategy}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Focus Tab */}
                                {activeTab === 'customer' && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-blue-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Users className="w-5 h-5 text-blue-600" />
                                                    <h4 className="font-bold text-gray-900">Chân Dung Khách Hàng</h4>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.customer_focus.target_persona}
                                                </p>
                                            </div>

                                            <div className="p-6 bg-amber-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Target className="w-5 h-5 text-amber-600" />
                                                    <h4 className="font-bold text-gray-900">Phân Khúc Bị Bỏ Lỡ</h4>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.customer_focus.missed_segments}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <AlertCircle className="w-6 h-6 text-red-600" />
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    Điểm Đau Của Khách Hàng
                                                </h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {result.customer_focus.pain_points.map((pain, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-800">{pain}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ShoppingBag className="w-6 h-6 text-purple-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Hành Trình Khách Hàng</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.customer_focus.customer_journey}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Marketing Strategy Tab */}
                                {activeTab === 'marketing' && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Kênh Truyền Thông Chính</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.marketing_strategy.key_channels}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MessageSquare className="w-6 h-6 text-purple-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Thông Điệp Cốt Lõi</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.marketing_strategy.core_messaging}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Award className="w-6 h-6 text-pink-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Nội Dung Sáng Tạo</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.marketing_strategy.content_creative}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Distribution & Market Tab */}
                                {activeTab === 'distribution' && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ShoppingBag className="w-6 h-6 text-green-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Kênh Phân Phối</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.distribution_market.distribution_channels}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <BarChart3 className="w-6 h-6 text-orange-600" />
                                                <h4 className="font-bold text-gray-900 text-xl">Ước Tính Thị Phần</h4>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {result.distribution_market.market_share_estimate}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompetitorAnalysisPage;
