<script setup>
import { ref } from 'vue'

const formData = ref({})
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
  <el-form :model="formData">
    <template v-for="item in props.formItem" :key="item.prop">
      <el-form-item :label="item.label" :prop="item.prop">
        <component
          v-model="formData[item.prop]"
          :is="isComponent(item.type)"
          :placeholder="item.placeholder"
        >
          <template v-if="item.type === 'select'">
            <el-option label="全部" value="0"></el-option>
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </template>
        </component>
      </el-form-item>
    </template>
  </el-form>
</template>

<style scoped lang="scss"></style>
