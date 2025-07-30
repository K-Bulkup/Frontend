/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },

      fontSize: {
        display: "36px", // 가장 큰 타이틀
        title: "24px", // 섹션 제목
        heading: "18px", // 일반 제목
        body: "16px", // 본문 텍스트
        subtext: "14px", // 설명 텍스트
        caption: "12px", // 작은 설명 (뱃지 등)
        extra: "10px", // 툴팁 등 매우 작은 텍스트
      },
      colors: {
        primary: "#FBE081",
        gray: {
          50: "#F9F9F9",
          100: "#EEEEEE",
          200: "#D0D0D0",
          700: "#595959",
          800: "#383838",
        },
        white: "#FFFFFF",
        black: "#333446",
        realBlack: "#090909",
        error: "#FF4444",
      },
      borderRadius: {
        md: "8px",
        full: "9999px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
