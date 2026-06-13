<template>
  <div class="consultation-container">
    <div class="sidebar">
      AI助手信息

      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="iconUrl1" alt="AI助手" style="width: 25px; height: 25px;" />
        </div>

        <h3 class="assistant-name">AI助手</h3>

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

        <div class="emotion-info">
          <div class="emotion-name"></div>
          <div class="emotion-score"></div>
        </div>

        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion">
              {{ currentEmotion.isNegative ? "需要关注" : "很不错" }}
            </span>
          </div>

          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span
                v-for="dot in 3"
                :key="dot"
                class="dot"
                :class="{ active: getIntensityClass(currentEmotion.emotionScore) >= dot }"
              ></span>
            </span>
            <span class="intensity-text">
              {{ getRiskText(currentEmotion.riskLevel) }}
            </span>
          </div>

          <!-- 温习建议卡片 -->
          <div class="warm-suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
            </div>
          </div>

          <!-- 治愈行动 -->
          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length > 0">
            <div class="action-title">治愈小行动</div>
            <div class="actions-list">
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

          <!-- 风险提示 -->
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温习提示</div>
              <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="section-title">会话列表</h4>

        <div class="session-list">
          <div
            v-for="session in sessionList"
            :key="session.id"
            class="session-item"
            @click="handleSessionClick(session)"
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
                <el-button text type="danger" @click="handleDeleteSession(session.id)">
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
            <el-image :src="iconUrl2" style="width: 30px; height: 30px;" />
          </div>

          <div class="chat-info">
            <h2>AI助手</h2>
            <p>您的贴心AI心理健康助手</p>
          </div>
        </div>

        <el-button circle title="新建会话" @click="createNewFrontendSession">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <!-- 消息列表 -->
      <DynamicScroller
        ref="chatScrollerRef"
        class="chat-messages"
        :items="messages"
        :min-item-size="96"
        key-field="id"
      >
        <template #before>
          <div class="message-item ai-message" v-if="messages.length === 0">
            <div class="message-avatar">
              <el-image :src="iconUrl1" style="width: 20px; height: 20px;" />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <p>您好,我是您的AI心理健康助手。有什么我可以帮您的吗?</p>
              </div>
              <div class="message-time">刚刚</div>
            </div>
          </div>
        </template>

        <template #default="{ item: msg, index, active }">
          <DynamicScrollerItem
            :item="msg"
            :active="active"
            :size-dependencies="[msg.content]"
            :data-index="index"
          >
            <div
              class="message-item"
              :class="msg.senderType === 1 ? 'user-message' : 'ai-message'"
            >
              <div class="message-avatar">
                <el-image
                  v-if="msg.senderType === 1"
                  :src="iconUrl3"
                  style="width: 18px; height: 18px;"
                />
                <el-image
                  v-if="msg.senderType === 2"
                  :src="iconUrl1"
                  style="width: 18px; height: 18px;"
                />
              </div>

              <div class="message-content">
                <div class="message-bubble">
                  <div
                    v-if="msg.senderType === 2 && isAiTyping && !msg.content"
                    class="typing-indicator"
                  >
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                  </div>

                  <div v-else-if="msg.isError" class="error-message">
                    <p>{{ msg.content }}</p>
                  </div>

                  <MarkdownRenderer
                    v-else-if="msg.senderType === 2 && !msg.isError"
                    :content="msg.content"
                    :is-ai-message="true"
                  />

                  <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
                </div>

                <div class="message-time">
                  {{ msg.senderType === 2 && isAiTyping ? '正在输入中...' : msg.createdAt }}
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>

      <!-- 聊天输入区 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
            v-model="userMessage"
            placeholder="请输入消息内容..."
            clearable
            type="textarea"
            :rows="3"
            :disabled="isAiTyping"
            class="message-input"
            @keydown="handleKeydown"
          />

          <div class="input-footer">
            <span>按Enter发送,Shift+Enter换行</span>
            <span>{{ userMessage.length }}/500</span>
          </div>
        </div>

        <el-button
          type="primary"
          class="send-btn"
          :disabled="!userMessage.trim() || userMessage.length > 500"
          @click="sendMessage"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

import { startSession ,getSessionList,deleteSession,getSessionDetail,getSessionEmotion} from '../api/frontend';
import  MarkdownRenderer  from '../components/MarkdownRenderer.vue'
import { ElMessage } from 'element-plus';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { ref, onMounted, nextTick, watch } from 'vue'
import {useUserStore} from '../stores/user.js'

