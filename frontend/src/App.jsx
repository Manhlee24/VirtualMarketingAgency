// import React, { useState } from "react";
// // BƯỚC 1: Import axios và react-hot-toast
// import axios from "axios";
// import { Toaster, toast } from "react-hot-toast";

// import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
// import MarketingTemplate from "./components/MarketingTemplate.jsx";

// function App() {
//   const [authOpen, setAuthOpen] = useState(false);
//   const [authMode, setAuthMode] = useState("login");
//   const [showMain, setShowMain] = useState(false);
//   const [showTemplate, setShowTemplate] = useState(false);
//   const [images] = useState(["/2.jpg", "6.jpg", "/8.jpg"]);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // BƯỚC 2: Thêm state để quản lý dữ liệu form
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "", // Dùng cho đăng ký
//   });

//   const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
//   const prevImage = () =>
//     setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

//   // BƯỚC 3: Hàm xử lý khi gõ vào input
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Hàm dọn dẹp form và đóng modal
//   const closeModal = () => {
//     setAuthOpen(false);
//     setFormData({ email: "", password: "", name: "" }); // Reset form
//   };

//   // BƯỚC 4: Hàm xử lý Đăng nhập
//   const handleLogin = async (e) => {
//     e.preventDefault(); // Ngăn form reload
//     toast.loading("Đang đăng nhập..."); // Hiển thị loading

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/auth/login", // <-- SỬA LẠI ĐƯỜNG DẪN
//         {
//           email: formData.email,
//           password: formData.password,
//         }
//       );

//       toast.dismiss(); // Tắt loading
//       toast.success("Đăng nhập thành công!");
//       console.log("Login success:", response.data);

//       // (Quan trọng) Lưu token vào localStorage
//       // localStorage.setItem("token", response.data.access_token);
      
//       closeModal();
//       // Bạn có thể thêm state [isLoggedIn, setIsLoggedIn] để thay đổi header
      
//     } catch (error) {
//       toast.dismiss();
//       // DÒNG NÀY ĐÃ SỬA LỖI CÚ PHÁP
//       toast.error("Lỗi: " + (error.response?.data?.detail || "Không thể đăng nhập"));
//       console.error("Login error:", error);
//     }
//   };

//   // BƯỚC 5: Hàm xử lý Đăng ký
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     toast.loading("Đang đăng ký...");

//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/auth/register", // <-- SỬA LẠI ĐƯỜNG DẪN
//         {
//           email: formData.email,
//           name: formData.name, 
//           password: formData.password,
//         }
//       );
      
//       toast.dismiss();
//       toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
//       console.log("Signup success:", response.data);

//       // Tự động chuyển sang tab đăng nhập
//       setAuthMode("login");
//       setFormData({ email: formData.email, password: "", name: "" }); // Giữ lại email

//     } catch (error) {
//       toast.dismiss();
//       // DÒNG NÀY ĐÃ SỬA LỖI CÚ PHÁP
//       toast.error("Lỗi: " + (error.response?.data?.detail || "Không thể đăng ký"));
//       console.error("Signup error:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
//       {/* BƯỚC 6: Thêm Toaster để thông báo hoạt động */}
//       <Toaster position="top-right" reverseOrder={false} />

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
//           <button onClick={() => { setShowMain(false);setShowTemplate(false);}} 
//           className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Trang Chủ
//           </button>
//           <button
//             onClick={() => setShowMain(true)}
//             className="text-gray-700 hover:text-indigo-600 font-medium transition"
//           >
//             Tính Năng
//           </button>
//           <button onClick={() => {
//                   setShowMain(false); setShowTemplate(true);}}
//                   className="text-gray-700 hover:text-indigo-600 font-medium transition"
//                 >
//                   Mẫu
//                 </button>
//           <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Liên Hệ
//           </button>
//             <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
//             Lịch sử
//           </button>
          
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

