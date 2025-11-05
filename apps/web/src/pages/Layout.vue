<!-- Layout.vue -->
<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
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
  .el-divider {
    margin: 0;
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
