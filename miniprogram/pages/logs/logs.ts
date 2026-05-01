// logs.ts
import { formatTime } from '../../utils/util'
import { LanguageCode, createRuntimeData, getAppSettings, syncRuntimeSettings } from '../../utils/settings'

const formatShortTime = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

function getLogMeta(action: string) {
  if (action.includes('启动')) return { icon: 'apps-o', bg: 'bg-blue' }
  if (action.includes('主题') || action.includes('外观')) return { icon: 'bulb-o', bg: 'bg-purple' }
  if (action.includes('市场')) return { icon: 'chart-trending-o', bg: 'bg-green' }
  if (action.includes('语言')) return { icon: 'font-o', bg: 'bg-orange' }
  if (action.includes('消息') || action.includes('通知')) return { icon: 'bell', bg: 'bg-cyan' }
  if (action.includes('登录')) return { icon: 'user-circle-o', bg: 'bg-red' }
  if (action.includes('反馈')) return { icon: 'comment-o', bg: 'bg-cyan' }
  return { icon: 'setting-o', bg: 'bg-gray' }
}

const ACTION_LABELS: Record<string, Record<LanguageCode, string>> = {
  '应用启动': { 'zh-CN': '应用启动', 'zh-TW': '應用啟動', en: 'App Started' },
  '登录': { 'zh-CN': '登录', 'zh-TW': '登入', en: 'Login' },
  '更改主题模式': { 'zh-CN': '更改主题模式', 'zh-TW': '更改主題模式', en: 'Theme Changed' },
  '更改首选语言': { 'zh-CN': '更改首选语言', 'zh-TW': '更改首選語言', en: 'Language Changed' },
  '更改默认市场': { 'zh-CN': '更改默认市场', 'zh-TW': '更改預設市場', en: 'Default Market Changed' },
  '消息订阅服务': { 'zh-CN': '消息订阅服务', 'zh-TW': '訊息訂閱服務', en: 'Notification Subscription' },
  '更改通知频率': { 'zh-CN': '更改通知频率', 'zh-TW': '更改通知頻率', en: 'Notification Frequency Changed' },
  '退出登录': { 'zh-CN': '退出登录', 'zh-TW': '登出', en: 'Logged Out' },
  '提交意见反馈': { 'zh-CN': '提交意见反馈', 'zh-TW': '提交意見回饋', en: 'Feedback Submitted' },
}

const DETAIL_LABELS: Record<string, Record<LanguageCode, string>> = {
  'App Launch': { 'zh-CN': '应用启动', 'zh-TW': '應用啟動', en: 'App Launch' },
  '小程序拉起/初始化': { 'zh-CN': '小程序拉起/初始化', 'zh-TW': '小程式啟動/初始化', en: 'Mini Program launched/initialized' },
  '更新头像昵称': { 'zh-CN': '更新头像昵称', 'zh-TW': '更新頭像暱稱', en: 'Profile updated' },
  '开启订阅服务': { 'zh-CN': '开启订阅服务', 'zh-TW': '開啟訂閱服務', en: 'Subscription enabled' },
  '关闭订阅服务': { 'zh-CN': '关闭订阅服务', 'zh-TW': '關閉訂閱服務', en: 'Subscription disabled' },
  '账号已注销': { 'zh-CN': '账号已注销', 'zh-TW': '帳號已登出', en: 'Account logged out' },
}

