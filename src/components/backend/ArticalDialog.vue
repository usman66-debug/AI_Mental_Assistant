<script setup>
import { ref, computed } from 'vue'

// 定义emit事件，用于向父组件传递状态变化
// 'update:visible' 是Vue v-model的标准事件名
const emit = defineEmits(['update:visible'])

// 定义props，接收父组件传递的visible状态
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const formData = ref({
  title: '',
  content: '',
  coverImage: '',
  categoryId: 0,
  summary: '',
  tags: '',
  id: '',
})
const rules = ref({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 200, message: '文章标题长度必须在2到200个字符之间', trigger: 'blur' },
  ],
})

/**
 * 使用computed实现v-model双向绑定的桥梁
 *
 * 工作原理：
 * 1. 父组件使用 <ArticalDialog v-model:visible="dialogVisible" />
 * 2. 这等价于：<ArticalDialog :visible="dialogVisible" @update:visible="(val) => dialogVisible = val" />
 * 3. get() 返回 props.visible，用于显示弹窗状态
 * 4. set(val) 触发 emit('update:visible', val)，通知父组件更新状态
 *
 * 关闭弹窗流程：
 * 1. 用户点击el-dialog右上角的×
 * 2. el-dialog内部修改v-model绑定的值为false
 * 3. 触发set(false)，执行emit('update:visible', false)
 * 4. 父组件通过v-model语法糖自动更新dialogVisible为false
 */
const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emit('update:visible', val)
  },
})

// 预留的关闭处理函数，可用于在弹窗关闭前做一些处理（如表单验证）
// 使用方式：在el-dialog上添加 @close="handleClose"
const handleClose = () => {}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="编辑文章" width="500">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入文章标题"
          maxlength="200"
          show-word-limit
          clearable
        />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
