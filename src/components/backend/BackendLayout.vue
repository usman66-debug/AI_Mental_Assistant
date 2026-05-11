<script setup>
import SideBar from './SideBar.vue'
import NavBar from './NavBar.vue'
</script>

<template>
  <div class="backend-layout">
    <el-container class="container">
      <SideBar />
      <el-container>
        <el-header>
          <NavBar />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.backend-layout {
  height: 100vh;
  .container {
    height: 100%;
  }
}
</style>
