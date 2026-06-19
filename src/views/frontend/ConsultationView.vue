<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { startSession, getSessionList, deleteSession, getSessionDetail } from '@/apis/frontend'
import MarkdownRenderer from '@/views/frontend/MarkdownRenderer.vue'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
const logoIconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const loveIconUrl = new URL('@/assets/images/like.png', import.meta.url).href
const usersIconUrl = new URL('@/assets/images/users.png', import.meta.url).href
const chatStore = useChatStore()
const {
  currentSession,
  sessionList,
  message,
  userMessage,
  isAiReplying,
  isSessionLoading,
  currentEmotion,
} = storeToRefs(chatStore)
// 定义发送消息的键盘事件
const handleKeyDown = (e) => {
  if (e.isComposing) {
    return
  }
  if (e.key === 'Enter' && e.shiftKey) {
    return
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    if (userMessage.value.length > 500) {
      ElMessage.warning('输入内容不能超过500字')
      return
    }
    sendMessage()
  }
}
const formatMessageContent = (content) => {
  return content.replace(/\n/g, '<br>')
}
const isDefaultEmotion = () => {
  return (
    currentEmotion.value.suggestion === '' &&
    currentEmotion.value.improvementSuggestions?.length === 0
  )
}
const getIntensityClass = (score) => {
  if (score >= 61) {
    return 3
  } else if (score >= 31) {
    return 2
  } else {
    return 1
  }
}
const getRiskText = (level) => {
  switch (level) {
    case 0:
      return '正常'
    case 1:
      return '关注'
    case 2:
      return '预警'
    case 3:
      return '危机'
    default:
      return '未知状态'
  }
}
const sendMessage = () => {
  if (isSessionLoading.value) {
    ElMessage.warning('会话消息加载中，请稍后再发送')
    return
  }
  if (!userMessage.value.trim()) {
    return
  }
  if (isAiReplying.value) {
    ElMessage.error('AI助手正在回复中，请稍后再试...')
    return
  }
  const inputContent = userMessage.value.trim()
  chatStore.setUserMessage('')
  if (currentSession.value.status === 'TEMP') {
    startNewSession(inputContent)
  } else {
    chatStore.addUserMessage(inputContent)
    chatStore.startAIResponse(currentSession.value.sessionId, inputContent)
  }
}
const startNewSession = (inputContent) => {
  const sessionParams = {
    initialMessage: inputContent,
  }
  if (currentSession.value.sessionTitle === '新对话') {
    sessionParams.sessionTitle = `AI情绪助手-${new Date().toLocaleString()}`
  } else {
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }
  startSession(sessionParams).then((res) => {
    const sessionData = {
      sessionId: res.sessionId,
      status: res.status,
      sessionTitle: sessionParams.sessionTitle,
    }
    if (currentSession.value && currentSession.value.status === 'TEMP') {
      Object.assign(currentSession.value, sessionData)
    } else {
      chatStore.setCurrentSession(sessionData)
    }
    getSessionPage()
    chatStore.addUserMessage(inputContent)
    chatStore.startAIResponse(currentSession.value.sessionId, inputContent)
  })
}
const getSessionPage = () => {
  getSessionList({
    pageNum: 1,
    pageSize: 10,
  }).then((res) => {
    chatStore.setSessionList(res.records)
  })
}
const handleSessionClick = async (session) => {
  if (isAiReplying.value) {
    ElMessage.warning('AI 正在回复中，请等待回复完成后再切换会话')
    return
  }
  const sessionData = {
    sessionId: 'session_' + session.id,
    status: 'ACTIVE',
    sessionTitle: session.sessionTitle,
  }
  chatStore.setCurrentSession(sessionData)
  chatStore.resetCurrentEmotion()
  chatStore.loadingEmotionRank(sessionData.sessionId)
  chatStore.setSessionLoading(true)
  chatStore.setMessage([])
  try {
    const res = await getSessionDetail(session.id)
    if (currentSession.value?.sessionId === sessionData.sessionId) {
      chatStore.setMessage(res)
    }
  } finally {
    if (currentSession.value?.sessionId === sessionData.sessionId) {
      chatStore.setSessionLoading(false)
    }
  }
}
const handleDeleteSession = (sessionId) => {
  if (isAiReplying.value) {
    ElMessage.warning('AI 正在回复中，请等待回复完成后再删除会话')
    return
  }
  deleteSession(sessionId).then(() => {
    ElMessage.success('会话删除成功')
    getSessionPage()
  })
}
onMounted(() => {
  getSessionPage()
  if (!currentSession.value) {
    chatStore.createNewFrontendSession()
  }
})
</script>

