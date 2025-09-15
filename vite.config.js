// vite.config.js
export default {
    base: '/syeia/',
    server: {
      host: true,
      port: 5173,
      open: true,
      proxy: {
        '/api': process.env.API_URL || 'http://localhost:3000/',
        '/auth': 'http://localhost:3000'
      }
    }
  };
  

  