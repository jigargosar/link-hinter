import { defineConfig } from 'wxt'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    srcDir: 'src',
    vite: () => ({
        plugins: [react(), tailwindcss()],
    }),
    manifest: {
        name: 'Link Hinter',
        description: 'Keyboard-driven link navigation with hint overlays',
        permissions: ['activeTab', 'storage', 'scripting'],
        icons: {
            16: '/icons/icon-16.png',
            32: '/icons/icon-32.png',
            48: '/icons/icon-48.png',
            128: '/icons/icon-128.png',
        },
    },
})
