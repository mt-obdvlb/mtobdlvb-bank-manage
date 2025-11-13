<template>
  <div class="container1">
    <div class="card" @click="handleClick('profile')">
      <el-card shadow="hover" class="custom-card">
        <div class="card-content">
          <h3>个人信息主页</h3>
          <p>查看和管理您的个人资料</p>
        </div>
      </el-card>
    </div>
    <div class="card" @click="handleClick('cards')">
      <el-card shadow="hover" class="custom-card">
        <div class="card-content">
          <h3>银行卡管理</h3>
          <p>查看和管理您的银行卡信息</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const handleClick = (params: string) => {
  router.push(`/${params}`)
}
</script>

<style lang="scss" scoped>
.container1 {
  display: flex;
  justify-content: space-between;
  gap: 100px;
  align-items: center;
  height: 100%;
  padding: 25px 100px;
  width: 100%;
}

.card {
  :hover {
    cursor: pointer;
  }
  user-select: none;
  flex: 1;
  margin: 0 15px;
  height: 80%;
  &:first-child {
    margin-left: 20px;
  }
  &:last-child {
    margin-right: 20px;
  }
  .el-card {
    height: 100%;
  }
}

.custom-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;

  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }

  .card-content {
    text-align: center;

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
    }

    p {
      font-size: 16px;
      color: #909399;
      line-height: 1.5;
    }
  }
}

.card:hover .custom-card {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

:deep(.el-card.custom-card) {
  border: 1px solid #ebeef5;
}
</style>
