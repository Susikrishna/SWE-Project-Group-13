import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'registry_app',          // Unique scope name for this remote
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',    // Exposed entry — no BrowserRouter inside!
      },
      // Singletons prevent duplicate React/Router instances across MFE boundaries.
      // Both the host shell and this remote share the SAME react-router context.
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
      },
    }),
  ],
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});