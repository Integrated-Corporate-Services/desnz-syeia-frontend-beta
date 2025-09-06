// vite.config.js
export default {
    base: '/',
    server: {
      host: true,
      port: 5173,
      open: true,
      proxy: {
        '/api': process.env.API_URL || 'http://localhost:3000/',
      }
    }
  };
  

  