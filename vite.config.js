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
    host: true,
    allowedHosts: true,
    port: mode === 'staging' ? 8082 : 8081,
    strictPort: true, // 포트 꼬임 방지 (8081/8082가 아니면 차라리 에러를 띄움)
    watch: process.env.VITE_USE_POLLING === 'true'
      ? { usePolling: true, interval: 100 }
      : undefined,
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
  preview: {
    allowedHosts: true,
  },
}))
