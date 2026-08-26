import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' 로 두면 GitHub Pages의 프로젝트 페이지
// (https://아이디.github.io/저장소이름/) 에서도 경로 수정 없이 동작합니다.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist' },
});
