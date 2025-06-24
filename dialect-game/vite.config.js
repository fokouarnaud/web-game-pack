var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/// <reference types="vitest" />
import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig(function (_a) {
    var command = _a.command, mode = _a.mode;
    // Load environment variables
    var env = loadEnv(mode, process.cwd(), '');
    var isAnalyze = env.ANALYZE === 'true';
    var isEnhanced = mode === 'enhanced';
    console.log("\uD83D\uDE80 Vite Config - Mode: ".concat(mode).concat(isEnhanced ? ' (Enhanced UI)' : ''));
    return {
        plugins: __spreadArray([
            react()
        ], (isAnalyze ? [
            visualizer({
                filename: 'dist/bundle-analysis.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            })
        ] : []), true),
        build: {
            rollupOptions: {
                input: __assign({ main: path.resolve(__dirname, 'index.html') }, (isEnhanced && {
                    enhanced: path.resolve(__dirname, 'enhanced.html')
                })),
                output: {
                    manualChunks: __assign({ vendor: ['react', 'react-dom'], ui: [
                            '@radix-ui/react-slot',
                            '@radix-ui/react-progress',
                            '@radix-ui/react-tabs',
                            'class-variance-authority',
                            'tailwind-merge'
                        ], icons: ['lucide-react'], utils: ['clsx'] }, (isEnhanced && {
                        enhanced: [
                            './src/components/ui/enhanced-button',
                            './src/components/ui/enhanced-card',
                            './src/components/ui/toast',
                            './src/components/ui/onboarding'
                        ]
                    })),
                    chunkFileNames: function (chunkInfo) {
                        var _a;
                        var facadeModuleId = chunkInfo.facadeModuleId ?
                            (_a = chunkInfo.facadeModuleId.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.tsx', '').replace('.ts', '') :
                            'chunk';
                        return "assets/js/[name]-".concat(facadeModuleId, "-[hash].js");
                    },
                    assetFileNames: function (assetInfo) {
                        var _a;
                        var info = ((_a = assetInfo.name) === null || _a === void 0 ? void 0 : _a.split('.')) || [];
                        var ext = info[info.length - 1];
                        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
                            return "assets/images/[name]-[hash][extname]";
                        }
                        if (/css/i.test(ext || '')) {
                            return "assets/css/[name]-[hash][extname]";
                        }
                        return "assets/[name]-[hash][extname]";
                    },
                },
            },
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: command === 'build' && !isEnhanced,
                    drop_debugger: true,
                    pure_funcs: ['console.debug', 'console.trace'],
                },
                mangle: {
                    safari10: true,
                },
            },
            target: 'esnext',
            sourcemap: command === 'serve' || isEnhanced,
        },
        server: {
            port: 5174,
            host: true,
            open: isEnhanced ? '/enhanced.html' : true,
            hmr: {
                overlay: true,
            },
        },
        preview: {
            port: 4173,
            host: true,
            open: isEnhanced ? '/enhanced.html' : true,
        },
        // Updated path aliases to match tsconfig.json
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "@/components": path.resolve(__dirname, "./src/components"),
                "@/ui": path.resolve(__dirname, "./src/components/ui"),
                "@/lib": path.resolve(__dirname, "./src/lib"),
                "@/utils": path.resolve(__dirname, "./src/utils"),
                "@/services": path.resolve(__dirname, "./src/services"),
                "@/hooks": path.resolve(__dirname, "./src/hooks"),
                "@/stores": path.resolve(__dirname, "./src/stores"),
                "@/data": path.resolve(__dirname, "./src/data"),
                "components": path.resolve(__dirname, "./src/components"),
                "stores": path.resolve(__dirname, "./src/stores"),
                "data": path.resolve(__dirname, "./src/data"),
                "lib": path.resolve(__dirname, "./src/lib"),
                "src": path.resolve(__dirname, "./src")
            },
        },
        css: {
            devSourcemap: true,
            postcss: './postcss.config.js',
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'lucide-react',
                '@radix-ui/react-slot',
                '@radix-ui/react-progress',
                '@radix-ui/react-tabs',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
            ],
        },
        define: {
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
            __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
            __ENHANCED_MODE__: JSON.stringify(isEnhanced),
        },
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: [
                    'node_modules/',
                    'src/test/setup.ts',
                    '**/*.d.ts',
                    '**/*.config.*',
                    'dist/',
                ],
                thresholds: {
                    global: {
                        branches: 85,
                        functions: 90,
                        lines: 90,
                        statements: 90,
                    },
                    'src/services/**': {
                        branches: 95,
                        functions: 95,
                        lines: 95,
                        statements: 95,
                    },
                    'src/core/**': {
                        branches: 95,
                        functions: 95,
                        lines: 95,
                        statements: 95,
                    },
                },
            },
            include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
            testTimeout: 10000,
            hookTimeout: 10000,
        },
    };
});
