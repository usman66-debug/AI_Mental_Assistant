<script setup>
import PageHead from '@/components/backend/PageHead.vue'
import TableSearch from '@/components/backend/TableSearch.vue'
import ArticalDialog from '@/components/backend/ArticalDialog.vue'
import { categoryTreeApi, articlePageApi } from '@/apis/admin'
import { onMounted, ref } from 'vue'

//定义弹窗是否显示的变量
const dialogVisible = ref(false)
const handleClose = () => {}
const formItem = ref([
  {
    label: '文章标题',
    prop: 'title',
    type: 'input',
    placeholder: '请输入文章标题',
  },
  {
    label: '分类菜单',
    prop: 'category',
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
const handleSearch = async (data) => {
  const queryData = {
    ...data,
    ...pagination.value,
  }
  const { records, total } = await articlePageApi(queryData)
  tableData.value = records
  //在编写过程中有时候会出现后端返回字段不包含records的情况，排查后发现重新登录就正常了，有可能是token过期了
  pagination.value.total = total
}
//当分页组件的currentPage属性改变时，调用handleChange函数（val为当前页码）
const handleChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
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
  handleSearch()
})
const handleSuccess = () => {
  handleSearch()
}
</script>

<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary" @click="dialogVisible = true">新增按钮</el-button>
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
            <el-button text type="primary">编辑</el-button>
            <el-button text v-if="scope.row.status === 0 || scope.row.status === 2" type="success"
              >发布</el-button
            >
            <el-button text v-if="scope.row.status === 1" type="warning">下线</el-button>
            <el-button text type="danger">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 25px"
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.size"
      @change="handleChange"
    />
    <ArticalDialog
      v-model:visible="dialogVisible"
      :categoryOptions="categoryOptions"
      @success="handleSuccess"
    />
  </div>
</template>
