<script setup>
const handleCommand = (command) => {
  if (command === 'logout') {
    console.log('退出登录')
  }
}
</script>

<template>
  <div class="nav-bar">
    <div class="flex-box">
      <el-button
        ><el-icon><Expand /></el-icon
      ></el-button>
      <p class="page-title">导航栏</p>
    </div>
    <el-dropdown @command="handleCommand">
      <div class="flex-box">
        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <p class="user-name">
          用户中心<el-icon><arrow-down /></el-icon>
        </p>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.nav-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;
  .flex-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .page-title {
    margin-left: 20px;
    font-size: 26px;
    font-weight: bold;
    color: #1f2937;
  }
}
</style>
