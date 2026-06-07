<script setup>
import { onMounted, ref } from 'vue'
import { getRecommendList } from '@/apis/frontend'
import { imgUrlAt } from '@/config/index.js'
import { dayjs, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const iconUrl = new URL('@/assets/images/book.png', import.meta.url).href
const defaultCover = new URL('@/assets/images/dog.png', import.meta.url).href
//跳转逻辑
const loadToDetail = (id) => {
  router.push(`/knowledge/article/${id}`)
}

const handleConsultationClick = () => {
  if (localStorage.getItem('token')) {
    router.push('/consultation')
  } else {
    router.push('/auth/login')
    ElMessage.warning('请先登录')
  }
}
// 推荐列表
const recommendList = ref([])
//右侧内容
const pagination = ref({
  currentPage: 1,
  size: 10,
  total: 0,
})
const articleList = ref([])
const getPageList = async () => {
  const params = {
    sortField: 'publishedAt',
    sortDirection: 'desc',
    ...pagination.value,
  }
  try {
    const res = await getRecommendList(params)
    articleList.value = res.records
    pagination.value.total = res.total
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}
const getImage = (url) => {
  return url ? imgUrlAt + url : defaultCover
}
const handleChange = (val) => {
  pagination.value.currentPage = val
  getPageList()
}

onMounted(async () => {
  // 获取推荐列表
  const params = {
    sortField: 'readCount',
    sortDirection: 'desc',
    currentPage: 1,
    size: 5,
  }
  getPageList()
  try {
    const res = await getRecommendList(params)
    console.log(res)
    recommendList.value = res.records
  } catch (error) {
    console.error('获取推荐列表失败:', error)
  }
})
</script>

<template>
  <div class="knowledge-container">
    <div class="header-section">
      <div class="header-content">
        <el-image :src="iconUrl" alt="知识库图标" style="width: 60px; height: 60px" />
        <h1>心理健康知识库</h1>
      </div>
    </div>

    <!-- 有数据时显示正常内容 -->
    <template v-if="articleList?.length > 0">
      <div class="content">
        <!-- 左侧菜单 -->
        <div class="recommend-section">
          <div class="section-title">推荐阅读</div>
          <div class="recommend-list">
            <div
              v-for="item in recommendList"
              :key="item.id"
              class="recommend-item"
              @click="loadToDetail(item.id)"
            >
              <h4>{{ item.title }}</h4>
              <p class="read-count">
                <el-icon><Histogram /></el-icon>
                阅读量：{{ item.readCount }}
              </p>
            </div>
          </div>
        </div>
        <!-- 右侧内容 -->
        <div class="article-list">
          <div
            v-for="item in articleList"
            :key="item.id"
            class="article-item"
            @click="loadToDetail(item.id)"
          >
            <el-image
              style="width: 240px; height: 150px"
              :src="getImage(item.coverImage)"
              alt="文章封面"
            />
            <div class="info">
              <div class="title">
                <h3>{{ item.title }}</h3>
                <el-tag Plain type="primary">{{ item.categoryName }}</el-tag>
              </div>
              <div style="margin-top: 10px">
                <div class="flex-box">
                  <el-icon><Avatar /></el-icon>
                  <span>{{ item.authorName }}</span>
                </div>
                <div class="flex-box">
                  <el-icon><List /></el-icon>
                  <span>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</span>
                </div>
              </div>
              <div style="margin-top: 10px">
                <div class="flex-box">
                  <el-icon><Platform /></el-icon>
                  <span>观看人数：{{ item.readCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页 -->
      <el-pagination
        style="margin-top: 25px"
        layout="prev, pager, next"
        :total="pagination.total"
        :page-size="pagination.size"
        @change="handleChange"
        class="pagination-wrapper"
      />
    </template>

    <!-- 无数据时显示空状态 -->
    <template v-else>
      <div class="empty-state">
        <div class="empty-card">
          <div class="empty-icon">
            <el-icon><CoffeeCup /></el-icon>
          </div>
          <h2 class="empty-title">暂无知识文章</h2>
          <p class="empty-subtitle">知识库内容正在整理中，请稍后再来看看</p>
          <p class="empty-hint">你也可以先返回首页，或体验 AI 咨询功能</p>
          <div class="empty-actions">
            <el-button type="primary" @click="router.push('/')">返回首页</el-button>
            <el-button @click="handleConsultationClick">去 AI 咨询</el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
  .flex-box {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  .header-section {
    background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
    color: white;
    padding: 48px;
    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  .content {
    display: flex;
    gap: 20px;
    margin: 0 auto;
    width: 1200px;
    padding: 20px;
    .recommend-section {
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      padding: 15px;
      height: 400px;
      .section-title {
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .recommend-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        .recommend-item {
          border-left: 4px solid #f59e0b;
          padding-left: 10px;
          cursor: pointer;
          .read-count {
            margin-top: 15px;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
    .article-list {
      flex: 1;
      .article-item {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        padding: 15px;
        margin-bottom: 20px;
        display: flex;
        .info {
          margin-left: 20px;
          .title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        }
      }
    }
  }
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 30px;
  }
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    padding: 40px 20px;
  }
  .empty-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 60px 80px;
    text-align: center;
    max-width: 500px;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  }
  .empty-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e0f2fe 0%, #fce7f3 100%);
    border-radius: 50%;
    color: #8b5cf6;
    font-size: 48px;
  }
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }
  .empty-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
  }
  .empty-hint {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 30px;
  }
  .empty-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}
</style>
