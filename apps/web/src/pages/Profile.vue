<template>
  <div class="profile-container">
    <!-- 个人信息 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="editProfile">编辑信息</el-button>
        </div>
      </template>

      <div class="profile-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="avatar-section">
              <el-avatar :size="120" :src="defaultAvatar" />
              <h3>{{ userInfo?.username }}</h3>
            </div>
          </el-col>

          <el-col :span="16" class="info-section">
            <el-descriptions :column="1" label-width="200px" border>
              <el-descriptions-item label="用户账号" width="250px">
                {{ userInfo?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱" width="250px">
                {{ userInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号" width="250px">
                {{ userInfo?.phone }}
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <el-divider />

        <h3>账户安全</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <div class="security-item">
                <i class="el-icon-lock"></i>
                <div>
                  <h4>登录密码</h4>
                  <p>定期更改密码有助于保护账户安全</p>
                </div>
                <el-button type="primary" link @click="changePassword">修改</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑个人信息" width="500px">
      <el-form ref="formRef" :model="editForm" label-width="80px">
        <el-form-item label="用户账号">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" :rules="emailRules">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :rules="phoneRules">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原始密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原始密码"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>

      <!-- 修改密码对话框的底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePassword">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import defaultAvatar from '@/assets/avatar.jpg'
import type { FormItemRule } from 'element-plus'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { userUpdate, userLogout } from '@/services/user'
import { useRouter } from 'vue-router'
const router = useRouter()
const userStore = useUserStore()
// 用户信息数据
const userInfo = ref(userStore.userInfo)

// 编辑表单相关
const dialogVisible = ref(false)
const editForm = ref({ ...userInfo.value })
const formRef = ref()

// 邮箱校验规则
const emailRules = [
  {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
  },
  {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: '请输入正确的邮箱格式',
    trigger: 'blur',
  },
]

// 手机号校验规则
const phoneRules = [
  {
    required: true,
    message: '请输入手机号',
    trigger: 'blur',
  },
  {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号格式',
    trigger: 'blur',
  },
]

// 编辑信息
const editProfile = () => {
  editForm.value = { ...userInfo.value }
  dialogVisible.value = true
}

// 保存信息
const saveProfile = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res = await userUpdate(editForm.value)
        if (res.code === 0) {
          ElMessage.success('更新成功')
          if (userInfo.value) {
            userInfo.value = {
              ...userInfo.value,
              email: editForm.value.email,
              phone: editForm.value.phone,
            }
          }
          userStore.setUser(userInfo.value)
        } else {
          ElMessage.error(res?.message || '更新失败')
        }
      } catch (err) {
        console.error('更新用户信息失败:', err)
        ElMessage.error('请求失败，请稍后重试')
      } finally {
        dialogVisible.value = false
      }
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}

// 修改密码
// 密码表单相关

const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  password: '',
  confirmPassword: '',
})

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原始密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20位之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20位之间', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{6,20}$/,
      message: '密码必须包含大小写字母、数字和特殊符号(@$!%*?&)',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (
        _rule: FormItemRule,
        value: string,
        callback: (error?: string | Error) => void
      ) => {
        if (value !== passwordForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    } as FormItemRule,
  ],
}

// 修改密码打开弹窗函数
const changePassword = () => {
  // 重置表单
  passwordForm.value = {
    oldPassword: '',
    password: '',
    confirmPassword: '',
  }
  passwordDialogVisible.value = true
}

// 保存密码修改
const savePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 调用修改密码的API
        const { password, confirmPassword } = passwordForm.value
        const res1 = await userUpdate({
          password,
          confirmPassword,
          phone: userInfo.value?.phone,
          email: userInfo.value?.email,
        })
        if (res1.code === 0) {
          ElMessage.success('密码修改成功')
          // 密码修改成功 退出登录
          const res2 = await userLogout()
          if (res2.code === 0) {
            userStore.clearUser()
            localStorage.removeItem('user')
            // 跳转到登录页
            router.push('/login')
          }
          ElMessage.success('已退出登录')
        }
      } catch (err) {
        console.error('修改密码失败:', err)
        if (err instanceof Error) {
          ElMessage.error(err.message)
        } else {
          ElMessage.error('密码修改失败')
        }
      }
    } else {
      ElMessage.error('请检查输入信息')
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;

  .profile-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .profile-content {
      .info-section {
        display: flex;
        align-items: center;
        justify-content: center;

        .info-content {
          width: 100%;
        }
      }
      .avatar-section {
        text-align: center;
        padding: 20px 0;

        h3 {
          margin: 15px 0 5px;
          font-size: 20px;
        }

        p {
          color: #909399;
        }
      }

      .security-item {
        display: flex;
        align-items: center;
        gap: 15px;

        i {
          font-size: 24px;
          color: #409eff;
        }

        div {
          flex: 1;

          h4 {
            margin: 0 0 5px;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
