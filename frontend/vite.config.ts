import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

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
                // Replace ~@fontsource imports with a comment — the font is imported
                // explicitly in src/index.tsx so Vite can handle URL rewriting correctly.
                // Other ~ imports are resolved to absolute forward-slash paths.
                return content.replace(
                    /@import\s+['"]~([^'"]+?)['"]/g,
                    (_, p) => {
                        if (p.startsWith('@fontsource')) return '/* @fontsource handled in index.tsx */';
                        return `@import "${path.resolve('./node_modules', p).replace(/\\/g, '/')}"`;
                    },
                );
            },
        },
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // Dart Sass 1.x treats any .css file it resolves as a plain CSS @import
                // (passthrough) rather than inlining the content. Our tilde-fix plugin
                // strips the .css extension so Sass tries to find '700' without extension,
                // finds '700.css', and still passthroughs it. This importer intercepts
                // those absolute paths, appends .css, and returns the contents as 'css'
                // syntax so Sass inlines the @font-face rules instead.
                importer: {
                    canonicalize(url: string) {
                        if (!path.isAbsolute(url)) return null;
                        const withCss = url + '.css';
                        if (existsSync(withCss)) return pathToFileURL(withCss);
                        if (existsSync(url)) return pathToFileURL(url);
                        return null;
                    },
                    load(canonicalUrl: URL) {
                        const file = fileURLToPath(canonicalUrl);
                        return {
                            contents: readFileSync(file, 'utf-8'),
                            syntax: 'css' as const,
                        };
                    },
                },
            },
        },
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
    },
});
