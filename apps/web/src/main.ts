import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/style.css'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export const queryClient = new QueryClient()

const app = createApp(App)

app.use(ElementPlus)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
