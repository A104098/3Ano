import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1' //se tivesse posto true seria para qualquer ip acessar o servidor local, e dava para teles e assim
  }
})
