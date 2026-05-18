// index.ts
import { addLog } from '../../utils/util'
import {
  APP_VERSION,
  AppSettings,
  LANGUAGE_OPTIONS,
  LanguageCode,
  MARKET_OPTIONS,
  MarketId,
  NOTIFY_FREQ_OPTIONS,
  NotifyFrequency,
  THEME_OPTIONS,
  ThemeMode,
  buildActions,
  createRuntimeData,
  getAppSettings,
  getI18n,
  getLanguageLabel,
  getMarketLabel,
  getNotifyFrequencyLabel,
  getSubscribedLabel,
  getThemeLabel,
  setAppSetting,
  syncRuntimeSettings,
} from '../../utils/settings'
import {
  getConfiguredSubscribeTemplateIds,
  refreshSubscribeTemplateConfig,
  requestSubscribeAuthorization,
} from '../../services/notificationService'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

function getActiveSubCount() {
  const subs = wx.getStorageSync('settings_subscriptions') || []
  return subs.filter((s: any) => s.enabled).length
}

function getSettingsData(settings: AppSettings = getAppSettings()) {
  const activeCount = getActiveSubCount()
  const runtimeData = createRuntimeData(settings)
  const actionTextColor = runtimeData.appTheme.textMainColor

  return {
    ...runtimeData,
    themeMode: settings.themeMode,
    themeLabel: getThemeLabel(settings.themeMode, settings.language),
    themeActions: buildActions(THEME_OPTIONS, settings.language, actionTextColor),
    language: settings.language,
    languageLabel: getLanguageLabel(settings.language, settings.language),
    languageActions: buildActions(LANGUAGE_OPTIONS, settings.language, actionTextColor),
    defaultMarket: settings.defaultMarket,
    defaultMarketLabel: getMarketLabel(settings.defaultMarket, settings.language),
    marketActions: buildActions(MARKET_OPTIONS, settings.language, actionTextColor),
    subscriptionEnabled: settings.subscriptionEnabled,
    notifyFrequency: settings.notifyFrequency,
    notifyFreqLabel: getNotifyFrequencyLabel(settings.notifyFrequency, settings.language),
    notifyActions: buildActions(NOTIFY_FREQ_OPTIONS, settings.language, actionTextColor),
    activeSubCount: activeCount,
    activeSubLabel: getSubscribedLabel(activeCount, settings.language),
    appVersion: APP_VERSION,
  }
}

