<script lang="ts" setup>
import { useUserAuth } from '@/features/user/api.ts'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ElMessage } from 'element-plus'
import { userGet } from '@/services/user'
import { useUserStore } from '@/stores/user'
import { userLoginDTO } from '@mtobdvlb/shared-types'
import { useRouter } from 'vue-router'

const props = defineProps<{ toRegister: () => void }>()
const { login } = useUserAuth()

// useForm 绑定 zod 验证
const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(userLoginDTO),
  initialValues: {
    username: '',

    password: '',
  },
})

// 使用 useField 手动绑定表单字段
const {
  value: username,
  errorMessage: usernameError,
  handleBlur: usernameBlur,
} = useField<string>('username')
const {
  value: password,
  errorMessage: passwordError,
  handleBlur: passwordBlur,
} = useField<string>('password')

const router = useRouter()

// 登录提交
const onSubmit = handleSubmit(async (formValues) => {
  const { code } = await login(formValues)
  if (code) return
  ElMessage.success('登录成功')
  resetForm()
  const res = await userGet()
  const userStore = useUserStore()
  if (res?.data) {
    userStore.setUser(res.data)
  }
  await router.push('/')
})
</script>

<template>
  <el-form class="pt-15" @submit.prevent="onSubmit">
    <!-- 用户名 -->
    <el-form-item :error="usernameError" label="用户名" labelWidth="75px">
      <el-input
        v-model="username"
        class="mr-35 ml-15"
        clearable
        placeholder="请输入用户名"
        @blur="usernameBlur"
      />
      <template #error="{ error }">
        <div class="justify-center w-full flex items-center pl-15 pr-35">
          <span class="text-xs text-red-500">{{ error }}</span>
        </div>
      </template>
    </el-form-item>

    <!-- 密码 -->
    <el-form-item :error="passwordError" label="密码" labelWidth="75px">
      <el-input
        v-model="password"
        class="mr-35 ml-15"
        placeholder="请输入密码"
        show-password
        type="password"
        @blur="passwordBlur"
      />
      <template #error="{ error }">
        <div class="justify-center w-full flex items-center pl-15 pr-35">
          <span class="text-xs text-red-500">{{ error }}</span>
        </div>
      </template>
    </el-form-item>

    <!-- 操作按钮 -->
    <el-form-item>
      <div class="flex items-center justify-center mx-auto gap-2">
        <el-button nativeType="button" size="large" type="default" @click="props.toRegister">
          去注册
        </el-button>
        <el-button
          :disabled="!username || !password"
          nativeType="submit"
          size="large"
          type="primary"
        >
          登录
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>
