<script setup>
import { useRouter } from 'vue-router'
import { useAdimnStore } from '@/stores/admin'

const adminStore = useAdimnStore()
const router = useRouter()
console.log(router)
const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const selectMenu = (key) => {
  console.log(key)
  router.push(`${router.options.routes[0].path}` + '/' + `${key.index}`)
}
</script>

<template>
  <el-aside :width="adminStore.iscollapse ? '64px' : '264px'">
    <el-menu
      default-active="2"
      class="side-menu"
      :collapse="adminStore.iscollapse"
      :collapse-transition="false"
    >
      <div class="brand">
        <div class="logo-wrapper">
          <el-image :src="iconUrl" alt="LOGO" style="width: 50px; height: 50px" />
        </div>
        <div class="info-card" v-show="!adminStore.iscollapse">
          <h1 class="brand-title">AI心理健康助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>
      <el-menu-item
        @click="selectMenu"
        v-for="item in router.options.routes[0].children"
        :key="item.path"
        :index="item.path"
      >
        <el-icon><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.side-menu {
  height: 100%;
  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #e5e7eb;
    .logo-wrapper {
      flex-shrink: 0;
      flex-grow: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      padding-right: 10px;
    }
    .info-card {
      flex-shrink: 1;
      overflow: hidden;
      .brand-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #1f2937;
      }
      .brand-subtitle {
        font-size: 14px;
        color: #6b7280;
      }
    }
  }
}
</style>
