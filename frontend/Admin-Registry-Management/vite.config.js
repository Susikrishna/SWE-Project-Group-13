import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'registry_app',           // The Scope (Must be unique!)
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',     // Exposing the main component
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: { port: 5001, strictPort: true },
  preview: { port: 5001, strictPort: true },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})