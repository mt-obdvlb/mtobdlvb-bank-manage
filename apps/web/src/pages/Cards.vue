<template>
  <div class="cards-container">
    <!-- 整体card -->
    <el-card class="card-table">
      <!-- 上半部分 -->
      <template #header>
        <div class="card-header">
          <span>银行卡管理</span>
          <el-button type="primary" @click="handleAdd">添加银行卡</el-button>
        </div>
      </template>

      <!-- 自定义表格 -->
      <el-table v-loading="loading" :data="cardList" style="width: 100%">
        <!-- ID 列 -->
        <el-table-column label="ID" prop="id" width="120"></el-table-column>

        <!-- 卡名 -->
        <el-table-column label="卡名" prop="cardName" width="200">
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <!-- 上次操作时间 -->
        <el-table-column label="上次操作时间" prop="lastOperationTime" width="200">
          <template #default="scope">
            <i class="el-icon-time"></i>
            <span>{{ formatDate(scope.row.updateAt) }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" prop="status" width="200">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" min-width="380">
          <template #default="scope">
            <div class="action-buttons">
              <!-- 冻结按钮 - 只在状态为正常时显示 -->
              <el-button
                v-if="scope.row.status === 'active'"
                size="small"
                type="warning"
                @click="handleFreeze(scope.row)"
              >
                冻结
              </el-button>

              <!-- 解冻按钮 - 只在状态为冻结时显示 -->
              <el-button
                v-if="scope.row.status === 'frozen'"
                size="small"
                type="success"
                @click="handleUnfreeze(scope.row)"
              >
                解冻
              </el-button>

              <!-- 删除按钮 -->
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>

              <!-- 存款按钮 -->
              <el-button size="small" type="primary" @click="handleDeposit(scope.row)">
                存款
              </el-button>

              <!-- 取款按钮 -->
              <el-button size="small" type="primary" @click="handleWithdraw(scope.row)">
                取款
              </el-button>

              <!-- 查看余额按钮 -->
              <el-button size="small" @click="handleCheckBalance(scope.row)">查看余额</el-button>

              <!-- 查看流水按钮 -->
              <el-button size="small" @click="handleViewTransactions(scope.row)">
                查看流水
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页部分 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加银行卡对话框 -->
    <el-dialog v-model="dialogVisible" title="添加银行卡" width="500px" @close="handleDialogClose">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="卡名" prop="name">
          <el-input v-model="form.name" placeholder="请输入卡名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            show-password
            type="password"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 密码确认弹窗组件 -->
    <PasswordConfirmDialog v-model="passwordDialogVisible" @confirm="getConfirmDialogPassword" />

    <!-- 取款弹窗组件 -->
    <WithdrawDialog
      v-model="withdrawDialogVisible"
      @close="currentRowToWithdraw = null"
      @commitWithdraw="performWithdraw"
    />

    <!-- 流水弹窗组件 -->
    <TransactionHistoryDialog
      v-model="transactionDialogVisible"
      :row="currentRowToTransactions"
      @close="currentRowToTransactions = null"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AccountList, AccountListItem } from '@mtobdvlb/shared-types'
import {
  accountCreate,
  accountDelete,
  accountList,
  accountDeposit,
  accountBalance,
  accountWithdraw,
  accountFreeze,
  accountUnfreeze,
} from '@/services/account'
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog.vue'
import WithdrawDialog from '@/components/WithdrawDialog.vue'
import TransactionHistoryDialog from '@/components/TransactionHistoryDialog.vue'

//流水弹窗组件
const transactionDialogVisible = ref(false)

// 取款弹窗组件
const withdrawDialogVisible = ref(false)

// PasswordConfirmDialog组件传回的密码
const confirmDialogPassword = ref('')

// 添加这一行来保存当前要删除的行
const currentRowToDelete = ref<AccountListItem | null>(null)