//       {}
//       <main className="flex-grow w-full p-0 m-0">
//         {!showMain && !showTemplate ? (
//           // Trang chủ
//           <div className="relative w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center text-white overflow-hidden">
//             {/* Background image */}
//             <img
//               src={images[currentIndex]}
//               alt="Virtual Marketing"
//               className="absolute inset-0 w-full h-full object-cover scale-110 brightness-75 transition-all duration-700 ease-in-out"
//             />
//             <button
//               onClick={prevImage}
//               className="absolute left-5 md:left-10 top-1/2  -translate-y-[2cm] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white w-12 h-16 rounded-full text-4xl font-bold leading-none z-20"
//             >
//               <span className="relative -top-[0.1cm]">‹</span>
//             </button>
//             <button
//               onClick={nextImage}
//               className="absolute right-5 md:right-10 top-1/2  -translate-y-[2cm] flex items-center justify-center bg-black/40 hover:bg-black/60 text-white w-12 h-16 rounded-full text-4xl font-bold leading-none z-20"
//             >
//               <span className="relative -top-[0.1cm]">›</span>
//             </button>
//             {/* Overlay nội dung */}
//             <div className="relative z-10 space-y-6 px-6">
//               <h2 className="text-5xl md:text-6xl font-bold drop-shadow-2xl">
//                 Nền tảng Marketing Tự Động với AI
//               </h2>
//               <p className="text-xl max-w-3xl mx-auto text-gray-100 drop-shadow-lg">
//                 Khám phá cách AI giúp bạn phân tích thị trường, tạo nội dung và hình ảnh marketing chuyên nghiệp chỉ trong vài giây.
//               </p>
//             </div>
//           </div>
//         ) : showMain ? (
//           <ContentGenerationForm />
//         ) : (
//           <MarketingTemplate />
//         )}
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
//               onClick={closeModal} // <-- Dùng hàm closeModal
//               className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
//             >
//               ✕
//             </button>

//             <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
//               {authMode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
//             </h2>

//             {/* BƯỚC 7: Bọc input bằng <form> và dùng onSubmit */}
//             <form
//               onSubmit={authMode === "login" ? handleLogin : handleSignup}
//               className="space-y-4"
//             >
//               <input
//                 type="email"
//                 name="email" // <-- Thêm name
//                 placeholder="Email"
//                 className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//                 value={formData.email} // <-- Kết nối state
//                 onChange={handleInputChange} // <-- Kết nối hàm
//                 required
//               />
//               <input
//                 type="password"
//                 name="password" // <-- Thêm name
//                 placeholder="Mật khẩu"
//                 className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//                 value={formData.password} // <-- Kết nối state
//                 onChange={handleInputChange} // <-- Kết nối hàm
//                 required
//               />
//               {authMode === "signup" && (
//                 <input
//                   type="text"
//                   name="name" // <-- Thêm name
//                   placeholder="Tên hiển thị"
//                   className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
//                   value={formData.name} // <-- Kết nối state
//                   onChange={handleInputChange} // <-- Kết nối hàm
//                   required
//                 />
//               )}
//               {/* BƯỚC 8: Đổi <button> thành type="submit" */}
//               <button
//                 type="submit"
//                 className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
//               >
//                 {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
//               </button>
//             </form>

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
import React, { useState, useEffect } from "react";
// BƯỚC 1: Import axios và react-hot-toast
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

