export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
export type LanguageCode = 'zh-CN' | 'zh-TW' | 'en'
export type MarketId = 'cn' | 'hk' | 'us' | 'uk'
export type NotifyFrequency = 'realtime' | 'daily' | 'weekly' | 'off'

export interface AppSettings {
  themeMode: ThemeMode
  language: LanguageCode
  defaultMarket: MarketId
  subscriptionEnabled: boolean
  notifyFrequency: NotifyFrequency
}

export interface RuntimeTheme {
  mode: ResolvedTheme
  primaryColor: string
  primaryLightColor: string
  bgColor: string
  surfaceColor: string
  elevatedColor: string
  textMainColor: string
  textSecondaryColor: string
  textHintColor: string
  borderColor: string
  navBackgroundColor: string
  navTextColor: string
  navFrontColor: '#000000' | '#ffffff'
  tabBarColor: string
  tabBarSelectedColor: string
  tabBarBackgroundColor: string
  switchActiveColor: string
  buttonColor: string
  shadowColor: string
  glassColor: string
  pageGradient: string
}

export interface RuntimeData {
  appSettings: AppSettings
  appTheme: RuntimeTheme
  appThemeClass: string
  appThemeVars: string
  appLanguage: LanguageCode
  appLanguageClass: string
  i18n: AppI18n
}

interface LabeledOption<T extends string> {
  value: T
  labels: Record<LanguageCode, string>
}

const STORAGE_KEY = 'app_settings'
let lastPlatformThemeSignature = ''

export const APP_VERSION = 'v0.1.0'
export const SUBSCRIBE_TEMPLATE_IDS: string[] = ['cQgkPQAji-RoXNLz3ARA7iWdZfYej4edC9E3NZ--_L8']

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  language: 'zh-CN',
  defaultMarket: 'cn',
  subscriptionEnabled: true,
  notifyFrequency: 'daily',
}

export const THEME_OPTIONS: LabeledOption<ThemeMode>[] = [
  { value: 'system', labels: { 'zh-CN': '跟随系统', 'zh-TW': '跟隨系統', en: 'System' } },
  { value: 'light', labels: { 'zh-CN': '浅色模式', 'zh-TW': '淺色模式', en: 'Light' } },
  { value: 'dark', labels: { 'zh-CN': '深色模式', 'zh-TW': '深色模式', en: 'Dark' } },
]

export const LANGUAGE_OPTIONS: LabeledOption<LanguageCode>[] = [
  { value: 'zh-CN', labels: { 'zh-CN': '简体中文', 'zh-TW': '簡體中文', en: 'Simplified Chinese' } },
  { value: 'zh-TW', labels: { 'zh-CN': '繁體中文', 'zh-TW': '繁體中文', en: 'Traditional Chinese' } },
  { value: 'en', labels: { 'zh-CN': 'English', 'zh-TW': 'English', en: 'English' } },
]

export const MARKET_OPTIONS: LabeledOption<MarketId>[] = [
  { value: 'cn', labels: { 'zh-CN': 'A股', 'zh-TW': 'A股', en: 'China A-shares' } },
  { value: 'hk', labels: { 'zh-CN': '港股', 'zh-TW': '港股', en: 'Hong Kong' } },
  { value: 'us', labels: { 'zh-CN': '美股', 'zh-TW': '美股', en: 'United States' } },
  { value: 'uk', labels: { 'zh-CN': '英股', 'zh-TW': '英股', en: 'United Kingdom' } },
]

export const NOTIFY_FREQ_OPTIONS: LabeledOption<NotifyFrequency>[] = [
  { value: 'realtime', labels: { 'zh-CN': '实时推送', 'zh-TW': '即時推播', en: 'Realtime' } },
  { value: 'daily', labels: { 'zh-CN': '每日一次', 'zh-TW': '每日一次', en: 'Daily' } },
  { value: 'weekly', labels: { 'zh-CN': '每周一次', 'zh-TW': '每週一次', en: 'Weekly' } },
  { value: 'off', labels: { 'zh-CN': '关闭', 'zh-TW': '關閉', en: 'Off' } },
]