const messages=ref([]);
const userMessage=ref('');
const useStore=useUserStore()
const currentSession=ref(null);
const createNewFrontendSession=()=>{
    const newSession={
        sessionId:`temp_${Date.now()}`,
        status:'TEMP',
        seesionTitle:'新会话',

    }
    currentSession.value=newSession;
    messages.value=[]
}


const sessionList=ref([])

const iconUrl1 = new URL('../assets/images/robot-fill.png', import.meta.url).href;   

const iconUrl2 = new URL('../assets/images/like.png', import.meta.url).href;

const iconUrl3=new URL('../assets/images/users.png', import.meta.url).href;
const isAiTyping = ref(false);
let streamTextQueue = ''
let streamTypingTimer = null
let streamDonePending = false

const resetStreamTyping = () => {
    streamTextQueue = ''
    streamDonePending = false
    if (streamTypingTimer) {
        clearInterval(streamTypingTimer)
        streamTypingTimer = null
    }
}

const finishStreamTyping = () => {
    isAiTyping.value = false
    streamDonePending = false
    loadSessionEmotion(currentSession.value.sessionId)
}

const startStreamTyping = (aiMessage) => {
    if (streamTypingTimer) return

    streamTypingTimer = setInterval(() => {
        if (streamTextQueue) {
            const nextText = streamTextQueue.slice(0, 2)
            streamTextQueue = streamTextQueue.slice(2)
            aiMessage.content += nextText
            return
        }

        clearInterval(streamTypingTimer)
        streamTypingTimer = null

        if (streamDonePending) {
            finishStreamTyping()
        }
    }, 35)
}

const enqueueStreamText = (aiMessage, text) => {
    streamTextQueue += text
    startStreamTyping(aiMessage)
}
const loadSessionEmotion=(sessionId)=>{
    const id=sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
    getSessionEmotion(id).then(res=>{
        console.log(res)
       currentEmotion.value=res
    })
}



const currentEmotion=ref({
    primaryEmotion:'中性',
    emotionScore:50,
    isNegative:false,
    riskLevel:0,
     suggestion:'情绪状态平稳',
     improvementSuggestions:[]
})
const getIntensityClass = (score)=>{
    if(score >=61){
        return 3
    }
    if(score>=31){
        return 2
    }
    return 1
}

const getRiskText=(level)=>{
       switch(level){
        case 0:
            return '正常'
            case 1:
            return '关注'
            case 2:
            return '预警'
            case 3:
            return '危机'
            default:
                return '正常'
       }
}
const handleKeydown = (e) => {
  if (e.key !== 'Enter') return

  if (e.shiftKey) {
    return
  }

  e.preventDefault()

  if (!userMessage.value.trim()) return
  if (userMessage.value.length > 500) {
    ElMessage.error('消息不能超过500字')
    return
  }
  if (isAiTyping.value) {
    ElMessage.error('AI助手正在输入中，请稍等')
    return
  }

  sendMessage()
}

const sendMessage=()=>{
    if(!userMessage.value.trim()) return;
    if(isAiTyping.value){
    ElMessage.error('AI助手正在输入中，请稍后')
    return
    }

    const message=userMessage.value.trim();
    userMessage.value=''
     if(currentSession.value.status==='TEMP'){
startNewSession(message)
     }else{
        messages.value.push({
            id:Date.now(),
            senderType:1,
            content:message,
            createdAt:new Date().toISOString()
    
        })
        startAIResponse(currentSession.value.sessionId,message)
     }
    

}
const startNewSession=(message)=>{
      const sessionParams={
        initialMessage:message
      }

      if(currentSession.value.sessionTitle==='新对话'){
        sessionParams.sessionTitle=`AI助手-${new Date().toLocaleString()}`

      }else{
        sessionParams.sessionTitle=currentSession.value.sessionTitle
      }
      startSession(sessionParams).then(res=>{
        const sessionData={
        sessionId:res.sessionId,
        status:res.status,
        sessionTitle:sessionParams.sessionTitle,
        }
        if(currentSession.value&& currentSession.value.status==='TEMP'){
            Object.assign(currentSession.value,sessionData)

        }else{
            currentSession.value=sessionData
        }
        getSessionPage()
        messages.value.push({
            id:Date.now(),
        senderType:1,
        content:message,
        createdAt:new Date().toISOString()
        })

         startAIResponse(currentSession.value.sessionId,message)
      })
}

