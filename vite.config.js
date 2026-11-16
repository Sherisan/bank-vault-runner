import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // the API submodule is .NET; building it must not crash the dev server's file watcher
  server: { watch: { ignored: ['**/GameEngineAPI/**'] } },
  optimizeDeps: { entries: ['index.html'] },
});