Component({
  data: {
    ...getSettingsData(),

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
    showThemeSheet: false,

    // ── Language ──
    showLanguageSheet: false,

    // ── Market ──
    showMarketSheet: false,

    // ── Notification ──
    showNotifySheet: false,
  },

  lifetimes: {
    attached() {
      this.loadSettings()
    },
  },

  pageLifetimes: {
    show() {
      this.loadSettings()
    },
  },

  methods: {
    // ============================================================
    // Login methods (preserved from original)
    // ============================================================
    persistUserInfo(userInfo: { avatarUrl: string, nickName: string }) {
      const hasUserInfo = !!(userInfo.nickName && userInfo.avatarUrl && userInfo.avatarUrl !== defaultAvatarUrl)
      wx.setStorageSync('settings_userInfo', userInfo)
      wx.setStorageSync('settings_hasUserInfo', hasUserInfo)
      return hasUserInfo
    },
    bindViewTap() {
      wx.switchTab({
        url: '/pages/notification/notification',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      const userInfo = { ...this.data.userInfo, avatarUrl }
      const hasUserInfo = this.persistUserInfo(userInfo)
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: hasUserInfo || !!(nickName && avatarUrl && avatarUrl !== defaultAvatarUrl),
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      const userInfo = { ...this.data.userInfo, nickName }
      const hasUserInfo = this.persistUserInfo(userInfo)
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: hasUserInfo || !!(nickName && avatarUrl && avatarUrl !== defaultAvatarUrl),
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
          wx.setStorageSync('settings_userInfo', res.userInfo)
          wx.setStorageSync('settings_hasUserInfo', true)
          addLog('登录', '更新头像昵称')
        }
      })
    },

    // ============================================================
    // Settings persistence
    // ============================================================
    loadSettings() {
      const settings = getAppSettings()
      syncRuntimeSettings(this)
      refreshSubscribeTemplateConfig()

      const savedUserInfo = wx.getStorageSync('settings_userInfo')
      const hasUserInfo = wx.getStorageSync('settings_hasUserInfo') || false

      this.setData({
        ...getSettingsData(settings),
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
      const value = e.detail.value as ThemeMode
      const settings = setAppSetting('themeMode', value)
      const label = getThemeLabel(value, settings.language)
      this.setData({
        themeMode: value,
        themeLabel: label,
        showThemeSheet: false,
      })
      this.loadSettings()
      addLog('更改主题模式', `变更为: ${label}`)
      wx.showToast({ title: `${getI18n(settings.language).settings.themeToast}${label}`, icon: 'none', duration: 1500 })
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
      const value = e.detail.value as LanguageCode
      const settings = setAppSetting('language', value)
      const label = getLanguageLabel(value, value)
      this.setData({
        language: value,
        languageLabel: label,
        showLanguageSheet: false,
      })
      this.loadSettings()
      addLog('更改首选语言', `变更为: ${label}`)
      wx.showToast({ title: `${getI18n(settings.language).settings.languageToast}${label}`, icon: 'none', duration: 1500 })
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
      const value = e.detail.value as MarketId
      const settings = setAppSetting('defaultMarket', value)
      const label = getMarketLabel(value, settings.language)
      this.setData({
        defaultMarket: value,
        defaultMarketLabel: label,
        showMarketSheet: false,
      })
      this.loadSettings()
      addLog('更改默认市场', `变更为: ${label}`)
      wx.showToast({ title: `${getI18n(settings.language).settings.marketToast}${label}`, icon: 'none', duration: 1500 })
    },

    // ============================================================
    // Notifications
    // ============================================================
    async onSubscriptionToggle(e: any) {
      const enabled = e.detail
      const settings = setAppSetting('subscriptionEnabled', enabled)
      const i18n = getI18n(settings.language)
      this.setData({ subscriptionEnabled: enabled })
      this.loadSettings()
      addLog('消息订阅服务', enabled ? '开启订阅服务' : '关闭订阅服务')

      if (enabled) {
        const tmplIds = getConfiguredSubscribeTemplateIds()
        if (tmplIds.length === 0) {
          wx.showToast({ title: i18n.settings.localSubscriptionOn, icon: 'none' })
          return
        }

        const authResult = await requestSubscribeAuthorization(tmplIds)
        wx.showToast({
          title: authResult.acceptedTemplateIds.length > 0 ? i18n.settings.subscriptionOn : i18n.settings.subscriptionAuthFail,
          icon: 'none',
        })
      } else {
        wx.showToast({ title: i18n.settings.subscriptionOff, icon: 'none' })
      }
    },

    showNotifySheet() {
      this.setData({ showNotifySheet: true })
    },
    onNotifySheetClose() {
      this.setData({ showNotifySheet: false })
    },
    onNotifyFreqSelect(e: any) {
      const value = e.detail.value as NotifyFrequency
      let settings = setAppSetting('notifyFrequency', value)
      if (value === 'off') {
        settings = setAppSetting('subscriptionEnabled', false)
      }
      const label = getNotifyFrequencyLabel(value, settings.language)
      this.setData({
        notifyFrequency: value,
        notifyFreqLabel: label,
        showNotifySheet: false,
      })
      this.loadSettings()
      addLog('更改通知频率', `变更为: ${label}`)
      wx.showToast({ title: `${getI18n(settings.language).settings.notifyToast}${label}`, icon: 'none', duration: 1500 })
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
      const i18n = getI18n(getAppSettings().language)
      wx.showModal({
        title: i18n.settings.logoutTitle,
        content: i18n.settings.logoutContent,
        success: (res) => {
          if (res.confirm) {
            this.setData({
              userInfo: {
                avatarUrl: defaultAvatarUrl,
                nickName: '',
              },
              hasUserInfo: false,
            })
            wx.removeStorageSync('settings_userInfo')
            this.saveSettings('hasUserInfo', false)
            addLog('退出登录', '账号已注销')
            wx.showToast({ title: i18n.settings.loggedOut, icon: 'none' })
          }
        }
      })
    },
  },
})