<template>
  <div class="consultation-container">
    <div class="sidebar">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="logoIconUrl" alt="AI助手" style="width: 25px; height: 25px" />
        </div>
        <h3 class="assistant-name">AI情绪助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>
          在线服务中
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <!-- 默认状态 -->
        <div v-if="isDefaultEmotion()" class="default-garden">
          <div class="welcome-card">
            <div class="welcome-icon">🌱</div>
            <div class="welcome-text">快来和你的AI心里助手聊一聊今天的心情吧！</div>
          </div>
        </div>
        <!-- 有数据状态 -->
        <template v-else>
          <div class="emotion-info">
            <div class="emotion-name">{{ currentEmotion.label }}</div>
            <div class="emotion-score">{{ currentEmotion.emotionScore }}</div>
          </div>
          <div class="warm-tips">
            <div class="emotion-status-text">
              <span class="status-label">当天感觉</span>
              <span class="status-emotion">{{
                currentEmotion.isNegative ? '需要关注' : '很不错'
              }}</span>
            </div>
            <div class="emotion-intensity">
              <span class="intensity-dots">
                <span
                  class="dot"
                  v-for="dot in 3"
                  :key="dot"
                  :class="{ active: getIntensityClass(currentEmotion.emotionScore) >= dot }"
                ></span>
              </span>
              <span class="intensity-text">
                {{ getRiskText(currentEmotion.riskLevel) }}
              </span>
            </div>
            <!-- 建议卡片 -->
            <div class="warm-suggestion" v-if="currentEmotion.suggestion">
              <div class="suggestion-icon">💝</div>
              <div class="suggestion-content">
                <div class="suggestion-title">给你的小建议</div>
                <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
              </div>
            </div>
            <!-- 治愈小行动 -->
            <div class="healing-actions" v-if="currentEmotion.improvementSuggestions?.length > 0">
              <div class="action-title">治愈小行动</div>
              <div class="action-list">
                <div
                  v-for="action in currentEmotion.improvementSuggestions"
                  :key="action"
                  class="action-item"
                >
                  <div class="action-icon">✨</div>
                  <div class="action-text">{{ action }}</div>
                </div>
              </div>
            </div>
            <!-- 大风险提示 -->
            <div
              class="risk-notice"
              v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1"
            >
              <div class="notice-icon">🤗</div>
              <div class="notice-content">
                <div class="notice-title">温馨提示</div>
                <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="session-title">会话列表</h4>
        <div class="session-list">
          <div
            v-for="session in sessionList"
            :key="session.id"
            @click="handleSessionClick(session)"
            class="session-item"
          >
            <div class="session-info">
              <div class="session-title">
                <span>{{ session.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ session.startedAt }}</span>
                </div>
                <div class="session-preview">
                  {{ session.lastMessageContent }}
                </div>
                <div class="session-stats">
                  <span>
                    <el-icon><ChatRound /></el-icon>
                    {{ session.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon><Clock /></el-icon>
                    {{ session.durationMinutes || 0 }}分钟
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-button
                  text
                  type="danger"
                  size="small"
                  :disabled="isAiReplying"
                  @click.stop="handleDeleteSession(session.id)"
                >
                  <el-icon><DeleteFilled /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="loveIconUrl" style="width: 30px; height: 30px" />
          </div>
          <div class="chat-info">
            <h2>AI情绪助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>
        <el-button circle @click="chatStore.createNewFrontendSession()" title="新建会话"
          ><el-icon><Plus /></el-icon
        ></el-button>
      </div>
      <!-- 对话消息 -->
      <div class="chat-messages">
        <!-- 默认消息 -->
        <div class="message-item ai-message" v-if="message.length === 0">
          <div class="message-avatar">
            <el-image :src="logoIconUrl" style="width: 18px; height: 18px" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>You look lonely,I can fix that.</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>
        <!-- 对话消息列表 -->
        <div
          v-for="msg in message"
          :key="msg.id"
          class="message-item"
          :class="msg.senderType === 1 ? 'user-message' : 'ai-message'"
        >
          <div class="message-avatar">
            <el-image
              :src="msg.senderType === 1 ? usersIconUrl : logoIconUrl"
              style="width: 18px; height: 18px"
            />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!--AI正在思考中 -->
              <div
                v-if="msg.senderType === 2 && isAiReplying && !msg.content"
                class="typing-indicator"
              >
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!-- AI错误提示 -->
              <div v-else-if="msg.isError" class="error-message">
                {{ msg.content }}
              </div>
              <!-- AI正常返回消息 -->
              <MarkdownRenderer
                v-else-if="msg.senderType === 2 && !msg.isError"
                :key="`${msg.id}-${msg.content.length}`"
                :content="msg.content"
                :is-ai-message="true"
              />
              <!-- 用户消息 -->
              <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
            </div>
            <div class="message-time">
              {{
                msg.senderType === 2
                  ? isAiReplying
                    ? '正在输入中...'
                    : msg.createdAt
                  : msg.createdAt
              }}
            </div>
          </div>
        </div>
      </div>
      <!-- 输入框 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
            v-model="userMessage"
            placeholder="请输入您想要分享的内容..."
            type="textarea"
            :rows="3"
            :disabled="isAiReplying || isSessionLoading"
            @keydown="handleKeyDown"
            class="message-input"
            clearable
          ></el-input>
          <div class="input-footer">
            <span>按enter发送，shift+enter换行</span>
            <span>{{ userMessage.length }}/500</span>
          </div>
        </div>
        <el-button
          :disabled="
            isAiReplying || isSessionLoading || !userMessage.trim() || userMessage.length > 500
          "
          type="primary"
          class="send-btn"
          @click="sendMessage"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;
  .sidebar {
    width: 320px;
    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(255, 252, 248, 0.95) 100%
      );
      border-radius: 16px;
      padding: 16px;
      box-shadow:
        0 8px 32px rgba(251, 146, 60, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }
      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }
      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;
        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }
    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }
          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }
          .session-info {
            flex: 1;
            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }
              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;
                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }
            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }
        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }
    .emotion-garden {
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;
        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }
      .default-garden {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 250px;
        .welcome-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.6);
          max-width: 260px;
          .welcome-icon {
            font-size: 48px;
            margin-bottom: 16px;
            animation: float 3s ease-in-out infinite;
          }
          .welcome-text {
            font-size: 15px;
            color: #6b5b47;
            line-height: 1.6;
            font-weight: 500;
          }
        }
      }
      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;
        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }
        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }
      .warm-tips {
        text-align: center;
        margin-bottom: 16px;
        .emotion-status-text {
          margin-bottom: 12px;
          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }
          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }
        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          .intensity-dots {
            display: flex;
            gap: 4px;
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;
              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }
          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }
        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .suggestion-content {
            text-align: left;
            flex: 1;
            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }
            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }
        .healing-actions {
          margin-bottom: 16px;
          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }
          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            .action-item {
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.9),
                rgba(255, 255, 255, 0.7)
              );
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;
              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }
              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }
        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .notice-content {
            flex: 1;
            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }
            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }
  .chat-main {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 252, 250, 0.98) 100%
    );
    border-radius: 20px;
    box-shadow:
      0 12px 40px rgba(251, 146, 60, 0.08),
      0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;
      .header-left {
        display: flex;
        align-items: center;
        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          p {
            font-size: 14px;
          }
        }
      }
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.02) 0%,
        rgba(255, 252, 248, 0.05) 100%
      );
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }
        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
          }
        }
        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }
        .message-content {
          max-width: 70%;
          .message-bubble {
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 252, 248, 0.95) 100%
            );
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;
              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;
                &:nth-child(2) {
                  animation-delay: 0.2s;
                }
                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }
            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
              border: 1px solid #f87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991b1b;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }
    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 252, 248, 0.7) 100%
      );
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      .input-container {
        flex: 1;
      }
      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }
      .send-btn {
        height: 60px;
        width: 60px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
