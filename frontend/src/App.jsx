// src/App.jsx (Đã cập nhật)

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import History from "./pages/History.jsx";
import HistoryAnalyses from "./pages/HistoryAnalyses.jsx";
import HistoryContents from "./pages/HistoryContents.jsx";
import HistoryImages from "./pages/HistoryImages.jsx";
import AuthForm from "./pages/AuthForm.jsx";
import CompetitorAnalysisPage from "./pages/CompetitorAnalysisPage.jsx";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";

// Component bảo vệ route
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, authLoading } = useAuth();
    
    // Nếu đang kiểm tra auth, có thể hiển thị loading screen
    if (authLoading) {
        return <div className="text-center p-20 text-xl font-bold">Đang tải...</div>;
    }
    
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <main className="flex-grow p-4">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<AuthForm type="login" />} />
                    <Route path="/register" element={<AuthForm type="register" />} />
                    {/* Route cần bảo vệ */}
                    <Route 
                        path="/generator" 
                        element={
                            <ProtectedRoute>
                                <ContentGenerationForm />
                            </ProtectedRoute>
                        } 
                    />
                    {/* Route phân tích đối thủ - không cần authentication */}
                    <Route path="/competitor-analysis" element={<CompetitorAnalysisPage />} />
                    <Route 
                        path="/history"
                        element={<Navigate to="/history/analyses" replace />}
                    />
                    <Route 
                        path="/history/analyses"
                        element={
                            <ProtectedRoute>
                                <HistoryAnalyses />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/history/contents"
                        element={
                            <ProtectedRoute>
                                <HistoryContents />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/history/images"
                        element={
                            <ProtectedRoute>
                                <HistoryImages />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;