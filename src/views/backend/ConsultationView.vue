<script setup>
import PageHead from '@/components/backend/PageHead.vue'
import { ref, onMounted } from 'vue'
import { getConsultationPageApi } from '@/apis/admin'

const tableData = ref([])
const pagination = ref({
  total: 0,
  pageSize: 10,
  currentPage: 1,
})

const viewSessionDetail = () => {}
const handleSearch = () => {
  getConsultationPageApi(pagination.value).then((res) => {
    const { records, total } = res
    tableData.value = records
    pagination.value.total = total
  })
}
const handleChange = (val) => {
  pagination.value.currentPage = val
  handleSearch()
}

onMounted(() => {
  handleSearch()
})
</script>

<template>
  <PageHead title="咨询记录" />
  <el-table :data="tableData" style="width: 100%">
    <el-table-column label="会话ID" width="100">
      <template #default="scope">
        <el-avatar>{{ scope.row.userNickname }}</el-avatar>
      </template>
    </el-table-column>
    <el-table-column label="情绪标签">
      <template #default="scope">
        <div class="session-title">{{ scope.row.sessionTitle }}</div>
        <div class="session-preview">{{ scope.row.lastMessageContent }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="messageCount" label="消息数" width="100" />
    <el-table-column prop="lastMessageTime" label="时间" width="100" />
    <el-table-column label="操作" width="100">
      <template #default="scope">
        <el-button type="primary" text @click="viewSessionDetail">详情</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    style="margin-top: 25px"
    layout="prev, pager, next"
    :total="pagination.total"
    :page-size="pagination.pageSize"
    @change="handleChange"
  />
</template>
