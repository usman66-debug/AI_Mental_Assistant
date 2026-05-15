<script setup>
import { ref, computed } from 'vue'

//父子通信
const props = defineProps({
  formItem: {
    type: Array,
    default: () => [],
  },
})
//由于原始数据没有col属性，所以需要在计算属性中添加col属性，监测屏幕宽度，根据宽度设置col属性
const formItemPlus = computed(() => {
  //不要直接修改原始数据，否则会导致数据不一致，而是选择拷贝一份数据，再修改拷贝的数据，最后返回拷贝的数据
  // 这样可以确保原始数据的完整性，同时也可以确保计算属性的响应式更新
  return props.formItem.map((item) => {
    return {
      ...item,
      col: { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 },
    }
  })
})
//子组件定义可触发的事件，父组件监听该事件，收到子组件传过来的数据后，调用父组件的函数
const emit = defineEmits(['search', 'reset'])
const handleSearch = () => {
  //触发查询事件
  emit('search', formData.value)
}
const handleReset = () => {
  if (!ruleFormRef.value) {
    return
  }
  ruleFormRef.value.resetFields()
  emit('search', formData.value)
}

//表单数据
const ruleFormRef = ref(null)
const formData = ref({})
const isComponent = (type) => {
  return {
    input: 'el-input',
    select: 'el-select',
  }[type]
}
</script>

<template>
  <el-form :model="formData" ref="ruleFormRef">
    <!-- 通过el组件实现响应式布局 -->
    <el-row :gutter="24">
      <template v-for="item in formItemPlus" :key="item.prop">
        <!-- 根据屏幕大小动态选择一行展示个数 -->
        <el-col v-bind="item.col">
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
        </el-col>
      </template>
    </el-row>
    <el-row :gutter="24">
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset(ruleFormRef.value)">重置</el-button>
    </el-row>
  </el-form>
</template>

<style scoped lang="scss"></style>
