import '@/styles/map.css'
import '@/styles/global.css'
import '@/styles/light.css'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

export const queryClient = new QueryClient()

const app = createApp(App)

app.use(ElementPlus)
app.use(VueQueryPlugin, { queryClient })
app.use(router)

app.mount('#app')