import ContentGenerationForm from "./components/ContentGenerationForm.jsx";
import MarketingTemplate from "./components/MarketingTemplate.jsx";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showMain, setShowMain] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [images] = useState(["/2.jpg", "6.jpg", "/8.jpg"]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // BƯỚC MỚI: State cho trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // BƯỚC MỚI: Kiểm tra localStorage khi app tải
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    
    if (token && storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
      // Bạn có thể thêm bước xác thực token với backend ở đây nếu cần
    }
  }, []); // Chạy 1 lần duy nhất khi tải trang

  // BƯỚC 2: Thêm state để quản lý dữ liệu form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "", // Dùng cho đăng ký
  });

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  // BƯỚC 3: Hàm xử lý khi gõ vào input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm dọn dẹp form và đóng modal
  const closeModal = () => {
    setAuthOpen(false);
    setFormData({ email: "", password: "", name: "" }); // Reset form
  };

  // BƯỚC 4: Hàm xử lý Đăng nhập (ĐÃ CẬP NHẬT)
  const handleLogin = async (e) => {
    e.preventDefault(); 
    toast.loading("Đang đăng nhập..."); 

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login", 
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Lấy token và name từ response
      const { access_token, name } = response.data;

      // KIỂM TRA PHẢN HỒI (RẤT QUAN TRỌNG)
      if (!access_token || !name) {
        toast.dismiss();
        toast.error("Lỗi: API không trả về token hoặc tên người dùng.");
        return;
      }

      toast.dismiss(); 
      toast.success(`Chào mừng, ${name}!`);
      
      // Lưu vào localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("userName", name);

      // Cập nhật state
      setIsLoggedIn(true);
      setUserName(name);
      
      closeModal();
      
    } catch (error) {
      toast.dismiss();
      toast.error("Lỗi: " + (error.response?.data?.detail || "Không thể đăng nhập"));
      console.error("Login error:", error);
    }
  };

  // BƯỚC 5: Hàm xử lý Đăng ký (ĐÃ CẬP NHẬT)
  const handleSignup = async (e) => {
    e.preventDefault();
    toast.loading("Đang đăng ký...");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register", 
        {
          email: formData.email,
          name: formData.name, 
          password: formData.password,
        }
      );
      
      // Lấy token từ response và name từ form
      const { access_token } = response.data;
      const name = formData.name;

      if (!access_token) {
        toast.dismiss();
        toast.error("Lỗi: API không trả về token sau khi đăng ký.");
        return;
      }

      toast.dismiss();
      toast.success("Đăng ký thành công! Tự động đăng nhập...");
      
      // Lưu vào localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("userName", name);

      // Cập nhật state
      setIsLoggedIn(true);
      setUserName(name);

      closeModal();

    } catch (error) {
      toast.dismiss();
      toast.error("Lỗi: " + (error.response?.data?.detail || "Không thể đăng ký"));
      console.error("Signup error:", error);
    }
  };

  // BƯỚC MỚI: Hàm xử lý Đăng xuất
  const handleLogout = () => {
    // Xóa khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    // Cập nhật state
    setIsLoggedIn(false);
    setUserName("");

    toast.success("Đã đăng xuất!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <Toaster position="top-right" reverseOrder={false} />

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
          <button onClick={() => { setShowMain(false);setShowTemplate(false);}} 
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
            <button className="text-gray-700 hover:text-indigo-600 font-medium transition">
            Lịch sử
          </button>
        </nav>

        {/* Nút đăng ký / đăng nhập (ĐÃ CẬP NHẬT) */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            // NẾU ĐÃ ĐĂNG NHẬP
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-semibold text-lg">
                  {/* Lấy chữ cái đầu của tên */}
                  {userName ? userName.charAt(0).toUpperCase() : "A"}
                </span>
                <span className="font-medium text-gray-700 hidden md:block">
                  Chào, {userName}!
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-indigo-600 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            // NẾU CHƯA ĐĂNG NHẬP
            <>
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
            </>
          )}
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
              onClick={closeModal} // <-- Dùng hàm closeModal
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
              {authMode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
            </h2>

            {/* BƯỚC 7: Bọc input bằng <form> và dùng onSubmit */}
            <form
              onSubmit={authMode === "login" ? handleLogin : handleSignup}
              className="space-y-4"
            >
              <input
                type="email"
                name="email" // <-- Thêm name
                placeholder="Email"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                value={formData.email} // <-- Kết nối state
                onChange={handleInputChange} // <-- Kết nối hàm
                required
              />
              <input
                type="password"
                name="password" // <-- Thêm name
                placeholder="Mật khẩu"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                value={formData.password} // <-- Kết nối state
                onChange={handleInputChange} // <-- Kết nối hàm
                required
              />
              {authMode === "signup" && (
                <input
                  type="text"
                  name="name" // <-- Thêm name
                  placeholder="Tên hiển thị"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
                  value={formData.name} // <-- Kết nối state
                  onChange={handleInputChange} // <-- Kết nối hàm
                  required
                />
              )}
              {/* BƯỚC 8: Đổi <button> thành type="submit" */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            </form>

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