<template>
  <el-dialog v-model="visible" title="交易流水" width="700px" top="5vh" @close="handleClose">
    <!-- 简化筛选区域：仅保留交易类型筛选 -->
    <div class="transaction-filter">
      <!-- 交易类型筛选下拉框 -->
      <el-select v-model="transactionType" placeholder="交易类型" style="width: 150px" clearable>
        <el-option label="全部类型" value="" />
        <el-option label="存款" value="deposit" />
        <el-option label="取款" value="withdraw" />
      </el-select>
    </div>

    <!-- 交易流水表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="filteredTransactions"
      style="width: 100%; margin-top: 15px"
      height="400"
    >
      <!-- 流水号列 -->
      <el-table-column prop="id" label="流水号" width="180" />

      <!-- 交易金额列，根据交易类型显示正负号 -->
      <el-table-column prop="amount" label="交易金额" width="120">
        <template #default="scope">
          {{ formatAmount(scope.row.amount, scope.row.type) }}
        </template>
      </el-table-column>

      <!-- 交易类型列，使用标签形式展示 -->
      <el-table-column prop="type" label="交易类型" width="100">
        <template #default="scope">
          <el-tag :type="getTransactionTypeTag(scope.row.type)">
            {{ getTransactionTypeName(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 交易时间列，格式化显示 -->
      <el-table-column prop="createdAt" label="交易时间" width="200">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗底部操作按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { AccountListTransaction, AccountListItem } from '@mtobdvlb/shared-types'
import { accountListTransaction } from '@/services/account'

/**
 * 定义组件接收的属性
 * modelValue: 控制弹窗显示隐藏的双向绑定值
 * row: 当前查看流水的账户信息
 */
const props = defineProps<{
  modelValue: boolean
  row: AccountListItem | null
}>()

/**
 * 定义组件发出的事件
 * update:modelValue: 当弹窗显示状态改变时触发
 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 控制弹窗显示隐藏的状态
const visible = ref(false)

// 存储交易记录数据
const transactions = ref<AccountListTransaction>([])

// 控制加载状态显示
const loading = ref(false)

// 当前页码（无限滚动模式下表示已加载的页数）
const currentPage = ref(1)

// 每页数据条数
const pageSize = ref(20)

// 总数据条数
const total = ref(0)

// 是否还有更多数据可加载
const hasMore = ref(true)

// 表格引用，可用于操作表格组件
const tableRef = ref()

// 筛选条件：交易类型
const transactionType = ref<string>('')

// 计算属性：根据交易类型筛选后的交易记录
const filteredTransactions = computed(() => {
  if (!transactionType.value) {
    return transactions.value
  }
  return transactions.value.filter((transaction) => transaction.type === transactionType.value)
})

/**
 * 监听modelValue变化，同步visible状态
 * 当弹窗打开且有row时加载数据
 */
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal && props.row?.id) {
      resetAndLoadTransactions()
    }
  }
)

/**
 * 监听visible变化，同步更新modelValue
 */
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

/**
 * 重置并加载交易记录
 * 清空现有数据，恢复初始状态后重新加载第一页数据
 */
const resetAndLoadTransactions = () => {
  transactions.value = []
  currentPage.value = 1
  hasMore.value = true
  loadTransactions()
}

/**
 * 加载交易记录数据
 * append是否追加到现有数据后面（用于无限滚动）
 */
const loadTransactions = async (append = false) => {
  if (!props.row?.id || loading.value) return

  loading.value = true
  try {
    // 构建请求参数，不包含交易类型筛选条件
    const params = {
      id: props.row.id,
      page: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
    }

    const res = await accountListTransaction(props.row.id, params)

    if (res.code === 0) {
      const newTransactions = res.data?.list || []
      total.value = res.data?.total || 0

      if (append) {
        transactions.value = [...transactions.value, ...newTransactions]
      } else {
        transactions.value = newTransactions
      }

      hasMore.value = transactions.value.length < total.value
    } else {
      ElMessage.error(res.message || '获取交易记录失败')
    }
  } catch (error) {
    console.error('获取交易记录失败:', error)
    ElMessage.error('网络错误，获取交易记录失败')
  } finally {
    loading.value = false
  }
}

// 关闭弹窗时的清理工作
const handleClose = () => {
  visible.value = false
  transactions.value = []
  currentPage.value = 1
  total.value = 0
  hasMore.value = true
  transactionType.value = ''
}

// 根据交易类型获取对应的标签类型（Element Plus的tag类型）
const getTransactionTypeTag = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'success'
    case 'withdraw':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取交易类型的中文名称
const getTransactionTypeName = (type: string) => {
  switch (type) {
    case 'deposit':
      return '存款'
    case 'withdraw':
      return '取款'
    default:
      return type
  }
}

// 格式化金额显示，根据交易类型添加正负号
const formatAmount = (amount: number, type: string) => {
  return `${type === 'deposit' ? '+' : '-'}${formatNumber(amount)}`
}

// 格式化数字显示，只保留两位小数
const formatNumber = (num: number) => {
  return num.toFixed(2)
}

//  格式化日期时间显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>

<style lang="scss" scoped>
/* 筛选区域样式 */
.transaction-filter {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

/* 无限滚动触发区域样式 */
.infinite-scroll-container {
  text-align: center;
  padding: 15px 0;
  cursor: pointer;

  .loading-text {
    color: #909399;
    font-size: 14px;
  }

  /* 鼠标悬停时变色提示 */
  &:hover .loading-text {
    color: #409eff;
  }
}

/* 加载更多指示器样式 */
.loading-more {
  text-align: center;
  padding: 15px 0;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 无更多数据提示样式 */
.no-more-data {
  text-align: center;
  padding: 15px 0;
  color: #909399;
  font-size: 14px;
}

/* 弹窗底部按钮容器样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
