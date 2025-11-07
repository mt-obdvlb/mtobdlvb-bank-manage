<!-- src/components/PasswordConfirmDialog.vue -->
<template>
  <el-dialog v-model="visible" title="安全验证" width="400px">
    <el-form ref="formRef" :model="form" :rules="rules">
      <el-form-item prop="password">
        <el-input
          ref="passwordInputRef"
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button :loading="loading" type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', password: string): void
}>()

// 表单数据
const form = ref({
  password: '',
})

// 表单验证规则
const rules = {
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '密码必须是6位数字', trigger: 'blur' },
  ],
}

// 引用
const formRef = ref()
const passwordInputRef = ref()
const loading = ref(false)

// 控制可见性
const visible = ref(false)

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 下一帧自动聚焦到密码输入框
      nextTick(() => {
        setTimeout(() => {
          passwordInputRef.value?.focus()
        }, 100)
      })
    }
  }
)

// 监听visible变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    // 关闭时重置表单
    formRef.value?.resetFields()
  }
})

// 确认操作
const confirm = async () => {
  if (!formRef.value) return
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      emit('confirm', form.value.password)
      visible.value = false
    }
  } catch (error) {
    ElMessage.error('请检查输入信息')
    console.error(error)
  }
}

// 取消操作
const cancel = () => {
  visible.value = false
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