const VALUE_LABELS: Record<string, Record<LanguageCode, string>> = {
  '跟随系统': { 'zh-CN': '跟随系统', 'zh-TW': '跟隨系統', en: 'System' },
  '跟隨系統': { 'zh-CN': '跟随系统', 'zh-TW': '跟隨系統', en: 'System' },
  'System': { 'zh-CN': '跟随系统', 'zh-TW': '跟隨系統', en: 'System' },
  '浅色模式': { 'zh-CN': '浅色模式', 'zh-TW': '淺色模式', en: 'Light' },
  '淺色模式': { 'zh-CN': '浅色模式', 'zh-TW': '淺色模式', en: 'Light' },
  'Light': { 'zh-CN': '浅色模式', 'zh-TW': '淺色模式', en: 'Light' },
  '深色模式': { 'zh-CN': '深色模式', 'zh-TW': '深色模式', en: 'Dark' },
  'Dark': { 'zh-CN': '深色模式', 'zh-TW': '深色模式', en: 'Dark' },
  'A股': { 'zh-CN': 'A股', 'zh-TW': 'A股', en: 'China A-shares' },
  '港股': { 'zh-CN': '港股', 'zh-TW': '港股', en: 'Hong Kong' },
  '美股': { 'zh-CN': '美股', 'zh-TW': '美股', en: 'United States' },
  '英股': { 'zh-CN': '英股', 'zh-TW': '英股', en: 'United Kingdom' },
  'China A-shares': { 'zh-CN': 'A股', 'zh-TW': 'A股', en: 'China A-shares' },
  'Hong Kong': { 'zh-CN': '港股', 'zh-TW': '港股', en: 'Hong Kong' },
  'United States': { 'zh-CN': '美股', 'zh-TW': '美股', en: 'United States' },
  'United Kingdom': { 'zh-CN': '英股', 'zh-TW': '英股', en: 'United Kingdom' },
  '实时推送': { 'zh-CN': '实时推送', 'zh-TW': '即時推播', en: 'Realtime' },
  '即時推播': { 'zh-CN': '实时推送', 'zh-TW': '即時推播', en: 'Realtime' },
  'Realtime': { 'zh-CN': '实时推送', 'zh-TW': '即時推播', en: 'Realtime' },
  '每日一次': { 'zh-CN': '每日一次', 'zh-TW': '每日一次', en: 'Daily' },
  'Daily': { 'zh-CN': '每日一次', 'zh-TW': '每日一次', en: 'Daily' },
  '每周一次': { 'zh-CN': '每周一次', 'zh-TW': '每週一次', en: 'Weekly' },
  '每週一次': { 'zh-CN': '每周一次', 'zh-TW': '每週一次', en: 'Weekly' },
  'Weekly': { 'zh-CN': '每周一次', 'zh-TW': '每週一次', en: 'Weekly' },
  '关闭': { 'zh-CN': '关闭', 'zh-TW': '關閉', en: 'Off' },
  '關閉': { 'zh-CN': '关闭', 'zh-TW': '關閉', en: 'Off' },
  'Off': { 'zh-CN': '关闭', 'zh-TW': '關閉', en: 'Off' },
  '功能建议': { 'zh-CN': '功能建议', 'zh-TW': '功能建議', en: 'Feature' },
  '功能建議': { 'zh-CN': '功能建议', 'zh-TW': '功能建議', en: 'Feature' },
  'Bug 报告': { 'zh-CN': 'Bug 报告', 'zh-TW': 'Bug 回報', en: 'Bug' },
  'Bug 回報': { 'zh-CN': 'Bug 报告', 'zh-TW': 'Bug 回報', en: 'Bug' },
  '界面优化': { 'zh-CN': '界面优化', 'zh-TW': '介面優化', en: 'UI' },
  '介面優化': { 'zh-CN': '界面优化', 'zh-TW': '介面優化', en: 'UI' },
  '数据问题': { 'zh-CN': '数据问题', 'zh-TW': '資料問題', en: 'Data' },
  '資料問題': { 'zh-CN': '数据问题', 'zh-TW': '資料問題', en: 'Data' },
  '其他': { 'zh-CN': '其他', 'zh-TW': '其他', en: 'Other' },
}

function translateValue(value: string, language: LanguageCode) {
  return VALUE_LABELS[value]?.[language] || value
}

function translateAction(action: string, language: LanguageCode) {
  return ACTION_LABELS[action]?.[language] || action
}

function translateDetail(detail: string, language: LanguageCode) {
  if (!detail) return ''

  const changedMatch = detail.match(/^(变更为|變更為|Changed to)[:：]?\s*(.+)$/)
  if (changedMatch) {
    const value = translateValue(changedMatch[2], language)
    if (language === 'en') return `Changed to: ${value}`
    if (language === 'zh-TW') return `變更為：${value}`
    return `变更为：${value}`
  }

  return DETAIL_LABELS[detail]?.[language] || translateValue(detail, language)
}

Component({
  data: {
    ...createRuntimeData(),
    logs: [] as any[],
  },
  lifetimes: {
    attached() {
      this.loadLogs()
    }
  },
  pageLifetimes: {
    show() {
      this.loadLogs()
    },
  },
  methods: {
    loadLogs() {
      syncRuntimeSettings(this)
      const language = getAppSettings().language
      const logs = (wx.getStorageSync('logs') || []).map((log: any) => {
        let actionStr = '应用启动'
        let detailStr = ''
        let logTime = Date.now()

        if (typeof log === 'number') {
          logTime = log
        } else {
          logTime = log.time
          actionStr = log.action
          detailStr = log.detail
        }

        const meta = getLogMeta(actionStr)

        return {
          date: formatTime(new Date(logTime)),
          dateShort: formatShortTime(new Date(logTime)),
          timeStamp: logTime,
          action: translateAction(actionStr, language),
          detail: translateDetail(detailStr, language),
          icon: meta.icon,
          bgClass: meta.bg
        }
      })
      this.setData({ logs })
    },
  },
})
