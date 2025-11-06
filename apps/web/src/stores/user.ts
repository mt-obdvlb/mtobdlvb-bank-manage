import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserGet } from '@mtobdvlb/shared-types'

export type UserState = UserGet

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserState | null>({ id: '', username: '', email: '', phone: '' })
    const setUser = (user: UserState | null) => {
      userInfo.value = user
    }
    const clearUser = () => {
      userInfo.value = null
    }
    return { userInfo, clearUser, setUser }
  },
  { persist: true }
)
