import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.(js|jsx)$/,
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test-setup.js',
    },
});
