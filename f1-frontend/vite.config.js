import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // "three/addons" yolunu node_modules/three/examples/jsm'ye yönlendirir
            'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm'),
        },
    },
});