import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/syeia/',
    server: {
      host: true,
      port: 5173,
      open: true,
      proxy: {
        '/api': env.VITE_API_URL || 'http://localhost:3000/',
        '/auth': 'http://localhost:3000'
      }
    }
  };
});