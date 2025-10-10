import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/frontend',
    server: {
      host: true,
      port: 5173,
      open: true,
      proxy: {
        '/backend/api': {
          target: env.API_URL,
          changeOrigin: true,
        },
        '/backend/auth': {
          target: env.API_URL,
          changeOrigin: true,
        }
      },
      allowedHosts: [
        "eip-dev-external-1040853835.eu-west-2.elb.amazonaws.com"
      ],
      fs: {
        strict: false
      },
      historyApiFallback: true
    }
  };
});
