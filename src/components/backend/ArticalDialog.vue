<script setup>
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadAvatarApi, createArticleApi } from '@/apis/admin'
import { imgUrlAt } from '@/config/index'
import RichTextEditor from '@/components/backend/RichTextEditor.vue'

// 定义emit事件，用于向父组件传递状态变化
// 'update:visible' 是Vue v-model的标准事件名
const emit = defineEmits(['update:visible', 'success'])

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
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    {
      max: 200,
      message: '文章标题最多200个字符',
      trigger: 'blur',
    },
  ],
  categoryId: [{ required: true, message: '请选择所属分类', trigger: 'change' }],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    {
      max: 5000,
      message: '文章内容最多5000个字符',
      trigger: 'blur',
    },
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
//预览文章
const btnPreview = ref(false)
//当编辑器中内容改变时，将内容赋值给formData.content属性
//传data.html内容是因为要传完整的带已编辑格式的文章内容
const handleContentChange = (data) => {
  formData.value.content = data.html
}
//在 RichTextEditor.vue 中，当编辑器初始化完成后，会触发 @onCreated 事件
//把编辑器实例保存到响应式变量中，方便当前组件其他方法随时使用它，如果不保存 editorInstance，那么 editor 只在这个函数里临时存在，函数执行完以后，其他地方就拿不到这个编辑器对象了
const editorInstance = ref(null)
const handleEditorCreated = (editor) => {
  editorInstance.value = editor
  //如果是编辑
  if (formData.value.content && editor) {
    nextTick(() => {
      editor.setHtml(formData.value.content)
    })
  }
}
const formRef = ref(null)
const loading = ref(false)
const handleSubmit = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
    }
    console.log(formData.value, '666')
    //因为表单存的是数组形式的tags，但是后端接口要求上传的tags是字符串形式，所以这里要将数组转换为字符串
    const submitData = {
      ...formData.value,
      tags: formData.value.tagArray.join(','),
    }
    delete submitData.tagArray

    createArticleApi(submitData).then(() => {
      loading.value = false
      ElMessage.success('发表文章成功')
      emit('success')
    })
  })
}
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
    <div v-if="btnPreview">
      <h3>文章预览</h3>
      <div v-html="formData.content"></div>
    </div>
    <template #footer>
      <el-button @click="btnPreview = !btnPreview">{{
        btnPreview ? '隐藏预览' : '显示预览'
      }}</el-button>
      <el-button type="primary" @click="handleClose">取消</el-button>
      <!-- 为了防止重复提交，添加loadingloading状态 -->
      <el-button type="primary" @click="handleSubmit" :loading="loading">创建</el-button>
    </template>
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
