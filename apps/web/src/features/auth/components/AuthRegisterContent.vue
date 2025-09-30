<script lang="ts" setup>
import { useUserAuth } from '@/features/user/api.ts'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { userRegisterDTO } from '@mtobdvlb/shared-types' // 你需要在 shared-types 中定义注册 DTO
import { ElMessage } from 'element-plus'

const props = defineProps<{ toLogin: () => void }>()
const { register } = useUserAuth()

// useForm 绑定 zod 验证
const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(userRegisterDTO),
  initialValues: {
    username: '',
    password: '',
    confirmPassword: '',
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
const {
  value: confirmPassword,
  errorMessage: confirmPasswordError,
  handleBlur: confirmPasswordBlur,
} = useField<string>('confirmPassword')

// 注册提交
const onSubmit = handleSubmit(async (formValues) => {
  try {
    const { code } = await register(formValues)
    if (code) return
    ElMessage.success('注册成功')
    resetForm()
  } catch (err) {
    console.error('注册失败', err)
  }
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

    <!-- 确认密码 -->
    <el-form-item :error="confirmPasswordError" label="确认密码" labelWidth="75px">
      <el-input
        v-model="confirmPassword"
        class="mr-35 ml-15"
        placeholder="请再次输入密码"
        show-password
        type="password"
        @blur="confirmPasswordBlur"
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
        <el-button nativeType="button" size="large" type="default" @click="props.toLogin">
          去登录
        </el-button>
        <el-button
          :disabled="!username || !password || !confirmPassword"
          nativeType="submit"
          size="large"
          type="primary"
        >
          注册
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>
