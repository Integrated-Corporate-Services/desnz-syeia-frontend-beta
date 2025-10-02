import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    server: {
      host: true,
      port: 5173,
      open: true,
      proxy: {
        '/api': env.API_URL,
        '/auth': env.API_URL
      }
    }
  };
});