import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        dashboardRemote: 'http://localhost:5010/assets/remoteEntry.js',
        adminRemote: 'http://localhost:5011/assets/remoteEntry.js',
        analyticsRemote: 'http://localhost:5012/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: { port: 5173 },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