const THEME_PALETTES: Record<ResolvedTheme, RuntimeTheme> = {
  light: {
    mode: 'light',
    primaryColor: '#2F54EB',
    primaryLightColor: '#EAF0FF',
    bgColor: '#F5F6F8',
    surfaceColor: '#FFFFFF',
    elevatedColor: '#FFFFFF',
    textMainColor: '#1A1D24',
    textSecondaryColor: '#8C92A4',
    textHintColor: '#B0B5C1',
    borderColor: '#EBF0F5',
    navBackgroundColor: '#FFFFFF',
    navTextColor: '#111827',
    navFrontColor: '#000000',
    tabBarColor: '#8C92A4',
    tabBarSelectedColor: '#2F54EB',
    tabBarBackgroundColor: '#FFFFFF',
    switchActiveColor: '#2F54EB',
    buttonColor: '#2F54EB',
    shadowColor: 'rgba(30, 41, 59, 0.06)',
    glassColor: 'rgba(255, 255, 255, 0.72)',
    pageGradient: 'linear-gradient(180deg, rgba(47, 84, 235, 0.06) 0%, rgba(245, 246, 248, 0) 100%)',
  },
  dark: {
    mode: 'dark',
    primaryColor: '#7C9CFF',
    primaryLightColor: '#1B2B5F',
    bgColor: '#0F172A',
    surfaceColor: '#172033',
    elevatedColor: '#1E293B',
    textMainColor: '#F8FAFC',
    textSecondaryColor: '#CBD5E1',
    textHintColor: '#94A3B8',
    borderColor: '#334155',
    navBackgroundColor: '#0F172A',
    navTextColor: '#F8FAFC',
    navFrontColor: '#ffffff',
    tabBarColor: '#94A3B8',
    tabBarSelectedColor: '#7C9CFF',
    tabBarBackgroundColor: '#111827',
    switchActiveColor: '#7C9CFF',
    buttonColor: '#5F7DFF',
    shadowColor: 'rgba(0, 0, 0, 0.28)',
    glassColor: 'rgba(23, 32, 51, 0.78)',
    pageGradient: 'linear-gradient(180deg, rgba(124, 156, 255, 0.14) 0%, rgba(15, 23, 42, 0) 100%)',
  },
}

const FONT_FAMILIES: Record<LanguageCode, string> = {
  'zh-CN': "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  'zh-TW': "-apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', sans-serif",
  en: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
}

