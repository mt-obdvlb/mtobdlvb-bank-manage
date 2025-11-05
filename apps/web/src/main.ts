import '@/styles/map.css'
import '@/styles/global.css'
import '@/styles/light.css'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
export const queryClient = new QueryClient()

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(ElementPlus)
app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.use(pinia)

app.mount('#app')
