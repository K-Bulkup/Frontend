/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },

      fontSize: {
        title: "28px", //가장 큰 타이틀
        subTitle: "20px", // 서브 타이틀
        input: "14px", //입력
        body: "15px", // 본문 텍스트 1
        body2: "12px", // 본문 텍스트 2
        body3: "10px", // 본문 텍스트 3
        button: "11px", // 버튼
      },
      colors: {
        primary: "#22E481",
        gray: {
          50: "#F9F9F9",
          300: "#CECECE",
          600: "#424242",
          800: "#393939",
          900: "#262626",
          custom: "rgba(53, 53, 53, 0.5)",
        },
        background: "#191919",
        white: "#FFFFFF",
        error: "#FF4444",
      },
      borderRadius: {
        md: "8px",
        15: "15px",
        bt: "33554400px",
        full: "9999px",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
