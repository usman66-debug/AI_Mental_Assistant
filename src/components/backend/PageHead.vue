<script setup>
defineProps({
  title: {
    type: String,
    default: '页面标题',
  },
})
</script>

<template>
  <div class="page-head">
    <p class="page-title">{{ title }}</p>
    <div class="action-buttons">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  .page-title {
    font-size: 24px;
    color: #2d3748;
  }
}
</style>