// 添加这一行来保存当前要取款的行
const currentRowToWithdraw = ref<AccountListItem | null>(null)

// 添加这一行来保存当前要冻结的行
const currentRowToFreeze = ref<AccountListItem | null>(null)

// 添加这一行来保存当前要解冻的行
const currentRowToUnfreeze = ref<AccountListItem | null>(null)

// 添加这一行来保存当前要查询流水的行
const currentRowToTransactions = ref<AccountListItem | null>(null)

//确认删除进入密码确认弹窗
const getConfirmDialogPassword = (data: string) => {
  confirmDialogPassword.value = data
  // 直接执行删除操作
  if (currentRowToDelete.value) {
    performDelete()
    currentRowToDelete.value = null
  }
  // 进入查询流水弹窗
  if (currentRowToTransactions.value) {
    currentRowToTransactions.value = null
  }
  // 进入冻结弹窗
  if (currentRowToFreeze.value) {
    performFreeze()
    currentRowToFreeze.value = null
  }
  // 进入解冻弹窗
  if (currentRowToUnfreeze.value) {
    performUnfreeze()
    currentRowToUnfreeze.value = null
  }
}

// 表格数据
const cardList = ref<AccountList>()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const passwordDialogVisible = ref(false)
// 编辑表单数据
const form = ref({
  name: '',
  password: '',
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入卡名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '密码必须是6位数字', trigger: 'blur' },
  ],
}

// 表单引用
const formRef = ref()

// 组件挂载时获取数据
onMounted(() => {
  getCardList()
})
// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 获取卡片列表
const getCardList = async () => {
  loading.value = true
  const res = await accountList({ page: currentPage.value, pageSize: pageSize.value })
  cardList.value = res.data?.list
  total.value = res.data?.total || 0
  loading.value = false
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res = await accountCreate(form.value)
        if (res.code === 0) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          getCardList()
        } else {
          ElMessage.error(res.message || '添加失败，请稍后重试')
        }
      } catch (err) {
        console.error('添加银行卡失败:', err)
        ElMessage.error('网络错误，请稍后重试')
      }
    } else {
      ElMessage.error('请填写正确的表单信息')
    }
  })
}
// 处理添加按钮点击
const handleAdd = () => {
  dialogVisible.value = true
}

