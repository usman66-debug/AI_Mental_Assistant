<script setup>
import { getAnalysisOverviewApi } from '@/apis/admin'
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

//统计图片的引入
// 在 JS 中引入 assets 本地图片：import.meta.url 表示当前文件的位置，
// new URL(图片路径, import.meta.url) 会以当前文件为参照找到图片，
// 并让 Vite 在打包时处理成浏览器可访问的真实路径，.href 则取出最终的地址字符串。
const iconUrl1 = new URL('@/assets/images/users.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/like.png', import.meta.url).href
const iconUrl3 = new URL('@/assets/images/comments.png', import.meta.url).href
const iconUrl4 = new URL('@/assets/images/smile.png', import.meta.url).href

const aiData = ref({})

//初始化图表
const initCharts = () => {
  initEmotionChart()
  initConsultationChart()
  initUserActivityChart()
}
//情绪趋势
let emotionChart = null
const emotionChartRef = ref(null)
const initEmotionChart = () => {
  //判断当前DOM节点是否存在
  if (!emotionChartRef.value) {
    return
  }
  //销毁旧的图表，图表根据数据实时更新
  if (emotionChart) {
    emotionChart.dispose()
  }
  //创建echarts实例
  emotionChart = echarts.init(emotionChartRef.value)
  //获取情绪趋势的数据
  const trendData = aiData.value.emotionTrend
  //配置项
  const option = {
    // 图表标题
    title: {
      text: '情绪趋势分析',
      textStyle: {
        color: '#2d3436',
        fontSize: 16,
        fontWeight: '600',
      },
      left: 'center',
      top: 10,
    },
    // 图表提示框
    tooltip: {
      trigger: 'axis',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2d3436',
      },
    },
    legend: {
      data: ['平均情绪评分', '记录数量'],
      top: 40,
    },
    xAxis: {
      type: 'category',
      data: trendData.map((item) => item.date),
      axisLine: {
        lineStyle: {
          color: '#2d3436',
        },
      },
    },
    //左右两个y轴的配置
    yAxis: [
      {
        type: 'value',
        name: '情绪评分',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#2d3436',
          },
        },
      },
      {
        type: 'value',
        name: '记录数量',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#2d3436',
          },
        },
      },
    ],
    //折线图的配置
    series: [
      {
        name: '平均情绪评分',
        type: 'line',
        data: trendData.map((item) => item.avgMoodScore),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#faebaf',
        },
        itemStyle: {
          color: '#faebaf',
        },
      },
      {
        name: '记录数量',
        type: 'line',
        data: trendData.map((item) => item.recordCount),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#eeb5a3',
        },
        itemStyle: {
          color: '#eeb5a3',
        },
      },
    ],
    grid: {
      top: 80,
      bottom: '3%',
      left: '3%',
      right: '4%',
    },
  }
  //设置图表配置项
  emotionChart.setOption(option)
}

let consultationChart = null
const consultationChartRef = ref(null)
const initConsultationChart = () => {
  //判断当前DOM节点是否存在
  if (!consultationChartRef.value) {
    return
  }
  //销毁旧的图表，图表根据数据实时更新
  if (consultationChart) {
    consultationChart.dispose()
  }
  //创建echarts实例
  consultationChart = echarts.init(consultationChartRef.value)
  //获取咨询统计的数据
  const dailyTrend = aiData.value.consultationStats.dailyTrend
  //配置项
  const option = {
    title: {
      text: '咨询活动统计',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#2d3436',
      },
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2d3436',
      },
    },
    legend: {
      data: ['会话数量', '参与用户数'],
      top: 40,
      textStyle: {
        color: '#636e72',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 80,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dailyTrend.map((item) => item.date),
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)',
        },
      },
      axisLabel: {
        color: '#636e72',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#636e72',
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.1)',
        },
      },
    },
    series: [
      {
        name: '会话数量',
        type: 'bar',
        data: dailyTrend.map((item) => item.sessionCount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#74b9ff' },
              { offset: 1, color: '#0984e3' },
            ],
          },
        },
        barWidth: '40%',
      },
      {
        name: '参与用户数',
        type: 'bar',
        data: dailyTrend.map((item) => item.userCount),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#fdcb6e' },
              { offset: 1, color: '#f39c12' },
            ],
          },
        },
        barWidth: '40%',
      },
    ],
  }
  //设置图表配置项
  consultationChart.setOption(option)
}

