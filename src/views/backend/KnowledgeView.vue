<script setup>
import PageHead from '@/components/backend/PageHead.vue'
import TableSearch from '@/components/backend/TableSearch.vue'
import { categoryTreeApi, articlePageApi } from '@/apis/admin'
import { onMounted, ref } from 'vue'

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
})

const handleSearch = (data) => {
  console.log(data)
}
</script>

<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary">新增按钮</el-button>
      </template>
    </PageHead>
    <!-- 监听子组件同名事件search，收到子组件传过来的数据后，调用handleSearch函数 -->
    <TableSearch :formItem="formItem" @search="handleSearch" />
  </div>
</template>
