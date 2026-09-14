import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

async function loadExpressPlugin(): Promise<Plugin | null> {
  if (process.env.NODE_ENV === 'production') return null;
  const { app } = await import('./server/app.ts');
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(async ({ command }) => {
  const plugins: any[] = [react(), tailwindcss()];
  if (command === 'serve') {
    const apiPlugin = await loadExpressPlugin();
    if (apiPlugin) plugins.push(apiPlugin);
  }

  return {
    base: '/omniwork/',
    plugins,
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
