<script lang="ts" setup>
import { ref } from 'vue'
import AuthLoginContent from '@/features/auth/components/AuthLoginContent.vue'
import AuthRegisterContent from '@/features/auth/components/AuthRegisterContent.vue'

const activeName = ref<'login' | 'register'>('login')
const to = (type: 'login' | 'register') => {
  activeName.value = type
}
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div class="h-100 w-150 bg-bg1 shadow-xl rounded-xl backdrop-blur-2xl">
      <el-tabs v-model="activeName" stretch>
        <el-tab-pane class="" label="登录" name="login">
          <AuthLoginContent :toRegister="() => to('register')" />
        </el-tab-pane>
        <el-tab-pane class="" label="注册" name="register">
          <AuthRegisterContent :toLogin="() => to('login')" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
