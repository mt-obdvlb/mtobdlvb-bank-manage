<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.path)
</script>

<template>
  <div class="header">
    <div class="breadcrumb">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/' }">homepage</el-breadcrumb-item>
        <el-breadcrumb-item>promotion management</el-breadcrumb-item>
        <el-breadcrumb-item>promotion list</el-breadcrumb-item>
        <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-divider />
  </div>

  <div class="main">
    <RouterView></RouterView>
  </div>
</template>

<style lang="scss" scoped>
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
.el-breadcrumb {
  font-size: 20px; // 增大字体大小
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__separator {
      margin: 0 30px;
    }
  }
}

// 内容
.main {
  height: calc(100vh - 150px);
}
</style>
