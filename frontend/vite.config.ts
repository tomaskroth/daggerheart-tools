import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        {
            // react-kofi-button imports '@fontsource/quicksand/700.css' with a '~' prefix
            // (Webpack convention). Vite's Sass compiler passes through any @import ending
            // in '.css' unchanged, which breaks PostCSS. This plugin preprocesses the SCSS
            // file content: strips '~' and removes the '.css' extension so Sass treats the
            // import as a Sass file inclusion (inlined) rather than a CSS passthrough.
            name: 'fix-node-modules-scss-tilde',
            enforce: 'pre',
            load(id: string) {
                if (!id.includes('node_modules') || !id.endsWith('.scss')) return null;
                const content = readFileSync(id, 'utf-8');
                if (!content.includes('~')) return null;
                return content.replace(
                    /@import\s+['"]~([^'"]+?)(?:\.css)?['"]/g,
                    (_, p) => `@import "${path.resolve('./node_modules', p)}"`,
                );
            },
        },
    ],
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
    },
});
