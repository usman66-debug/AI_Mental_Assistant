<script setup>
const props = defineProps({
  formItem: {
    type: Array,
    default: () => [],
  },
})

const isComponent = (type) => {
  return {
    input: 'el-input',
    select: 'el-select',
  }[type]
}
</script>

<template>
  <el-form>
    <template v-for="item in props.formItem" :key="item.prop">
      <el-form-item :label="item.label" :prop="item.prop">
        <component :is="isComponent(item.type)" :placeholder="item.placeholder"></component>
      </el-form-item>
    </template>
  </el-form>
</template>

<style scoped lang="scss"></style>
