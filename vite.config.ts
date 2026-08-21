import { defineConfig } from 'vite'
// 如果是 React / Vue 再另外引入 plugin

export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/2025IECPkgPolarbear/' : '/',  //
    // plugins: [...]
  }
})