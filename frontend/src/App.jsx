// src/App.jsx (Đã cập nhật)

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthForm from "./pages/AuthForm.jsx";
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