import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno para que estén disponibles en la configuración
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Esto permite que 'process.env.API_KEY' funcione en el navegador
      // reemplazándolo por el valor real durante el "build" de Vercel.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})