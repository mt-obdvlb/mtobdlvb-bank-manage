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
        <el-table-column prop="id" label="ID" width="120"></el-table-column>

        <!-- 卡名 -->
        <el-table-column prop="cardName" label="卡名" width="200">
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <!-- 上次操作时间 -->
        <el-table-column prop="lastOperationTime" label="上次操作时间" width="200">
          <template #default="scope">
            <i class="el-icon-time"></i>
            <span>{{ formatDate(scope.row.updateAt) }}</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="200">
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
          :page-sizes="[10, 20, 50]"
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
            type="password"
            placeholder="请输入密码"
            show-password
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义银行卡数据类型
interface CardItem {
  id: string
  name: string
  updateAt: string
  status: string // active or frozen
}

// 表格数据
const cardList = ref<CardItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)

// 编辑表单数据
const form = ref({
  name: '',
  password: '',
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入卡名字', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20位之间', trigger: 'blur' },
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
const getCardList = () => {
  loading.value = true
  // 模拟 API 请求
  setTimeout(() => {
    // 模拟数据
    cardList.value = [
      {
        id: '1',
        name: '招商银行储蓄卡',
        updateAt: '2023-05-15T14:30:00',
        status: 'active',
      },
      {
        id: '2',
        name: '工商银行信用卡',
        updateAt: '2023-05-16T09:15:00',
        status: 'frozen',
      },
      {
        id: '3',
        name: '建设银行储蓄卡',
        updateAt: '2023-05-17T16:45:00',
        status: 'active',
      },
    ]
    total.value = cardList.value.length
    loading.value = false
  }, 500)
}

// 处理添加按钮点击
const handleAdd = () => {
  dialogVisible.value = true
}

// 处理编辑按钮点击
const handleEdit = (row: CardItem) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除按钮点击
const handleDelete = (row: CardItem) => {
  ElMessageBox.confirm(`确定要删除银行卡 "${row.name}" 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟删除操作
      ElMessage.success('删除成功')
      getCardList() // 重新加载数据
    })
    .catch(() => {
      // 取消删除
    })
}

// 提交表单
const submitForm = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟保存操作
      ElMessage.success('添加成功')
      dialogVisible.value = false
      getCardList() // 重新加载数据
    }
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
const handleFreeze = (row: CardItem) => {
  ElMessageBox.confirm(`确定要冻结银行卡 "${row.name}" 吗？`, '确认冻结', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟冻结操作
      ElMessage.success('冻结成功')
      // 实际项目中这里应该调用API更新状态
      getCardList()
    })
    .catch(() => {
      // 取消操作
    })
}

// 解冻银行卡
const handleUnfreeze = (row: CardItem) => {
  ElMessageBox.confirm(`确定要解冻银行卡 "${row.name}" 吗？`, '确认解冻', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟解冻操作
      ElMessage.success('解冻成功')
      // 实际项目中这里应该调用API更新状态
      getCardList()
    })
    .catch(() => {
      // 取消操作
    })
}

// 存款
const handleDeposit = (row: CardItem) => {
  ElMessageBox.prompt('请输入存款金额', '存款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^([1-9][0-9]{0,9}|0)(\.[0-9]{1,2})?$/,
    inputErrorMessage: '请输入正确的金额',
  })
    .then(({ value }) => {
      // 模拟存款操作
      ElMessage.success(`成功存入 ${value} 元`)
      // 实际项目中这里应该调用API进行存款操作
    })
    .catch(() => {
      // 取消操作
    })
}

// 取款
const handleWithdraw = (row: CardItem) => {
  ElMessageBox.prompt('请输入取款金额', '取款', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^([1-9][0-9]{0,9}|0)(\.[0-9]{1,2})?$/,
    inputErrorMessage: '请输入正确的金额',
  })
    .then(({ value }) => {
      // 模拟取款操作
      ElMessage.success(`成功取出 ${value} 元`)
      // 实际项目中这里应该调用API进行取款操作
    })
    .catch(() => {
      // 取消操作
    })
}

// 查看余额
const handleCheckBalance = (row: CardItem) => {
  // 模拟查看余额操作
  ElMessageBox.alert(`银行卡 "${row.name}" 的余额为: ￥10,000.00`, '账户余额', {
    confirmButtonText: '确定',
  })
}

// 查看流水
const handleViewTransactions = (row: CardItem) => {
  // 跳转到交易流水页面或者打开对话框显示流水记录
  ElMessage.info(`查看 "${row.name}" 的交易流水`)
  // 实际项目中这里可以跳转到交易流水页面
  // 或者打开一个新的对话框显示详细流水
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
