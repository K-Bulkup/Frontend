/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },

      fontSize: {
        // 기존 폰트 사이즈
        // display: "36px", // 가장 큰 타이틀
        // title: "24px", // 섹션 제목
        // heading: "18px", // 일반 제목
        // body: "16px", // 본문 텍스트
        // subtext: "14px", // 설명 텍스트
        // caption: "12px", // 작은 설명 (뱃지 등)
        // extra: "10px", // 툴팁 등 매우 작은 텍스트

        // 바뀐 사이즈 폰트 사이즈는 아직 조정안됨(직접 기존이랑 찾아서 매칭 필요)
        title: "28px", //가장 큰 타이틀
        subTitle: "20px", // 서브 타이틀
        input: "14px", //입력
        body: "15px", // 본문 텍스트 1
        body2: "12px", // 본문 텍스트 2
        body3: "10px", // 본문 텍스트 3
        body4: "8px", // 본문 텍스트 4
        button: "11px", // 버튼
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
