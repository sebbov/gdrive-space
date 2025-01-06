import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';

export default {
    plugins: [
        checker({
            typescript: {
                tsconfigPath: 'tsconfig.app.json',
            },
        }),
        react(),
    ],
    server: {
        historyApiFallback: true,
    },
    define: {
        'process.env.VITE_APP_ENV': JSON.stringify(process.env.VITE_APP_ENV || 'prod'),
    },
    build: {
        rollupOptions: {
            external: process.env.VITE_APP_ENV === 'dev' ? [] : ['./fake-drive-data.ts'],
        },
    },
};
