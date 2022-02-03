import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'


export default defineConfig(({ command, mode }) => {
  if (mode === 'production') {
    return {
      build: {
        // target: 'esnext',
        lib: {
          entry: path.resolve(__dirname, 'waterFall/WaterFall.tsx'),
          name: "Waterfall",
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
            }
          }
        },
      },
      plugins: [
        dts({
          insertTypesEntry: true,
          copyDtsFiles: false
        })
      ]
    }
  } else {
    return {
      plugins: [react()]
    }
  }
})