const startAIResponse=(sessionId,userMessage)=>{
       if(isAiTyping.value){ 
         ElMessage.error('AI助手正在输入中,请稍后')
         return
       }
       resetStreamTyping()
       isAiTyping.value=true
    const aiMessage={
        id:`ai_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
        senderType:2,
        content:'',
        createdAt:new Date().toISOString()
    }
    messages.value.push(aiMessage)
    //调用流式接口
    const ctrl=new AbortController()
    fetchEventSource('/api/psychological-chat/stream',{
        method:'POST',
        headers:{
            'Content-Type' : 'application/json',
            'Token':useStore.token,
            'Accept':'text/event-stream'

        },
        body:JSON.stringify({
            sessionId,
            userMessage
        }),
        signal: ctrl.signal,
        onopen:(response)=>{
            const contentType = response.headers.get('Content-Type') || ''
            if(!contentType.includes('text/event-stream')){
                ElMessage.error('服务器返回非流式数据')
            }
        },
        onmessage:(event)=>{
            const raw= event.data.trim()
            if(!raw) return
            const eventName=event.event
            const aiMessage = messages.value[messages.value.length-1]


            if(eventName === 'done'){
                streamDonePending = true
                if (!streamTextQueue && !streamTypingTimer) {
                    finishStreamTyping()
                }
                ctrl.abort()
                return
            }
            const payload=JSON.parse(raw)
            const ok= String(payload.code) === '200'
        if(ok && payload.data && payload.data.content){
            enqueueStreamText(aiMessage, payload.data.content)
        }else if (!ok){
           handleError(payload.message||'AI回复失败')
        }
        },
        onerror:(err)=>{
         handleError(err||'AI回复失败')
         throw err
        },
        onclose:()=>{
              loadSessionEmotion(currentSession.value.sessionId)
        }
    })
   
}

//错误处理函数
 const handleError=(error)=>{
      resetStreamTyping()
      const aiMessage=messages.value[messages.value.length-1]
      if(aiMessage ){
        aiMessage.content='AI回复失败,请重试'
      }
      isAiTyping.value=false
      ElMessage.error(error)
 }
const getSessionPage=()=>{
    getSessionList({
        pageNum:1,
        pageSize:10
    }).then(res=>{
        
      sessionList.value=res.records
    })
}

const handleSessionClick=(session)=>{
   getSessionDetail(session.id).then(res=>{
    messages.value=res
     
   })
    loadSessionEmotion(session.id)
   const sessionData={
    sessionId:"session_"+session.id,
    status:'ACTIVE',
    sessionTitle:session.sessionTitle
   }
    currentSession.value=sessionData
}

const handleDeleteSession=(sessionId)=>{
    deleteSession(sessionId).then(res=>{
        ElMessage.success('删除成功')
        getSessionPage()
    })
}
  
const formatMessageContent=(content)=>{
    return content.replace(/\n/g,'<br>')
}
const chatScrollerRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  requestAnimationFrame(() => {
    chatScrollerRef.value?.scrollToBottom()
  })
}
watch(
  messages,
  () => {
    // 🌟 这时候不需要嵌套任何东西了，它天然就是在最新节点渲染完后执行的
    scrollToBottom()
  },
  { 
    deep: true, 
    flush: 'post' // 🌟 核心魔法：直接把执行时机死死定在 DOM 更新之后！
  }
)
onMounted(()=>{

    getSessionPage();
    createNewFrontendSession();
})


</script>
<style lang="scss" scoped>
.consultation-container {
    margin: 0 auto;
    width: 1200px;
    height: calc(100vh - 120px);
    box-sizing: border-box;
    display: flex;
    gap: 20px;
    padding: 20px;
    overflow: hidden;
    .sidebar {
        width: 320px;
        height: 100%;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
        .ai-assistant-info {
            margin-bottom: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
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
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
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
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(251, 146, 60, 0.1);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        height: 100%;
        min-height: 0;
        min-width: 0;
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
                    background: rgba(141, 224, 16, 0.25);
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
            min-height: 0;
            height: 100%;
            overflow-y: auto;
            padding: 24px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
            scrollbar-width: thin;
            scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
            .message-item {
               margin-bottom: 16px;
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #fb923c;
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
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
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
                            background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
                            border: 1px solid #F87171;
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #991B1B;
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
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
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
</style>
