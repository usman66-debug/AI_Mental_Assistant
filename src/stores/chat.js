import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getEmotionRank } from '@/apis/frontend'

export const useChatStore = defineStore('chat', () => {
  const defaultEmotion = {
    label: '中性',
    isNegative: false,
    emotionScore: 50,
    primaryEmotion: '中性',
    riskLevel: 0,
    suggestion: '',
    improvementSuggestions: [],
  }

  const currentSession = ref(null)
  const sessionList = ref([])
  const message = ref([])
  const userMessage = ref('')
  const isAiReplying = ref(false)
  const currentEmotion = ref({ ...defaultEmotion })
  const isSessionLoading = ref(false)

  let abortController = null
  let emotionRequestSeq = 0

  const normalizeSessionId = (sessionId) => {
    if (!sessionId) return ''

    const id = sessionId.toString()
    return id.startsWith('session_') ? id : `session_${id}`
  }

  const applyDefaultEmotion = () => {
    currentEmotion.value = { ...defaultEmotion }
  }

  const resetCurrentEmotion = () => {
    emotionRequestSeq += 1
    applyDefaultEmotion()
  }

  const createNewFrontendSession = () => {
    if (isAiReplying.value) {
      ElMessage.warning('AI 正在回复中，请等待回复完成后再新建会话')
      return
    }

    const newSession = {
      sessionId: `temp_${Date.now()}`,
      status: 'TEMP',
      sessionTitle: '新对话',
    }

    currentSession.value = newSession
    message.value = []
    userMessage.value = ''
    resetCurrentEmotion()
  }

  const setCurrentSession = (session) => {
    currentSession.value = session
  }

  const setSessionList = (list) => {
    sessionList.value = Array.isArray(list) ? list : []
  }

  const setMessage = (list) => {
    message.value = Array.isArray(list) ? list : []
  }

  const setUserMessage = (value) => {
    userMessage.value = value
  }

  const setCurrentEmotion = (value) => {
    currentEmotion.value = value || { ...defaultEmotion }
  }

  const setSessionLoading = (value) => {
    isSessionLoading.value = value
  }

  const addUserMessage = (content) => {
    message.value.push({
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      senderType: 1,
      content,
      createdAt: new Date().toISOString(),
    })
  }

  const addAiMessage = () => {
    const aiMsg = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      senderType: 2,
      content: '',
      isError: false,
      createdAt: new Date().toISOString(),
    }

    message.value.push(aiMsg)

    // 关键：从响应式数组里重新取出，避免直接操作原始对象导致页面不实时刷新
    return message.value[message.value.length - 1]
  }

  const appendAiMessageContentById = (id, content) => {
    const index = message.value.findIndex((msg) => msg.id === id)

    if (index !== -1 && message.value[index].senderType === 2) {
      message.value[index] = {
        ...message.value[index],
        content: message.value[index].content + content,
      }
    }
  }

  const setAiMessageErrorById = (id, errorText) => {
    const index = message.value.findIndex((msg) => msg.id === id)

    if (index !== -1 && message.value[index].senderType === 2) {
      message.value[index] = {
        ...message.value[index],
        content: errorText,
        isError: true,
      }
    }
  }

  const appendAiMessageContent = (content) => {
    if (message.value.length === 0) return

    const lastMsg = message.value[message.value.length - 1]

    if (lastMsg.senderType === 2) {
      message.value[message.value.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + content,
      }
    }
  }

  const clearCurrentChat = () => {
    message.value = []
    userMessage.value = ''
    resetCurrentEmotion()
  }

  const loadingEmotionRank = (sessionId) => {
    if (!sessionId) return

    const id = normalizeSessionId(sessionId)
    const requestSeq = ++emotionRequestSeq

    return getEmotionRank(id)
      .then((res) => {
        if (
          requestSeq !== emotionRequestSeq ||
          normalizeSessionId(currentSession.value?.sessionId) !== id
        ) {
          return
        }

        setCurrentEmotion(res)
      })
      .catch(() => {
        if (
          requestSeq !== emotionRequestSeq ||
          normalizeSessionId(currentSession.value?.sessionId) !== id
        ) {
          return
        }

        applyDefaultEmotion()
      })
  }

  const stopAIResponse = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    isAiReplying.value = false
  }

  const startAIResponse = (sessionId, inputContent) => {
    if (isAiReplying.value) {
      ElMessage.error('AI助手正在回复中，请稍后再试...')
      return
    }

    isAiReplying.value = true

    const aiMsg = addAiMessage()
    const aiMsgId = aiMsg.id

    abortController = new AbortController()

    let hasFinished = false
    let hasLoadedEmotion = false

    const finishReply = () => {
      if (hasFinished) return

      hasFinished = true
      isAiReplying.value = false

      if (!hasLoadedEmotion) {
        hasLoadedEmotion = true
        loadingEmotionRank(sessionId)
      }

      abortController = null
    }

    const finishWithError = (errorText) => {
      setAiMessageErrorById(aiMsgId, errorText)

      isAiReplying.value = false
      hasFinished = true

      if (abortController) {
        abortController.abort()
        abortController = null
      }

      ElMessage.error(errorText)
    }

    fetchEventSource('/api/psychological-chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: localStorage.getItem('token') || '',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        sessionId,
        userMessage: inputContent,
      }),
      signal: abortController.signal,

      onopen: async (response) => {
        const contentType = response.headers.get('Content-Type') || ''

        if (!response.ok) {
          const errorText = `对话接口请求失败，状态码：${response.status}`
          finishWithError(errorText)
          throw new Error(errorText)
        }

        if (!contentType.includes('text/event-stream')) {
          const errorText = '后端返回的不是流式数据'
          finishWithError(errorText)
          throw new Error(errorText)
        }
      },

      onmessage: (event) => {
        const row = event.data?.trim()

        if (!row) {
          return
        }

        const eventName = event.event

        if (eventName === 'done') {
          finishReply()
          return
        }

        let payload

        try {
          payload = JSON.parse(row)
        } catch {
          // 兼容后端直接返回纯文本片段的情况
          appendAiMessageContentById(aiMsgId, row)
          return
        }

        if (eventName === 'error') {
          const errorText = payload.msg || payload.message || 'AI回复失败，请稍后重试'
          finishWithError(errorText)
          return
        }

        const ok = String(payload.code) === '200'

        if (ok && payload.data?.content) {
          // 关键：按本次 AI 消息 id 追加，既保证流式刷新，也避免追加到错误会话
          appendAiMessageContentById(aiMsgId, payload.data.content)
        } else if (!ok) {
          const errorText = payload.msg || payload.message || 'AI助手回复错误'
          finishWithError(errorText)
        }
      },

      onerror: (error) => {
        if (hasFinished) {
          return
        }

        const errorText = typeof error === 'string' ? error : error?.message || 'AI助手回复错误'

        finishWithError(errorText)

        throw error
      },

      onclose: () => {
        finishReply()
      },
    })
  }

  return {
    currentSession,
    sessionList,
    message,
    userMessage,
    isAiReplying,
    currentEmotion,
    isSessionLoading,
    defaultEmotion,

    createNewFrontendSession,
    setCurrentSession,
    setSessionList,
    setMessage,
    setUserMessage,
    setCurrentEmotion,
    resetCurrentEmotion,
    setSessionLoading,

    addUserMessage,
    addAiMessage,
    appendAiMessageContent,
    appendAiMessageContentById,
    clearCurrentChat,
    loadingEmotionRank,
    startAIResponse,
    stopAIResponse,
  }
})
