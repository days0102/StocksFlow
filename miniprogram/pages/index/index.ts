// index.ts
// Get an example of the application
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
import { addLog } from '../../utils/util'

// ── Label maps ──
const THEME_MAP: Record<string, string> = {
  system: '跟随系统',
  light: '浅色模式',
  dark: '深色模式',
}

const MARKET_MAP: Record<string, string> = {
  cn: 'A股',
  hk: '港股',
  us: '美股',
  uk: '英股',
}

const NOTIFY_FREQ_MAP: Record<string, string> = {
  realtime: '实时推送',
  daily: '每日一次',
  weekly: '每周一次',
  off: '关闭',
}

const LANGUAGE_MAP: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
}

Component({
  data: {
    // ── Login (preserved) ──
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),

    // ── Theme ──
    themeMode: 'system',
    themeLabel: '跟随系统',
    showThemeSheet: false,
    themeActions: [
      { name: '跟随系统', value: 'system' },
      { name: '浅色模式', value: 'light' },
      { name: '深色模式', value: 'dark' },
    ],

    // ── Language ──
    language: 'zh-CN',
    languageLabel: '简体中文',
    showLanguageSheet: false,
    languageActions: [
      { name: '简体中文', value: 'zh-CN' },
      { name: '繁體中文', value: 'zh-TW' },
      { name: 'English', value: 'en' },
    ],

    // ── Market ──
    defaultMarket: 'cn',
    defaultMarketLabel: 'A股',
    showMarketSheet: false,
    marketActions: [
      { name: 'A股 (CN)', value: 'cn' },
      { name: '港股 (HK)', value: 'hk' },
      { name: '美股 (US)', value: 'us' },
      { name: '英股 (UK)', value: 'uk' },
    ],

    // ── Notification ──
    subscriptionEnabled: true,
    activeSubCount: 0,
    activeSubLabel: '',
    notifyFrequency: 'daily',
    notifyFreqLabel: '每日一次',
    showNotifySheet: false,
    notifyActions: [
      { name: '实时推送', value: 'realtime' },
      { name: '每日一次', value: 'daily' },
      { name: '每周一次', value: 'weekly' },
      { name: '关闭', value: 'off' },
    ],

    // ── About ──
    appVersion: 'v0.1.0',
  },

  lifetimes: {
    attached() {
      this.loadSettings()
    },
  },

  pageLifetimes: {
    show() {
      const subs = wx.getStorageSync('settings_subscriptions') || []
      const activeCount = subs.filter((s: any) => s.enabled).length
      this.setData({
        activeSubCount: activeCount,
        activeSubLabel: activeCount > 0 ? `${activeCount}个市场已订阅` : '未订阅',
      })
    },
  },

  methods: {
    // ============================================================
    // Login methods (preserved from original)
    // ============================================================
    bindViewTap() {
      wx.switchTab({
        url: '/pages/notification/notification',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // It is recommended to use wx.getUserProfile to obtain user information,
      // and the developer needs to confirm the user's personal information every
      // time the user obtains the user's personal information through this interface
      wx.getUserProfile({
        // Please fill in the information carefully as the purpose of obtaining
        // the user's personal information will be displayed in the pop-up window later
        desc: '展示用户信息',
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },

    // ============================================================
    // Settings persistence
    // ============================================================
    loadSettings() {
      const themeMode = wx.getStorageSync('settings_themeMode') || 'system'
      const language = wx.getStorageSync('settings_language') || 'zh-CN'
      const defaultMarket = wx.getStorageSync('settings_defaultMarket') || 'cn'
      const subscriptionEnabled = wx.getStorageSync('settings_subscriptionEnabled')
      const notifyFrequency = wx.getStorageSync('settings_notifyFrequency') || 'daily'

      // Load saved user info
      const savedUserInfo = wx.getStorageSync('settings_userInfo')
      const hasUserInfo = wx.getStorageSync('settings_hasUserInfo') || false

      // Load active subscription count
      const subs = wx.getStorageSync('settings_subscriptions') || []
      const activeCount = subs.filter((s: any) => s.enabled).length

      this.setData({
        themeMode,
        themeLabel: THEME_MAP[themeMode] || '跟随系统',
        language,
        languageLabel: LANGUAGE_MAP[language] || '简体中文',
        defaultMarket,
        defaultMarketLabel: MARKET_MAP[defaultMarket] || 'A股',
        subscriptionEnabled: subscriptionEnabled === '' ? true : subscriptionEnabled,
        notifyFrequency,
        notifyFreqLabel: NOTIFY_FREQ_MAP[notifyFrequency] || '每日一次',
        activeSubCount: activeCount,
        activeSubLabel: activeCount > 0 ? `${activeCount}个市场已订阅` : '未订阅',
        ...(savedUserInfo ? { userInfo: savedUserInfo, hasUserInfo } : {}),
      })
    },

    saveSettings(key: string, value: any) {
      wx.setStorageSync(`settings_${key}`, value)
      // Only log specific setting changes explicitly in their specific handlers to provide better localized labels 
    },

    // ============================================================
    // Theme
    // ============================================================
    showThemeSheet() {
      this.setData({ showThemeSheet: true })
    },
    onThemeSheetClose() {
      this.setData({ showThemeSheet: false })
    },
    onThemeSelect(e: any) {
      const { value } = e.detail
      this.setData({
        themeMode: value,
        themeLabel: THEME_MAP[value],
        showThemeSheet: false,
      })
      this.saveSettings('themeMode', value)
      addLog('更改主题模式', `变更为: ${THEME_MAP[value]}`)
      wx.showToast({ title: '已切换为' + THEME_MAP[value], icon: 'none', duration: 1500 })
    },

    // ============================================================
    // Language
    // ============================================================
    showLanguageSheet() {
      this.setData({ showLanguageSheet: true })
    },
    onLanguageSheetClose() {
      this.setData({ showLanguageSheet: false })
    },
    onLanguageSelect(e: any) {
      const { value } = e.detail
      this.setData({
        language: value,
        languageLabel: LANGUAGE_MAP[value],
        showLanguageSheet: false,
      })
      this.saveSettings('language', value)
      addLog('更改首选语言', `变更为: ${LANGUAGE_MAP[value]}`)
      wx.showToast({ title: '语言已设为' + LANGUAGE_MAP[value], icon: 'none', duration: 1500 })
    },

    // ============================================================
    // Market
    // ============================================================
    showMarketSheet() {
      this.setData({ showMarketSheet: true })
    },
    onMarketSheetClose() {
      this.setData({ showMarketSheet: false })
    },
    onMarketSelect(e: any) {
      const { value } = e.detail
      this.setData({
        defaultMarket: value,
        defaultMarketLabel: MARKET_MAP[value],
        showMarketSheet: false,
      })
      this.saveSettings('defaultMarket', value)
      addLog('更改默认市场', `变更为: ${MARKET_MAP[value]}`)
      wx.showToast({ title: '默认市场已设为' + MARKET_MAP[value], icon: 'none', duration: 1500 })
    },

    // ============================================================
    // Notifications
    // ============================================================
    onSubscriptionToggle(e: any) {
      const enabled = e.detail
      this.setData({ subscriptionEnabled: enabled })
      this.saveSettings('subscriptionEnabled', enabled)
      addLog('消息订阅服务', enabled ? '开启订阅服务' : '关闭订阅服务')

      if (enabled) {
        // Request subscription message permission
        wx.requestSubscribeMessage({
          tmplIds: [],  // TODO: fill in actual template IDs
          success: () => {
            wx.showToast({ title: '订阅消息已开启', icon: 'none' })
          },
          fail: () => {
            wx.showToast({ title: '订阅授权失败', icon: 'none' })
          }
        })
      } else {
        wx.showToast({ title: '订阅消息已关闭', icon: 'none' })
      }
    },

    showNotifySheet() {
      this.setData({ showNotifySheet: true })
    },
    onNotifySheetClose() {
      this.setData({ showNotifySheet: false })
    },
    onNotifyFreqSelect(e: any) {
      const { value } = e.detail
      this.setData({
        notifyFrequency: value,
        notifyFreqLabel: NOTIFY_FREQ_MAP[value],
        showNotifySheet: false,
      })
      this.saveSettings('notifyFrequency', value)
      addLog('更改通知频率', `变更为: ${NOTIFY_FREQ_MAP[value]}`)
      wx.showToast({ title: '通知频率已设为' + NOTIFY_FREQ_MAP[value], icon: 'none', duration: 1500 })
    },

    // ============================================================
    // Navigation
    // ============================================================
    goToLogs() {
      wx.navigateTo({ url: '/pages/logs/logs' })
    },
    goToNotifications() {
      wx.switchTab({ url: '/pages/notification/notification' })
    },
    goToAbout() {
      wx.navigateTo({ url: '/pages/about/about' })
    },
    goToFeedback() {
      wx.navigateTo({ url: '/pages/feedback/feedback' })
    },

    // ============================================================
    // Logout
    // ============================================================
    onLogout() {
      wx.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              userInfo: {
                avatarUrl: defaultAvatarUrl,
                nickName: '',
              },
              hasUserInfo: false,
            })
            this.saveSettings('userInfo', null)
            this.saveSettings('hasUserInfo', false)
            addLog('退出登录', '账号已注销')
            wx.showToast({ title: '已退出登录', icon: 'none' })
          }
        }
      })
    },
  },
})