export const I18N = {
  'zh-CN': {
    common: {
      cancel: '取消',
      localTime: '当地时间',
      copied: '链接已复制',
    },
    pages: {
      market: '市场时间',
      calendar: '市场日历',
      notification: '通知',
      settings: '我的',
      logs: '操作日志',
      about: '关于我们',
      feedback: '意见反馈',
    },
    tabBar: {
      market: '时间',
      calendar: '日历',
      notification: '通知',
      settings: '我的',
    },
    settings: {
      profileNickname: '昵称',
      nicknamePlaceholder: '请输入昵称',
      loginButton: '获取头像昵称',
      compatTip: '请使用2.10.4及以上版本基础库',
      appearance: '外观设置',
      theme: '深色模式',
      language: '首选语言',
      marketPreference: '市场偏好',
      defaultMarket: '默认市场',
      notifications: '消息通知',
      subscription: '订阅消息',
      notifyFrequency: '通知频率',
      manageSubscriptions: '管理订阅',
      subscribed: '个市场已订阅',
      noSubscription: '未订阅',
      about: '关于',
      logs: '操作日志',
      aboutUs: '关于我们',
      feedback: '意见反馈',
      currentVersion: '当前版本',
      logout: '退出登录',
      logoutTitle: '提示',
      logoutContent: '确定退出登录吗？',
      loggedOut: '已退出登录',
      themeToast: '已切换为',
      languageToast: '语言已设为',
      marketToast: '默认市场已设为',
      notifyToast: '通知频率已设为',
      subscriptionOn: '订阅消息已开启',
      subscriptionOff: '订阅消息已关闭',
      localSubscriptionOn: '已开启本地订阅设置',
      subscriptionAuthFail: '订阅授权失败',
    },
    market: {
      open: 'MARKET OPEN',
      closed: 'MARKET CLOSED',
      untilClose: '距离收盘',
      untilOpen: '距离开盘',
      todaySchedule: '今日时间表',
      upcomingHolidays: '即将到来的假期',
      fullCalendar: '查看完整日历',
      tradingCalendar: '交易日历',
      normalTrading: '正常交易',
      weekendClosed: '周末休市',
      holidayClosed: '法定假日',
      stages: {
        pre: '盘前交易',
        normal: '正常交易',
        post: '盘后交易',
      },
    },
    notification: {
      bannerTitle: '开启通知，不再错过交易机会',
      bannerDesc: '订阅市场开盘提醒，在选定的时间接收通知。每次授权仅对单次消息有效，建议保持关注。',
      marketSubscriptions: '市场订阅',
      subscriptionDesc: '选择需要接收通知的市场，并设定提醒时机',
      disabledHint: '已在设置页关闭消息订阅',
      openAt: '开盘',
      timing: '提醒时机：',
      authorizeAll: '一键授权订阅消息',
      sendTest: '发送测试通知',
      sending: '发送中',
      records: '通知记录',
      recordsDesc: '最近的交易提醒和系统通知',
      empty: '暂无通知记录',
      emptyHint: '开启市场订阅后，通知将显示在这里',
      footer: '提示：微信订阅消息需每次手动触发授权，您开启订阅后我们会记录偏好，但实际发送需要您点击授权。模板ID请在微信小程序后台「功能 > 订阅消息」中配置。',
      templateMissing: '请先配置订阅消息模板ID',
      enableSettingsFirst: '请先在设置页开启订阅消息',
      localEnabled: '通知已开启',
      disabled: '通知已关闭',
      authSuccess: '订阅授权成功',
      authFail: '授权失败，请稍后重试',
      authSuggest: '建议授权以接收通知',
      sendSuccess: '测试通知已发送',
      sendFail: '发送失败，请检查模板或云函数',
      timingPrefix: '提醒：',
      timings: {
        at_open: '开盘时',
        '5min_before': '开盘前5分钟',
        '15min_before': '开盘前15分钟',
      },
    },
    feedback: {
      type: '反馈类型',
      detail: '详细描述',
      detailPlaceholder: '请详细描述您遇到的问题或建议...',
      contact: '联系方式（选填）',
      contactPlaceholder: '邮箱或手机号，方便我们回复您',
      submit: '提交反馈',
      tip: '您的每一条反馈都将帮助我们做得更好，感谢您的支持！',
      submitted: '反馈已提交，感谢您！',
      categories: {
        feature: '功能建议',
        bug: 'Bug 报告',
        ui: '界面优化',
        data: '数据问题',
        other: '其他',
      },
    },
    about: {
      tagline: '全球股市交易时间 · 一目了然',
      version: 'Version',
      aboutApp: '关于应用',
      description: 'StocksFlow 是一款专注于全球股市交易时间追踪的工具型小程序。我们致力于为投资者提供清晰、准确的市场交易时间、假日安排及倒计时提醒，帮助您高效把握每一个交易机会。',
      features: '核心功能',
      featureItems: ['全球主要市场交易时间实时显示', '盘前 / 盘中 / 盘后状态可视化', '市场假期日历与智能提醒', '个性化市场偏好配置'],
      contactUs: '联系我们',
      team: '开发团队',
      openSource: '开源主页',
      copyGithub: '复制 GitHub 链接',
      support: '技术支持',
    },
    logs: {
      empty: '系统很安静，暂无活动记录',
    },
  },
  'zh-TW': {
    common: {
      cancel: '取消',
      localTime: '當地時間',
      copied: '連結已複製',
    },
    pages: {
      market: '市場時間',
      calendar: '市場日曆',
      notification: '通知',
      settings: '我的',
      logs: '操作記錄',
      about: '關於我們',
      feedback: '意見回饋',
    },
    tabBar: {
      market: '時間',
      calendar: '日曆',
      notification: '通知',
      settings: '我的',
    },
    settings: {
      profileNickname: '暱稱',
      nicknamePlaceholder: '請輸入暱稱',
      loginButton: '取得頭像暱稱',
      compatTip: '請使用2.10.4及以上版本基礎庫',
      appearance: '外觀設定',
      theme: '深色模式',
      language: '首選語言',
      marketPreference: '市場偏好',
      defaultMarket: '預設市場',
      notifications: '訊息通知',
      subscription: '訂閱訊息',
      notifyFrequency: '通知頻率',
      manageSubscriptions: '管理訂閱',
      subscribed: '個市場已訂閱',
      noSubscription: '未訂閱',
      about: '關於',
      logs: '操作記錄',
      aboutUs: '關於我們',
      feedback: '意見回饋',
      currentVersion: '目前版本',
      logout: '登出',
      logoutTitle: '提示',
      logoutContent: '確定要登出嗎？',
      loggedOut: '已登出',
      themeToast: '已切換為',
      languageToast: '語言已設為',
      marketToast: '預設市場已設為',
      notifyToast: '通知頻率已設為',
      subscriptionOn: '訂閱訊息已開啟',
      subscriptionOff: '訂閱訊息已關閉',
      localSubscriptionOn: '已開啟本地訂閱設定',
      subscriptionAuthFail: '訂閱授權失敗',
    },
    market: {
      open: 'MARKET OPEN',
      closed: 'MARKET CLOSED',
      untilClose: '距離收盤',
      untilOpen: '距離開盤',
      todaySchedule: '今日時間表',
      upcomingHolidays: '即將到來的假期',
      fullCalendar: '查看完整日曆',
      tradingCalendar: '交易日曆',
      normalTrading: '正常交易',
      weekendClosed: '週末休市',
      holidayClosed: '法定假日',
      stages: {
        pre: '盤前交易',
        normal: '正常交易',
        post: '盤後交易',
      },
    },
    notification: {
      bannerTitle: '開啟通知，不再錯過交易機會',
      bannerDesc: '訂閱市場開盤提醒，在選定時間接收通知。每次授權僅對單次訊息有效，建議保持關注。',
      marketSubscriptions: '市場訂閱',
      subscriptionDesc: '選擇需要接收通知的市場，並設定提醒時機',
      disabledHint: '已在設定頁關閉訊息訂閱',
      openAt: '開盤',
      timing: '提醒時機：',
      authorizeAll: '一鍵授權訂閱訊息',
      sendTest: '發送測試通知',
      sending: '發送中',
      records: '通知記錄',
      recordsDesc: '最近的交易提醒和系統通知',
      empty: '暫無通知記錄',
      emptyHint: '開啟市場訂閱後，通知將顯示在這裡',
      footer: '提示：微信訂閱訊息需每次手動觸發授權，您開啟訂閱後我們會記錄偏好，但實際發送需要您點擊授權。模板ID請在微信小程式後台「功能 > 訂閱消息」中配置。',
      templateMissing: '請先配置訂閱訊息模板ID',
      enableSettingsFirst: '請先在設定頁開啟訂閱訊息',
      localEnabled: '通知已開啟',
      disabled: '通知已關閉',
      authSuccess: '訂閱授權成功',
      authFail: '授權失敗，請稍後重試',
      authSuggest: '建議授權以接收通知',
      sendSuccess: '測試通知已發送',
      sendFail: '發送失敗，請檢查模板或雲函式',
      timingPrefix: '提醒：',
      timings: {
        at_open: '開盤時',
        '5min_before': '開盤前5分鐘',
        '15min_before': '開盤前15分鐘',
      },
    },
    feedback: {
      type: '回饋類型',
      detail: '詳細描述',
      detailPlaceholder: '請詳細描述您遇到的問題或建議...',
      contact: '聯絡方式（選填）',
      contactPlaceholder: '電子郵件或手機，方便我們回覆您',
      submit: '提交回饋',
      tip: '您的每一條回饋都將幫助我們做得更好，感謝您的支持！',
      submitted: '回饋已提交，感謝您！',
      categories: {
        feature: '功能建議',
        bug: 'Bug 回報',
        ui: '介面優化',
        data: '資料問題',
        other: '其他',
      },
    },
    about: {
      tagline: '全球股市交易時間 · 一目瞭然',
      version: 'Version',
      aboutApp: '關於應用',
      description: 'StocksFlow 是一款專注於全球股市交易時間追蹤的工具型小程式。我們致力於為投資者提供清晰、準確的市場交易時間、假日安排及倒數提醒，幫助您高效把握每一個交易機會。',
      features: '核心功能',
      featureItems: ['全球主要市場交易時間即時顯示', '盤前 / 盤中 / 盤後狀態視覺化', '市場假期日曆與智慧提醒', '個人化市場偏好設定'],
      contactUs: '聯絡我們',
      team: '開發團隊',
      openSource: '開源首頁',
      copyGithub: '複製 GitHub 連結',
      support: '技術支援',
    },
    logs: {
      empty: '系統很安靜，暫無活動記錄',
    },
  },
  en: {
    common: {
      cancel: 'Cancel',
      localTime: 'Local time',
      copied: 'Link copied',
    },
    pages: {
      market: 'Market Hours',
      calendar: 'Market Calendar',
      notification: 'Notifications',
      settings: 'Profile',
      logs: 'Activity Logs',
      about: 'About',
      feedback: 'Feedback',
    },
    tabBar: {
      market: 'Time',
      calendar: 'Calendar',
      notification: 'Alerts',
      settings: 'Profile',
    },
    settings: {
      profileNickname: 'Nickname',
      nicknamePlaceholder: 'Enter nickname',
      loginButton: 'Get profile',
      compatTip: 'Use base library 2.10.4 or later',
      appearance: 'Appearance',
      theme: 'Theme',
      language: 'Language',
      marketPreference: 'Market Preferences',
      defaultMarket: 'Default Market',
      notifications: 'Notifications',
      subscription: 'Push Subscription',
      notifyFrequency: 'Frequency',
      manageSubscriptions: 'Manage Markets',
      subscribed: ' markets subscribed',
      noSubscription: 'None',
      about: 'About',
      logs: 'Activity Logs',
      aboutUs: 'About',
      feedback: 'Feedback',
      currentVersion: 'Version',
      logout: 'Log out',
      logoutTitle: 'Confirm',
      logoutContent: 'Log out of this account?',
      loggedOut: 'Logged out',
      themeToast: 'Theme set to ',
      languageToast: 'Language set to ',
      marketToast: 'Default market set to ',
      notifyToast: 'Frequency set to ',
      subscriptionOn: 'Subscription enabled',
      subscriptionOff: 'Subscription disabled',
      localSubscriptionOn: 'Local subscription saved',
      subscriptionAuthFail: 'Subscription authorization failed',
    },
    market: {
      open: 'MARKET OPEN',
      closed: 'MARKET CLOSED',
      untilClose: 'Until close',
      untilOpen: 'Until open',
      todaySchedule: 'Today Schedule',
      upcomingHolidays: 'Upcoming Holidays',
      fullCalendar: 'Full calendar',
      tradingCalendar: 'Trading Calendar',
      normalTrading: 'Trading',
      weekendClosed: 'Weekend closed',
      holidayClosed: 'Holiday',
      stages: {
        pre: 'Pre-market',
        normal: 'Regular hours',
        post: 'After-hours',
      },
    },
    notification: {
      bannerTitle: 'Enable alerts for market opportunities',
      bannerDesc: 'Subscribe to market open reminders and receive them at your chosen time. WeChat subscription permission is per message.',
      marketSubscriptions: 'Market Subscriptions',
      subscriptionDesc: 'Choose markets and reminder timing',
      disabledHint: 'Push subscription is disabled in Settings',
      openAt: 'Opens',
      timing: 'Timing: ',
      authorizeAll: 'Authorize Subscriptions',
      sendTest: 'Send Test Alert',
      sending: 'Sending',
      records: 'Notification History',
      recordsDesc: 'Recent trading reminders and system notices',
      empty: 'No notifications yet',
      emptyHint: 'Market alerts will appear here after you subscribe',
      footer: 'Note: WeChat subscription messages require manual authorization each time. Preferences are saved locally; actual delivery requires authorization. Configure template IDs in the WeChat Mini Program console.',
      templateMissing: 'Configure subscription template IDs first',
      enableSettingsFirst: 'Enable subscriptions in Settings first',
      localEnabled: 'Notifications enabled',
      disabled: 'Notifications disabled',
      authSuccess: 'Authorization successful',
      authFail: 'Authorization failed, try again later',
      authSuggest: 'Authorize to receive notifications',
      sendSuccess: 'Test alert sent',
      sendFail: 'Send failed; check the template or cloud function',
      timingPrefix: 'Reminder: ',
      timings: {
        at_open: 'At open',
        '5min_before': '5 min before open',
        '15min_before': '15 min before open',
      },
    },
    feedback: {
      type: 'Feedback Type',
      detail: 'Details',
      detailPlaceholder: 'Describe the issue or suggestion...',
      contact: 'Contact (optional)',
      contactPlaceholder: 'Email or phone for follow-up',
      submit: 'Submit Feedback',
      tip: 'Every piece of feedback helps us improve. Thank you.',
      submitted: 'Feedback submitted. Thank you.',
      categories: {
        feature: 'Feature',
        bug: 'Bug',
        ui: 'UI',
        data: 'Data',
        other: 'Other',
      },
    },
    about: {
      tagline: 'Global market hours at a glance',
      version: 'Version',
      aboutApp: 'About the App',
      description: 'StocksFlow tracks global stock market trading hours. It provides clear market schedules, holiday calendars, and countdown reminders so investors can stay aligned with trading windows.',
      features: 'Core Features',
      featureItems: ['Realtime hours for major global markets', 'Pre-market, regular, and after-hours visualization', 'Holiday calendar and smart reminders', 'Personalized market preferences'],
      contactUs: 'Contact',
      team: 'Team',
      openSource: 'Open Source',
      copyGithub: 'Copy GitHub link',
      support: 'Support',
    },
    logs: {
      empty: 'No activity yet',
    },
  },
} as const

