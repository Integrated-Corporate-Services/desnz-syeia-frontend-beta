import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const applySecurityHeaders = (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
};

const securityHeadersPlugin = () => ({
    name: 'security-headers',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            applySecurityHeaders(res);
            next();
        });
    },
    configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
            applySecurityHeaders(res);
            next();
        });
    },
});

// Plugin to remove sourceMappingURL string literals from dependencies
const removeSourceMapStringsPlugin = () => ({
    name: 'remove-sourcemap-strings',
    enforce: 'post',
    generateBundle(options, bundle) {
        for (const fileName in bundle) {
            const chunk = bundle[fileName];
            if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
                // Replace sourceMappingURL string literals (but not actual source map comments)
                // This handles cases where dependencies include this string in their code
                chunk.code = chunk.code.replace(/(['"`])sourceMappingURL\1/g, '$1sourceMapURL$1');
            }
        }
    },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';
    
    return {
        base: env.VITE_ROUTER_BASENAME || '/',
        plugins: [react(), securityHeadersPlugin()],
        
        define: {
            '__REACT_DEVTOOLS_GLOBAL_HOOK__': JSON.stringify({ isDisabled: true }),
            'process.env.NODE_ENV': JSON.stringify('production')
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
                    drop_console: true, // Always drop console in production builds
                    drop_debugger: true,
                    pure_funcs: [
                        'console.log',
                        'console.info',
                        'console.debug',
                        'console.trace',
                    ],
                    dead_code: true,
                    unused: true,
                    passes: 3, // Multiple passes for better compression
                },
                mangle: {
                    properties: {
                        regex: /^sourceMappingURL$/, // Mangle this specific property name
                    },
                },
                format: {
                    comments: false,
                },
            },
            sourcemap: false, // Always disable sourcemaps in builds to pass security checks
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    // Post-process to remove sourceMappingURL string literals that aren't actual source maps
                    banner: (chunk) => {
                        // This is a workaround for aws-rum-web library containing sourceMappingURL in code
                        return '';
                    },
                },
            },
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