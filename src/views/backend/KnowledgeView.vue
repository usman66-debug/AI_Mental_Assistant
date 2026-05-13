<script setup>
import PageHead from '@/components/backend/PageHead.vue'
import TableSearch from '@/components/backend/TableSearch.vue'

const formItem = [
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
    options: [
      {
        label: '分类1',
        value: '1',
      },
      {
        label: '分类2',
        value: '2',
      },
    ],
  },
]
</script>

<template>
  <div>
    <PageHead title="知识文章">
      <template #buttons>
        <el-button type="primary">新增按钮</el-button>
      </template>
    </PageHead>
    <TableSearch :formItem="formItem" />
  </div>
</template>
