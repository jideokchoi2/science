/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 밤하늘 계열 (배경)
        void: '#070B1C',
        deep: '#0D1330',
        panel: '#161E44',
        edge: '#2A356B',
        // 관측 도구 계열 (강조)
        beam: '#5FE3D6',   // 관측 강조 - 청록
        flare: '#FFC46B',  // 점수/보상 - 호박색
        rust: '#E4794C',   // 오답/화성 계열
        chalk: '#EAF0FF',  // 본문 텍스트
        dust: '#8E9BCB',   // 보조 텍스트
      },
      fontFamily: {
        display: ['Jua', 'Pretendard', 'system-ui', 'sans-serif'],
        body: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '0.25' }, '50%': { opacity: '1' } },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        driftUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        popIn: 'popIn 240ms ease-out both',
        driftUp: 'driftUp 320ms ease-out both',
      },
    },
  },
  plugins: [],
};
