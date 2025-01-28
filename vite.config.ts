import react from '@vitejs/plugin-react-swc'
import {defineConfig} from 'vite'
import {VitePWA} from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: 'Funds For Nothing',
                short_name: 'FFN',
                description: 'Funds for Nothing',
                theme_color: '#ffffff',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
})
