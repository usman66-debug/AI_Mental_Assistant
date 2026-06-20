<script setup>
import PageHead from '@/components/backend/PageHead.vue'
import TableSearch from '@/components/backend/TableSearch.vue'
import ArticalDialog from '@/components/backend/ArticalDialog.vue'
import {
  categoryTreeApi,
  articlePageApi,
  getArticalDetailApi,
  publishArticleApi,
  deleteArticleApi,
} from '@/apis/admin'
import { onMounted, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

//定义弹窗是否显示的变量
const dialogVisible = ref(false)
const formItem = ref([
  {
    label: '文章标题',
    prop: 'title',
    type: 'input',
    placeholder: '请输入文章标题',
  },
  {
    label: '分类菜单',
    prop: 'categoryId',
    type: 'select',
    placeholder: '请选择分类菜单',
  },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      {
        label: '草稿',
        value: 0,
      },
      {
        label: '已发布',
        value: 1,
      },
      {
        label: '已下线',
        value: 2,
      },
    ],
  },
])
//定义分类菜单映射关系，比如{1：心理健康基础}，方便之后在搜索时使用分类菜单id来查询分类菜单名称
const categoryMap = ref({})
//定义分类菜单选项，比如[{label:'心理健康基础',value:'1'}],作为select组件的options属性
const categoryOptions = ref([])
const pagination = ref({
  currentPage: 1,
  size: 10,
  total: 0,
})
const tableData = ref([])
const searchForm = ref({})

const cleanParams = (params) => {
  const result = { ...params }
  Object.keys(result).forEach((key) => {
    if (result[key] === '' || result[key] === null || result[key] === undefined) {
      delete result[key]
    }
  })
  return result
}

const handleSearch = async (data = searchForm.value, resetPage = true) => {
  if (resetPage) {
    pagination.value.currentPage = 1
  }

  searchForm.value = { ...data }

  const queryData = {
    currentPage: pagination.value.currentPage,
    size: pagination.value.size,
    ...searchForm.value,
  }

  const finalParams = cleanParams(queryData)

  const { records, total } = await articlePageApi(finalParams)
  tableData.value = records
  pagination.value.total = total
}

const handleChange = (val) => {
  pagination.value.currentPage = val
  handleSearch(searchForm.value, false)
}
onMounted(async () => {
  const data = await categoryTreeApi()

  categoryOptions.value = data.map((item) => {
    categoryMap.value[item.id] = item.categoryName
    return {
      label: item.categoryName,
      value: item.id,
    }
  })
  formItem.value[1].options = categoryOptions.value
  handleSearch({}, true)
})
const handleSuccess = () => {
  dialogVisible.value = false
  handleSearch(searchForm.value, false)
}
//编辑文章
const currentArtical = ref(null)
const handleEdit = (row) => {
  if (!row.id) {
    //新增文章
    //得清除弹窗中的数据
    currentArtical.value = null
    dialogVisible.value = true
  } else {
    //编辑文章
    getArticalDetailApi(row.id).then((res) => {
      console.log(res, '编辑文章详情')
      currentArtical.value = res
      dialogVisible.value = true
    })
  }
}

const handlePublish = (row) => {
  ElMessageBox.confirm(`确认发布文章${row.title}吗？`, '确认', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(() => {
      publishArticleApi(row.id, { status: 1 }).then(() => {
        ElMessage.success('发布成功')
        handleSearch(searchForm.value, false)
      })
    })
    .catch(() => {
      ElMessage.info('已取消发布')
    })
}
const handleOffline = (row) => {
  ElMessageBox.confirm(`确认下线文章${row.title}吗？`, '确认', {
    confirmButtonText: '确认下线',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      publishArticleApi(row.id, { status: 2 }).then(() => {
        ElMessage.success('下线成功')
        handleSearch(searchForm.value, false)
      })
    })
    .catch(() => {
      ElMessage.info('已取消下线')
    })
}
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除文章${row.title}吗？`, '确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'danger',
  })
    .then(() => {
      deleteArticleApi(row.id).then(() => {
        ElMessage.success('删除成功')
        handleSearch(searchForm.value, false)
      })
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}
</script>

<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <!-- 空对象可以读取不存在的属性，只是得到 undefined,而null 根本不能读取属性，所以不能写@click="handleEdit(null) -->
        <el-button type="primary" @click="handleEdit({})">新增按钮</el-button>
      </template>
    </PageHead>
    <!-- 监听子组件同名事件search，收到子组件传过来的数据后，调用handleSearch函数 -->
    <TableSearch :formItem="formItem" @search="handleSearch" />
    <el-table :data="tableData" style="width: 100%; margin-top: 25px">
      <el-table-column label="文章标题" fixed="left" width="504">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon><timer /></el-icon>
            <span>{{ scope.row.title }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="200">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon><timer /></el-icon>
            <span>{{ categoryMap[scope.row.categoryId] }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="200" />
      <el-table-column prop="readCount" label="阅读量" width="200" />
      <el-table-column prop="createdAt" label="发布时间" width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-button text type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              @click="handlePublish(scope.row)"
              text
              v-if="scope.row.status === 0 || scope.row.status === 2"
              type="success"
              >发布</el-button
            >
            <el-button
              @click="handleOffline(scope.row)"
              text
              v-if="scope.row.status === 1"
              type="warning"
              >下线</el-button
            >
            <el-button @click="handleDelete(scope.row)" text type="danger">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 25px"
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.size"
      v-model:current-page="pagination.currentPage"
      @change="handleChange"
    />
    <ArticalDialog
      v-model:visible="dialogVisible"
      :categoryOptions="categoryOptions"
      :artical="currentArtical"
      @success="handleSuccess"
    />
  </div>
</template>