export type AppI18n = (typeof I18N)[LanguageCode]

const TAB_BAR_ITEMS = [
  {
    key: 'market' as keyof AppI18n['tabBar'],
    lightIcon: 'public/time.png',
    lightSelectedIcon: 'public/time_active.png',
    darkIcon: 'public/time_dark.png',
    darkSelectedIcon: 'public/time_active_dark.png',
  },
  {
    key: 'calendar' as keyof AppI18n['tabBar'],
    lightIcon: 'public/calendar.png',
    lightSelectedIcon: 'public/calendar_active.png',
    darkIcon: 'public/calendar_dark.png',
    darkSelectedIcon: 'public/calendar_active_dark.png',
  },
  {
    key: 'notification' as keyof AppI18n['tabBar'],
    lightIcon: 'public/notification.png',
    lightSelectedIcon: 'public/notification_active.png',
    darkIcon: 'public/notification_dark.png',
    darkSelectedIcon: 'public/notification_active_dark.png',
  },
  {
    key: 'settings' as keyof AppI18n['tabBar'],
    lightIcon: 'public/profile.png',
    lightSelectedIcon: 'public/profile_active.png',
    darkIcon: 'public/profile_dark.png',
    darkSelectedIcon: 'public/profile_active_dark.png',
  },
]

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = wx.getStorageSync(key)
    return value === undefined || value === null || value === '' ? fallback : value
  } catch {
    return fallback
  }
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'zh-CN' || value === 'zh-TW' || value === 'en'
}