let userActivityChart = null
const userActivityChartRef = ref(null)
const initUserActivityChart = () => {
  //判断当前DOM节点是否存在
  if (!userActivityChartRef.value) {
    return
  }
  //销毁旧的图表，图表根据数据实时更新
  if (userActivityChart) {
    userActivityChart.dispose()
  }
  //创建echarts实例
  userActivityChart = echarts.init(userActivityChartRef.value)
  //获取用户活跃度趋势的数据
  const activityData = aiData.value.userActivity
  //配置项
  const option = {
    title: {
      text: '用户活跃度趋势',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#2d3436',
      },
      left: 'center',
      top: 10,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#fab1a0',
      borderWidth: 1,
      textStyle: {
        color: '#2d3436',
      },
    },
    legend: {
      data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
      top: 40,
      textStyle: {
        color: '#636e72',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: 80,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: activityData.map((item) => item.date),
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)',
        },
      },
      axisLabel: {
        color: '#636e72',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#636e72',
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.3)',
        },
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(244, 162, 97, 0.1)',
        },
      },
    },
    series: [
      {
        name: '活跃用户',
        type: 'line',
        data: activityData.map((item) => item.activeUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#a29bfe',
        },
        itemStyle: {
          color: '#a29bfe',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(162, 155, 254, 0.4)' },
              { offset: 1, color: 'rgba(162, 155, 254, 0.1)' },
            ],
          },
        },
      },
      {
        name: '新增用户',
        type: 'line',
        data: activityData.map((item) => item.newUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#fdcb6e',
        },
        itemStyle: {
          color: '#fdcb6e',
        },
      },
      {
        name: '日记用户',
        type: 'line',
        data: activityData.map((item) => item.diaryUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#00b894',
        },
        itemStyle: {
          color: '#00b894',
        },
      },
      {
        name: '咨询用户',
        type: 'line',
        data: activityData.map((item) => item.consultationUsers),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#fab1a0',
        },
        itemStyle: {
          color: '#fab1a0',
        },
      },
    ],
  }
  //设置图表配置项
  userActivityChart.setOption(option)
}
onMounted(async () => {
  const res = await getAnalysisOverviewApi()
  console.log(res)
  aiData.value = res
  initCharts()
})
</script>

<template>
  <div class="dashboard-container">
    <el-row v-if="aiData.systemOverview" :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <div class="avatar users">
              <img :src="iconUrl1" style="width: 40px; height: 40px" />
            </div>
            <div class="info">
              <p class="title">总用户数</p>
              <p class="number">{{ aiData.systemOverview.totalUsers }}</p>
              <p class="subtitle-title">活跃用户：{{ aiData.systemOverview.activeUsers }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <div class="avatar like">
              <img :src="iconUrl2" style="width: 40px; height: 40px" />
            </div>
            <div class="info">
              <p class="title">情绪日志</p>
              <p class="number">{{ aiData.systemOverview.totalDiaries }}</p>
              <p class="subtitle-title">今日新增：{{ aiData.systemOverview.todayNewDiaries }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <div class="avatar comments">
              <img :src="iconUrl3" style="width: 40px; height: 40px" />
            </div>
            <div class="info">
              <p class="title">咨询会话</p>
              <p class="number">{{ aiData.systemOverview.totalSessions }}</p>
              <p class="subtitle-title">今日新增：{{ aiData.systemOverview.todayNewSessions }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <div class="avatar smile">
              <img :src="iconUrl4" style="width: 40px; height: 40px" />
            </div>
            <div class="info">
              <p class="title">平均情绪</p>
              <p class="number">{{ aiData.systemOverview.avgMoodScore }}/10</p>
              <p class="subtitle-title">情绪健康指数</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px" :gutter="20">
      <el-col :span="12">
        <el-card style="width: 100%">
          <template #header>
            <div class="card-header">情绪趋势分析</div>
          </template>
          <div class="chart-content">
            <div ref="emotionChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="width: 100%">
          <template #header>
            <div class="card-header">咨询会话统计</div>
          </template>
          <div class="chart-content">
            <div v-if="aiData.consultationStats" class="consultation-stats">
              <div class="stat-item">
                <div class="stat-label">总会话数</div>
                <div class="stat-value">{{ aiData.consultationStats.totalSessions }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均时长</div>
                <div class="stat-value">{{ aiData.consultationStats.avgDurationMinutes }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ aiData.systemOverview.activeUsers }}</div>
              </div>
            </div>
            <div ref="consultationChartRef" style="width: 100%; height: 260px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px">
      <el-card style="width: 100%">
        <template #header>
          <div class="card-header">用户活跃度趋势</div>
        </template>
        <div class="chart-content">
          <div ref="userActivityChartRef" style="width: 100%; height: 300px"></div>
        </div>
      </el-card>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  .card-content {
    display: flex;
    align-items: center;
    .avatar {
      margin-right: 12px;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      &.users {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      &.like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      &.comments {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
      &.smile {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
    .info {
      .title {
        font-size: 14px;
        color: #7f8c8d;
        margin-bottom: 4px;
      }
      .value {
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 4px;
      }
      .subtitle-title {
        font-size: 12px;
        color: #95a5a6;
      }
    }
  }
  .chart-content {
    padding: 20px;
    height: 300px;
    position: relative;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }

    .consultation-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }
      }
    }
  }
}
</style>
