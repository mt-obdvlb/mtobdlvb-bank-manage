<template>
  <el-dialog v-model="visible" title="取款" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="取款金额" prop="amount">
        <el-input v-model="form.amount" placeholder="请输入取款金额" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入6位数字密码"
          show-password
          type="password"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const emit = defineEmits<{
  (e: 'commitWithdraw', payload: { amount: number; password: string }): void
  (e: 'close'): void
}>()

const visible = defineModel<boolean>('modelValue', { required: true })

// 表单数据
const form = reactive({
  amount: '',
  password: '',
})

// 表单验证规则
const rules = reactive<FormRules>({
  amount: [
    { required: true, message: '请输入取款金额', trigger: 'blur' },
    {
      pattern: /^([1-9][0-9]{0,9}|0)(\.[0-9]{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '密码必须是6位数字', trigger: 'blur' },
  ],
})

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 关闭对话框处理函数
const handleClose = () => {
  visible.value = false
  // 重置表单
  formRef.value?.resetFields()
  // 触发关闭事件
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 触发 commitWithdraw 事件，将密码和金额传递给父组件处理
      emit('commitWithdraw', {
        amount: +form.amount,
        password: form.password,
      })
      handleClose()
    }
  })
}
</script>
