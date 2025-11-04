// src/App.jsx (Ví dụ)
// import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
// function App() {
//   return (
//     <div className="min-h-screen bg-gray-100 p-4">
//       <ContentGenerationForm />
//     </div>
//   );
// }

// export default App;
// src/App.jsx
// import React, { useState } from "react";
// import ContentGenerationForm from "./components/ContentGenerationForm.jsx";

// function App() {
//   const [authOpen, setAuthOpen] = useState(false);
//   const [authMode, setAuthMode] = useState("login");
//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
//       {/* HEADER */}
//       <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm px-8 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <div className="flex items-center gap-2">
//           <img src="/vite.svg" alt="logo" className="h-8 w-8" />
//           <h1 className="text-xl md:text-2xl font-bold text-indigo-600">
//             Virtual Marketing Agency
//           </h1>
//         </div>

//         {/* Menu giữa */}
//         <nav className="hidden md:flex items-center gap-6">
//           <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             MARKETING TỰ ĐỘNG VỚI AI
//           </button>
//           <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Hướng dẫn sử dụng 
//           </button>
//           <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Mẫu
//           </button>
//           <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Liên hệ
//           </button>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Tìm kiếm sản phẩm..."
//               className="px-3 py-2 text-sm border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             />
//             <span className="absolute right-3 top-2.5 text-gray-400"></span>
//           </div>
//         </nav>

//         {/* Nút đăng ký / đăng nhập */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => {
//               setAuthMode("login");
//               setAuthOpen(true);
//             }}
//             className="text-indigo-600 font-semibold hover:text-indigo-800 transition"
//           >
//             Đăng nhập
//           </button>
//           <button
//             onClick={() => {
//               setAuthMode("signup");
//               setAuthOpen(true);
//             }}
//             className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
//           >
//             Đăng ký
//           </button>
//         </div>
//       </header>
//       {/* MAIN */}
//       <main className="flex-grow container mx-auto px-6 py-10">
//         <ContentGenerationForm />
//       </main>
//       {/* FOOTER */}
//       <footer className="bg-white border-t shadow-inner py-4 text-center text-sm text-gray-500">
//         © {new Date().getFullYear()} Virtual Marketing Agency. All rights reserved.
//       </footer>
//       {/* AUTH MODAL */}
//       {authOpen && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
//             <button
//               onClick={() => setAuthOpen(false)}
//               className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
//             >
//               ✕
//             </button>
//             <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
//               {authMode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
//             </h2>

//             <div className="space-y-4">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//               />
//               <input
//                 type="password"
//                 placeholder="Mật khẩu"
//                 className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//               />
//               {authMode === "signup" && (
//                 <input
//                   type="text"
//                   placeholder="Tên hiển thị"
//                   className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//                 />
//               )}
//               <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
//                 {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
//               </button>
//             </div>

//             <p className="text-center text-sm text-gray-600 mt-4">
//               {authMode === "login" ? (
//                 <>
//                   Chưa có tài khoản?{" "}
//                   <button
//                     onClick={() => setAuthMode("signup")}
//                     className="text-indigo-600 font-semibold"
//                   >
//                     Đăng ký ngay
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Đã có tài khoản?{" "}
//                   <button
//                     onClick={() => setAuthMode("login")}
//                     className="text-indigo-600 font-semibold"
//                   >
//                     Đăng nhập
//                   </button>
//                 </>
//               )}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import React, { useState } from "react";
import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
import MarketingTemplate from "./components/MarketingTemplate.jsx";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showMain, setShowMain] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [images] = useState([
  
    "/2.jpg",
    "6.jpg",
    "/8.jpg"
  
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/vite.svg" alt="logo" className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl font-bold text-indigo-600">
            Virtual Marketing Agency
          </h1>
        </div>

        {/* Menu giữa */}
        <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => {  setShowMain(false);setShowTemplate(false);}} 
            className="text-gray-700 hover:text-indigo-600 font-medium transition">
            Trang Chủ
          </button>
          <button
            onClick={() => setShowMain(true)}
            className="text-gray-700 hover:text-indigo-600 font-medium transition"
          >
            Tính Năng
          </button>
          <button onClick={() => {
                    setShowMain(false); setShowTemplate(true);}}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  Mẫu
                </button>
          <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
            Liên Hệ
          </button>
          
        </nav>

        {/* Nút đăng ký / đăng nhập */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAuthMode("login");
              setAuthOpen(true);
            }}
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            Đăng ký
          </button>
        </div>
      </header>

      {}
<main className="flex-grow w-full p-0 m-0">
                          {!showMain && !showTemplate ? (
                    // Trang chủ
                    <div className="relative w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center text-white overflow-hidden">
                      {/* Background image */}
                        <img
                          src={images[currentIndex]}
                          alt="Virtual Marketing"
                          className="absolute inset-0 w-full h-full object-cover scale-110 brightness-75 transition-all duration-700 ease-in-out"
                        />
                       <button
                        onClick={prevImage}
                      className="absolute left-5 md:left-10 top-1/2  -translate-y-[2cm] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white w-12 h-16 rounded-full text-4xl font-bold leading-none z-20"
                        >
                            <span className="relative -top-[0.1cm]">‹</span>
                        </button>
                        <button
                          onClick={nextImage}
                      className="absolute right-5 md:right-10 top-1/2  -translate-y-[2cm] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white w-12 h-16 rounded-full text-4xl font-bold leading-none z-20"
                        >
  <span className="relative -top-[0.1cm]">›</span>

                        </button>
                      {/* Overlay nội dung */}
                      <div className="relative z-10 space-y-6 px-6">
                        <h2 className="text-5xl md:text-6xl font-bold drop-shadow-2xl">
                          Nền tảng Marketing Tự Động với AI
                        </h2>
                        <p className="text-xl max-w-3xl mx-auto text-gray-100 drop-shadow-lg">
                          Khám phá cách AI giúp bạn phân tích thị trường, tạo nội dung và hình ảnh marketing chuyên nghiệp chỉ trong vài giây.
                        </p>
                      </div>
                    </div>
                  ) : showMain ? (
                    <ContentGenerationForm />
                  ) : (
                    <MarketingTemplate />
                  )}
                </main>


      {/* FOOTER */}
      <footer className="bg-white border-t shadow-inner py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Virtual Marketing Agency. All rights reserved.
      </footer>

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative">
            <button
              onClick={() => setAuthOpen(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
              {authMode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
            </h2>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              />
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Tên hiển thị"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                />
              )}
              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              {authMode === "login" ? (
                <>
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => setAuthMode("signup")}
                    className="text-indigo-600 font-semibold"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    className="text-indigo-600 font-semibold"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