function isMarketId(value: unknown): value is MarketId {
  return value === 'cn' || value === 'hk' || value === 'us' || value === 'uk'
}

function isNotifyFrequency(value: unknown): value is NotifyFrequency {
  return value === 'realtime' || value === 'daily' || value === 'weekly' || value === 'off'
}

function normalizeSettings(raw: Partial<AppSettings>): AppSettings {
  return {
    themeMode: isThemeMode(raw.themeMode) ? raw.themeMode : DEFAULT_SETTINGS.themeMode,
    language: isLanguageCode(raw.language) ? raw.language : DEFAULT_SETTINGS.language,
    defaultMarket: isMarketId(raw.defaultMarket) ? raw.defaultMarket : DEFAULT_SETTINGS.defaultMarket,
    subscriptionEnabled: typeof raw.subscriptionEnabled === 'boolean' ? raw.subscriptionEnabled : DEFAULT_SETTINGS.subscriptionEnabled,
    notifyFrequency: isNotifyFrequency(raw.notifyFrequency) ? raw.notifyFrequency : DEFAULT_SETTINGS.notifyFrequency,
  }
}

function getLegacySettings(): Partial<AppSettings> {
  return {
    themeMode: readStorage<ThemeMode>('settings_themeMode', DEFAULT_SETTINGS.themeMode),
    language: readStorage<LanguageCode>('settings_language', DEFAULT_SETTINGS.language),
    defaultMarket: readStorage<MarketId>('settings_defaultMarket', DEFAULT_SETTINGS.defaultMarket),
    subscriptionEnabled: readStorage<boolean>('settings_subscriptionEnabled', DEFAULT_SETTINGS.subscriptionEnabled),
    notifyFrequency: readStorage<NotifyFrequency>('settings_notifyFrequency', DEFAULT_SETTINGS.notifyFrequency),
  }
}

