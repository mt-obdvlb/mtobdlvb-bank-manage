import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserGet } from '@mtobdvlb/shared-types'

export type UserState = UserGet

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserState>({ id: '', username: '', email: '', phone: '' })
    const setUser = (user: UserState) => {
      userInfo.value = user
    }
    const clearUser = () => {
      userInfo.value = { id: '', username: '', email: '', phone: '' }
    }
    return { userInfo, clearUser, setUser }
  },
  { persist: true }
)
