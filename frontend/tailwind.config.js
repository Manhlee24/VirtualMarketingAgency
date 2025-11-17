// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Cập nhật mảng 'content' như sau:
  content: [
    // 1. Quét tất cả file HTML ở thư mục gốc (nếu bạn có index.html, about.html,...)
    "./*.html",
    "./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
