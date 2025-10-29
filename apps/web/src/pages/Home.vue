<template>
  <div class="container">
    <div class="card" @click="handleClick('profile')">
      <el-card shadow="hover">个人信息主页</el-card>
    </div>
    <div class="card" @click="handleClick('cards')">
      <el-card shadow="hover">银行卡管理</el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const handleClick = (params: string) => {
  console.log(params)
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 20px;
  width: 100%;
}

.card {
  user-select: none;
  flex: 1;
  margin: 0 15px;
  height: 90%;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0; /* 完全移除右边距 */
  }
  .el-card {
    height: 100%;
  }
}
</style>
