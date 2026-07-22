import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const securityHeadersPlugin = () => ({
    name: 'security-headers',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
            next();
        });
    },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';
    
    return {
        base: env.VITE_ROUTER_BASENAME || '/',
        plugins: [react(), securityHeadersPlugin()],
        
        define: {
            ...(isProduction && {
                '__REACT_DEVTOOLS_GLOBAL_HOOK__': JSON.stringify({ isDisabled: true }),
                'process.env.NODE_ENV': JSON.stringify('production')
            })
        },
        
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'mixed-decls'],
                }
            }
        },
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: isProduction,
                    drop_debugger: true,
                    pure_funcs: isProduction ? [
                        'console.log',
                        'console.info',
                        'console.debug',
                        'console.trace',
                    ] : [],
                    dead_code: true,
                    unused: true,
                },
                mangle: {
                    reserved: [],
                },
                format: {
                    comments: false,
                },
            },
            sourcemap: isProduction ? false : true,
            chunkSizeWarningLimit: 1000,
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/test/setup.ts',
        },
        server: {
            host: true,
            port: 5173,
            open: true,
            proxy: {
                '/csrf-token': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/invites': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/api': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/auth': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/preferences': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/withdraw': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
                '/cookies/catalog': {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
            },
            allowedHosts: [
                "dev.syeia.energysecurity.gov.uk",
                "staging.syeia.energysecurity.gov.uk",
            ],
        },
    };
});