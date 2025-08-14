/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },

      fontSize: {
        title: "28px",
        subTitle: "20px",
        subTitle2: "18px",
        body: "15px",
        body6: "16px",
        body2: "12px",
        body3: "10px",
        input: "14px",
        button: "11px",
        body4: "8px",
      },
      colors: {
        primary: "#22E481",
        gray: {
          50: "#F9F9F9",
          100: "#EEEEEE",
          200: "#D0D0D0",
          300: "#CECECE",
          500: "#8C8C8C",
          600: "#424242",
          700: "#595959",
          800: "#383838",
          900: "#262626",
          custom: "rgba(53, 53, 53, 0.5)",
        },
        background: "#191919",
        white: "#FFFFFF",
        black: "#333446",
        background: "#191919",
        realBlack: "#090909",
        error: "#FF4444",
      },
      borderRadius: {
        md: "8px",
        r15: "15px",
        pill: "33554400px",
        full: "9999px",
      },
      width: { btn: "332px", input: "332px" }, // 입력칸 폭
      height: { btn: "50px", input: "64px" }, // 입력칸 높이
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