export function getAppSettings(): AppSettings {
  const stored = readStorage<Partial<AppSettings>>(STORAGE_KEY, {})
  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...getLegacySettings(),
    ...stored,
  })
}

export function saveAppSettings(settings: AppSettings) {
  wx.setStorageSync(STORAGE_KEY, settings)
  Object.keys(settings).forEach((key) => {
    const typedKey = key as keyof AppSettings
    wx.setStorageSync(`settings_${typedKey}`, settings[typedKey])
  })
}

export function setAppSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings {
  const settings = {
    ...getAppSettings(),
    [key]: value,
  }
  const normalized = normalizeSettings(settings)
  saveAppSettings(normalized)
  applyRuntimeSettings()
  return normalized
}

export function getOptionLabel<T extends string>(options: LabeledOption<T>[], value: T, language: LanguageCode): string {
  const option = options.find(item => item.value === value)
  return option ? option.labels[language] : value
}

export function buildActions<T extends string>(options: LabeledOption<T>[], language: LanguageCode, color?: string) {
  return options.map(item => ({
    name: item.labels[language],
    value: item.value,
    ...(color ? { color } : {}),
  }))
}

export function getThemeLabel(value: ThemeMode, language: LanguageCode) {
  return getOptionLabel(THEME_OPTIONS, value, language)
}

