<!-- Layout.vue -->
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { userLogout } from '@/services/user'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 定义路由路径映射
const routeMap: Record<string, string> = {
  '/': '首页',
  '/profile': '个人信息主页',
  '/cards': '银行卡管理',
}

// 计算当前页面的面包屑路径
const breadcrumbItems = computed(() => {
  const items = [
    {
      path: '/',
      title: '首页',
    },
  ]

  // 如果不是首页，则添加当前页面
  if (route.path && route.path !== '/') {
    items.push({
      path: route.path,
      title: routeMap[route.path] || route.path.substring(1),
    })
  }

  return items
})

// 判断是否为当前页面
const isCurrentPage = (itemPath: string) => {
  return route.path === itemPath
}

// 退出登录功能
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 清除登录状态
    const res = await userLogout()
    if (res.code === 0) {
      userStore.clearUser()
      localStorage.removeItem('user')
      // 跳转到登录页
      router.push('/login')

      ElMessage.success('已退出登录')
    }
  } catch (error) {
    // 用户取消操作或出现错误
    if (error === 'cancel') return
    console.error('退出登录失败:', error)
  }
}
</script>

<template>
  <div class="layout-container">
    <div class="header">
      <div class="breadcrumb">
        <el-breadcrumb :separator-icon="ArrowRight" class="custom-breadcrumb">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbItems"
            :key="index"
            :to="{ path: item.path }"
          >
            <span :class="{ 'current-page': isCurrentPage(item.path) }">
              {{ item.title }}
            </span>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 添加退出按钮 -->
      <div class="logout-section">
        <el-button type="danger" link class="logout-btn" @click="handleLogout">退出登录</el-button>
      </div>

      <el-divider />
    </div>

    <div class="main">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-container {
  background-color: #f5f7fa; /* 浅灰色背景 */
  min-height: 100vh; /* 确保覆盖整个视口高度 */
}

.header {
  display: flex;
  flex-direction: column;
  height: 150px;
  padding: 0 50px;

  .breadcrumb {
    display: flex;
    align-items: center;
    padding-left: 100px;
    flex: 1;
  }

  .logout-section {
    position: absolute;
    right: 50px;
    top: 30px;
    z-index: 100;

    .logout-btn {
      font-size: 18px;
      padding: 8px 16px;
    }
  }

  .el-divider {
    margin: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

//面包屑
.custom-breadcrumb {
  font-size: 60px;
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      font-size: 60px;
      a {
        font-size: 60px;
      }
    }
    .el-breadcrumb__separator {
      margin: 0 30px;
      font-size: 60px;
    }
  }

  :deep(.el-icon) {
    font-size: 60px;
    width: 60px;
    height: 60px;
  }
}

// 当前页面高亮样式
.current-page {
  color: #409eff; // Element Plus 主题色
  font-weight: bold;
}

// 内容
.main {
  height: calc(100vh - 150px);
}
</style>
