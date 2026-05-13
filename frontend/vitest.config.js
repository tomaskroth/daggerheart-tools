import { defineConfig } from 'vitest/config';
import { transformSync } from 'esbuild';

export default defineConfig({
    plugins: [
        {
            name: 'transform-js-jsx',
            enforce: 'pre',
            transform(code, id) {
                if (/\/src\/.*\.js$/.test(id) && !id.includes('node_modules')) {
                    const result = transformSync(code, {
                        loader: 'jsx',
                        jsx: 'automatic',
                    });
                    return { code: result.code, map: result.map };
                }
            },
        },
    ],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test-setup.js',
    },
});
