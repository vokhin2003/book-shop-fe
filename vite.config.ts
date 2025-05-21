import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      // visualizer({ open: true, filename: 'stats.html' }), // Thêm nếu cần phân tích bundle
    ],
    server: {
      port: parseInt(env.PORT) || 3000, // Linh hoạt với .env, mặc định 3000
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
        }
      }
    }
  }
})