<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadAvatarApi } from '@/apis/admin'
import { imgUrlAt } from '@/config/index'
import RichTextEditor from '@/components/backend/RichTextEditor.vue'

// 定义emit事件，用于向父组件传递状态变化
// 'update:visible' 是Vue v-model的标准事件名
const emit = defineEmits(['update:visible'])

// 定义props，接收父组件传递的visible状态
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  categoryOptions: {
    type: Array,
    default: () => [],
  },
})
const formData = ref({
  title: '',
  content: '',
  coverImage: '',
  categoryId: 1,
  summary: '',
  tags: '',
  id: '',
})
const commonTags = ref([
  '情绪管理',
  '焦虑',
  '抑郁',
  '压力',
  '睡眠',
  '冥想',
  '正念',
  '放松',
  '心理健康',
  '自我成长',
  '人际关系',
  '工作压力',
  '学习方法',
  '生活技巧',
])
const imgUrl = ref('')
const rules = ref({
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
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
// 选择图片后会传入一个file属性
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('请上传图片格式的文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过5MB')
    return false
  }
  return true
}
const handleUploadRequest = async ({ file }) => {
  //随机生成一个uid
  const businessId = crypto.randomUUID()
  const res = await uploadAvatarApi(file, businessId)
  imgUrl.value = imgUrlAt + res.filePath
  formData.value.coverImage = res.filePath
  console.log(res)
}
const clearImage = () => {
  imgUrl.value = ''
  formData.value.coverImage = ''
}
const handleContentChange = () => {}
const handleEditorCreated = () => {}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="编辑文章" width="50%">
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
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="文章摘要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          placeholder="请输入文章摘要（可选）"
          maxlength="1000"
          show-word-limit
          :rows="4"
        />
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="formData.tagArray"
          placeholder="请选择标签（可多选）"
          filterable
          clearable
          multiple
          allow-create
        >
          <el-option v-for="item in commonTags" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <!--因为我们要自定义上传规则，所以这里不需要使用prop，prop主要是拿来和表单校验联动的-->
      <el-form-item label="封面图片">
        <div>
          <!-- 后端接收图片的接口action、http-request上传请求的方法、accept指定上传的文件类型为图片格式 -->
          <el-upload
            class="avatar-uploader"
            action="#"
            :before-upload="beforeAvatarUpload"
            :http-request="handleUploadRequest"
            :show-file-list="false"
            accept="image/*"
          >
            <div v-if="!imgUrl" class="cover-placeholder">
              <p>点击上传封面图片</p>
            </div>
            <img v-else :src="imgUrl" alt="封面图片" class="cover-image" />
          </el-upload>
          <div v-if="imgUrl">
            <el-button type="danger" size="small" @click="clearImage">删除封面</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <RichTextEditor
          v-model="formData.content"
          placeholder="请输入文章内容，支持富文本格式\n\n可以使用加粗、斜体、列表、标题等格式来丰富文章内容"
          :maxCharCount="5000"
          @change="handleContentChange"
          @created="handleEditorCreated"
          min-height="400px"
        />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss">
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 120px;
  display: block;
}
</style>
