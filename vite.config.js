import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true,
    port: mode === 'staging' ? 8082 : 8081,
    strictPort: true, // 포트 꼬임 방지 (8081/8082가 아니면 차라리 에러를 띄움)
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    watch: {
      usePolling: true, // Mac OS 환경에서 파일 변경 이벤트를 100% 감지하도록 강제
      interval: 100,
    },
    hmr: {
      overlay: true,
    },
    proxy: {
      '/google-news-rss': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-news-rss/, ''),
      }
    }
  },
}))