// 处理删除按钮点击
const handleDelete = (row: AccountListItem) => {
  ElMessageBox.confirm(`确定要删除银行卡 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 删除操作
      // 保存当前行
      currentRowToDelete.value = row
      // (弹出密码确认弹窗)
      passwordDialogVisible.value = true
    })
    .catch(() => {
      // 取消删除
    })
}

// 关闭对话框时重置表单
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// 分页相关处理函数
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getCardList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getCardList()
}

// 冻结银行卡
const handleFreeze = (row: AccountListItem) => {
  ElMessageBox.confirm(`确定要冻结银行卡 "${row.name}" 吗？`, '确认冻结', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 冻结操作
      currentRowToFreeze.value = row
      passwordDialogVisible.value = true
    })
    .catch(() => {
      // 取消操作
    })
}

// 解冻银行卡
const handleUnfreeze = (row: AccountListItem) => {
  ElMessageBox.confirm(`确定要解冻银行卡 "${row.name}" 吗？`, '确认解冻', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 解冻操作
      currentRowToUnfreeze.value = row
      passwordDialogVisible.value = true
    })
    .catch(() => {
      // 取消操作
    })
}

// 存款
const handleDeposit = (row: AccountListItem) => {
  ElMessageBox.prompt('请输入存款金额', '存款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^([1-9][0-9]{0,9}|0)(\.[0-9]{1,2})?$/,
    inputErrorMessage: '请输入正确的金额',
  })
    .then(async ({ value }) => {
      try {
        const res = await accountDeposit(row.id, { amount: +value })
        if (res.code === 0) {
          ElMessage.success(`成功存入 ${value} 元`)
        } else {
          ElMessage.error(res.message || '存款失败')
        }
      } catch (err) {
        console.error('存款失败:', err)
        ElMessage.error('网络错误，存款失败')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 取款
const handleWithdraw = (row: AccountListItem) => {
  currentRowToWithdraw.value = row
  withdrawDialogVisible.value = true
}

// 查看余额
const handleCheckBalance = async (row: AccountListItem) => {
  try {
    // 确保 id 存在
    const id = row.id
    if (!id) {
      ElMessage.error('无效的银行卡信息')
      return
    }
    const res = await accountBalance(id)
    // console.log(res)
    if (res.code === 0) {
      ElMessageBox.alert(`银行卡 "${row.name}" 的余额为: ${res.data?.amount}`, '账户余额', {
        confirmButtonText: '确定',
      })
    } else {
      ElMessage.error(res.message || '查询余额失败')
    }
  } catch (err) {
    console.error('查询余额失败:', err)
    ElMessage.error('网络错误，查询余额失败')
  }
}

//查看流水
const handleViewTransactions = (row: AccountListItem) => {
  currentRowToTransactions.value = row
  transactionDialogVisible.value = true
}
//真正删除逻辑
const performDelete = async () => {
  if (!currentRowToDelete.value) {
    ElMessage.error('当前操作项不存在')
    return
  }
  try {
    const res = await accountDelete(currentRowToDelete.value.id, {
      password: confirmDialogPassword.value,
    })
    console.log(res)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getCardList() // 重新加载数据
    } else {
      // ElMessage.error(res.message || '删除失败')
    }
  } catch (err) {
    console.error('删除银行卡失败:', err)
    ElMessage.error('网络错误，删除失败')
  }
}

// 真正取款逻辑
const performWithdraw = async (data: { amount: number; password: string }) => {
  if (!currentRowToWithdraw.value) {
    ElMessage.error('当前操作项不存在')
    return
  }
  try {
    const res = await accountWithdraw(currentRowToWithdraw.value.id, {
      amount: data.amount,
      password: data.password,
    })
    if (res.code === 0) {
      ElMessage.success(`成功取出 ${data.amount} 元`)
    } else {
      // ElMessage.error(res.message || '取款失败')
    }
  } catch (err) {
    console.error('取款失败:', err)
  }
}

//真正冻结逻辑
const performFreeze = async () => {
  if (!currentRowToFreeze.value) {
    ElMessage.error('当前操作项不存在')
    return
  }
  try {
    const res = await accountFreeze(currentRowToFreeze.value.id, {
      password: confirmDialogPassword.value,
    })
    if (res.code === 0) {
      ElMessage.success('冻结成功')
      getCardList() // 刷新数据
    } else {
      // ElMessage.error(res.message || '冻结失败')
    }
  } catch (err) {
    console.error('冻结失败:', err)
  }
}

// 真正解冻逻辑
const performUnfreeze = async () => {
  if (!currentRowToUnfreeze.value) {
    ElMessage.error('当前操作项不存在')
    return
  }
  try {
    const res = await accountUnfreeze(currentRowToUnfreeze.value.id, {
      password: confirmDialogPassword.value,
    })
    if (res.code === 0) {
      ElMessage.success('解冻成功')
      getCardList() // 刷新数据
    } else {
      // ElMessage.error(res.message || '冻结失败')
    }
  } catch (err) {
    console.error('冻结失败:', err)
  }
}
</script>

<style lang="scss" scoped>
.cards-container {
  padding: 20px;

  .card-table {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  // 操作按钮容器样式
  .action-buttons {
    display: flex;
    flex-wrap: nowrap;
    gap: 5px; // 按钮之间的间距

    // 确保按钮不会换行并且尺寸较小
    :deep(.el-button) {
      padding: 5px 8px;
      font-size: 12px;
      min-width: auto;
    }
  }
}
</style>