export function getLanguageLabel(value: LanguageCode, language: LanguageCode) {
  return getOptionLabel(LANGUAGE_OPTIONS, value, language)
}

export function getMarketLabel(value: MarketId, language: LanguageCode) {
  return getOptionLabel(MARKET_OPTIONS, value, language)
}

export function getNotifyFrequencyLabel(value: NotifyFrequency, language: LanguageCode) {
  return getOptionLabel(NOTIFY_FREQ_OPTIONS, value, language)
}

export function getI18n(language: LanguageCode): AppI18n {
  return I18N[language] || I18N['zh-CN']
}

export function resolveThemeMode(themeMode: ThemeMode): ResolvedTheme {
  if (themeMode === 'light' || themeMode === 'dark') return themeMode

  try {
    const systemInfo = wx.getSystemInfoSync() as WechatMiniprogram.SystemInfo & { theme?: string }
    return systemInfo.theme === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function getRuntimeTheme(settings: AppSettings = getAppSettings()): RuntimeTheme {
  return THEME_PALETTES[resolveThemeMode(settings.themeMode)]
}

function buildThemeVars(theme: RuntimeTheme, language: LanguageCode): string {
  const vars: Record<string, string> = {
    '--app-primary-color': theme.primaryColor,
    '--app-primary-light-color': theme.primaryLightColor,
    '--app-bg-color': theme.bgColor,
    '--app-surface-color': theme.surfaceColor,
    '--app-elevated-color': theme.elevatedColor,
    '--app-text-main-color': theme.textMainColor,
    '--app-text-secondary-color': theme.textSecondaryColor,
    '--app-text-hint-color': theme.textHintColor,
    '--app-border-color': theme.borderColor,
    '--app-shadow-color': theme.shadowColor,
    '--app-glass-color': theme.glassColor,
    '--app-page-gradient': theme.pageGradient,
    '--app-font-family': FONT_FAMILIES[language],
    '--cell-background-color': theme.surfaceColor,
    '--cell-text-color': theme.textMainColor,
    '--cell-value-color': theme.textSecondaryColor,
    '--cell-border-color': theme.borderColor,
    '--cell-group-background-color': theme.surfaceColor,
    '--cell-group-title-color': theme.textSecondaryColor,
    '--cell-label-color': theme.textSecondaryColor,
    '--cell-right-icon-color': theme.textSecondaryColor,
    '--cell-active-color': theme.primaryLightColor,
    '--action-sheet-background-color': theme.surfaceColor,
    '--action-sheet-item-background': theme.surfaceColor,
    '--action-sheet-item-text-color': theme.textMainColor,
    '--action-sheet-cancel-text-color': theme.textMainColor,
    '--action-sheet-cancel-padding-color': theme.bgColor,
    '--action-sheet-description-color': theme.textSecondaryColor,
    '--action-sheet-subname-color': theme.textSecondaryColor,
    '--action-sheet-close-icon-color': theme.textSecondaryColor,
    '--action-sheet-item-disabled-text-color': theme.textHintColor,
    '--popup-background-color': theme.surfaceColor,
    '--popup-close-icon-color': theme.textSecondaryColor,
    '--switch-on-background-color': theme.switchActiveColor,
    '--switch-background-color': theme.borderColor,
    '--switch-node-background-color': theme.surfaceColor,
    '--button-primary-background-color': theme.buttonColor,
    '--button-primary-border-color': theme.buttonColor,
    '--button-info-background-color': theme.buttonColor,
    '--button-info-border-color': theme.buttonColor,
    '--button-default-background-color': theme.surfaceColor,
    '--button-default-border-color': theme.borderColor,
    '--button-default-color': theme.textMainColor,
    '--button-plain-background-color': theme.surfaceColor,
    '--tag-primary-color': theme.primaryColor,
    '--tag-default-color': theme.textHintColor,
    '--calendar-background-color': theme.surfaceColor,
    '--calendar-header-box-shadow': `0 2px 10px ${theme.shadowColor}`,
    '--calendar-month-mark-color': theme.mode === 'dark' ? 'rgba(51, 65, 85, 0.55)' : 'rgba(242, 243, 245, 0.8)',
    '--calendar-day-disabled-color': theme.textHintColor,
    '--calendar-range-edge-background-color': theme.primaryColor,
    '--calendar-range-edge-color': '#FFFFFF',
    '--calendar-range-middle-color': theme.primaryColor,
    '--calendar-selected-day-background-color': theme.primaryColor,
    '--calendar-selected-day-color': '#FFFFFF',
  }

  return Object.keys(vars).map(key => `${key}: ${vars[key]}`).join('; ')
}

export function createRuntimeData(settings: AppSettings = getAppSettings()): RuntimeData {
  const theme = getRuntimeTheme(settings)
  return {
    appSettings: settings,
    appTheme: theme,
    appThemeClass: `theme-${theme.mode}`,
    appThemeVars: buildThemeVars(theme, settings.language),
    appLanguage: settings.language,
    appLanguageClass: `lang-${settings.language.toLowerCase()}`,
    i18n: getI18n(settings.language),
  }
}

function updateTabBarItems(language: LanguageCode, themeMode: ResolvedTheme) {
  const i18n = getI18n(language)
  TAB_BAR_ITEMS.forEach((item, index) => {
    wx.setTabBarItem({
      index,
      text: i18n.tabBar[item.key],
      iconPath: themeMode === 'dark' ? item.darkIcon : item.lightIcon,
      selectedIconPath: themeMode === 'dark' ? item.darkSelectedIcon : item.lightSelectedIcon,
    })
  })
}

function updateOpenPages(settings: AppSettings) {
  const runtimeData = createRuntimeData(settings)
  getCurrentPages().forEach((page) => {
    if (typeof page.setData === 'function') {
      page.setData(runtimeData)
    }
    const pageWithHook = page as WechatMiniprogram.Page.Instance<Record<string, any>, Record<string, any>> & {
      onRuntimeSettingsChange?: (settings: AppSettings, runtimeData: RuntimeData) => void
    }
    if (typeof pageWithHook.onRuntimeSettingsChange === 'function') {
      pageWithHook.onRuntimeSettingsChange(settings, runtimeData)
    }
  })
}

export function applyRuntimeSettings(options: { updatePages?: boolean, platform?: boolean, forcePlatform?: boolean } = {}) {
  const settings = getAppSettings()
  const theme = getRuntimeTheme(settings)
  const platformThemeSignature = [
    theme.mode,
    theme.bgColor,
    theme.navBackgroundColor,
    theme.navFrontColor,
    theme.tabBarColor,
    theme.tabBarSelectedColor,
    theme.tabBarBackgroundColor,
    settings.language,
  ].join('|')
  const shouldApplyPlatformTheme = options.platform !== false && (options.forcePlatform || platformThemeSignature !== lastPlatformThemeSignature)

  if (shouldApplyPlatformTheme) {
    try {
      wx.setBackgroundColor({
        backgroundColor: theme.bgColor,
        backgroundColorTop: theme.bgColor,
        backgroundColorBottom: theme.bgColor,
      })
    } catch {
      // Some base-library versions only support this after page ready.
    }

    try {
      wx.setNavigationBarColor({
        frontColor: theme.navFrontColor,
        backgroundColor: theme.navBackgroundColor,
      })
    } catch {
      // The app uses a custom navigation bar; this is only for platform fallback.
    }

    try {
      wx.setTabBarStyle({
        color: theme.tabBarColor,
        selectedColor: theme.tabBarSelectedColor,
        backgroundColor: theme.tabBarBackgroundColor,
        borderStyle: theme.mode === 'dark' ? 'black' : 'white',
      })
      updateTabBarItems(settings.language, theme.mode)
      lastPlatformThemeSignature = platformThemeSignature
    } catch {
      // setTabBar* can fail before the tab bar is ready; a later app/page show can retry.
    }
  }

  if (options.updatePages !== false) {
    updateOpenPages(settings)
  }

  return createRuntimeData(settings)
}

export function syncRuntimeSettings(target: any): RuntimeData {
  const runtimeData = applyRuntimeSettings({ updatePages: false, platform: false })
  if (target && typeof target.setData === 'function') {
    target.setData(runtimeData)
  }
  return runtimeData
}

export function getSubscribedLabel(activeCount: number, language: LanguageCode): string {
  const i18n = getI18n(language)
  if (activeCount <= 0) return i18n.settings.noSubscription
  if (language === 'en') return `${activeCount}${i18n.settings.subscribed}`
  return `${activeCount}${i18n.settings.subscribed}`
}
