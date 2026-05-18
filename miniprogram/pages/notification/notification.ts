import {
  MarketId,
  createRuntimeData,
  getAppSettings,
  getI18n,
  getMarketLabel,
  syncRuntimeSettings,
} from '../../utils/settings'
import { addLog } from '../../utils/util'
import {
  TimingValue,
  buildMarketOpenSubscribePayload,
  getConfiguredSubscribeTemplateIds,
  getNotificationMessages,
  getStoredSubscriptions,
  markNotificationMessageRead,
  refreshSubscribeTemplateConfig,
  requestSubscribeAuthorization,
  saveStoredSubscriptions,
  sendSubscribeMessage,
} from '../../services/notificationService'

const MARKET_LIST = [
  { id: 'cn' as MarketId, icon: 'CN', openTime: '09:30' },
  { id: 'hk' as MarketId, icon: 'HK', openTime: '09:30' },
  { id: 'us' as MarketId, icon: 'US', openTime: '09:30' },
  { id: 'uk' as MarketId, icon: 'UK', openTime: '08:00' },
]

const TIMING_VALUES: TimingValue[] = ['at_open', '5min_before', '15min_before']

function getTimingLabel(value: TimingValue) {
  return getI18n(getAppSettings().language).notification.timings[value]
}

function buildTimingOptions() {
  const actionTextColor = createRuntimeData(getAppSettings()).appTheme.textMainColor
  return TIMING_VALUES.map(value => ({
    name: getTimingLabel(value),
    value,
    color: actionTextColor,
  }))
}

Component({
  data: {
    ...createRuntimeData(),
    marketList: MARKET_LIST,
    timingOptions: buildTimingOptions(),
    subscriptions: [] as any[],
    activeMarketIndex: -1,
    showTimingSheet: false,
    notifyMessages: [] as any[],
    tmplIds: getConfiguredSubscribeTemplateIds(),
    subscriptionEnabled: getAppSettings().subscriptionEnabled,
    notifyFrequency: getAppSettings().notifyFrequency,
    sendingTest: false,
  },

  lifetimes: {
    attached() {
      this.loadData()
    },
  },

  pageLifetimes: {
    show() {
      this.loadData()
    },
  },

  methods: {
    loadData() {
      syncRuntimeSettings(this)
      const settings = getAppSettings()
      const saved = getStoredSubscriptions()
      const subscriptions = MARKET_LIST.map(market => {
        const savedSub = saved.find((s: any) => s.marketId === market.id)
        const timing = ((savedSub && savedSub.timing) || '15min_before') as TimingValue

        return {
          marketId: market.id,
          marketName: getMarketLabel(market.id, settings.language),
          marketIcon: market.icon,
          openTime: market.openTime,
          enabled: savedSub ? savedSub.enabled : false,
          timing,
          timingLabel: getTimingLabel(timing),
        }
      })

      this.setData({
        subscriptions,
        timingOptions: buildTimingOptions(),
        notifyMessages: getNotificationMessages(),
        tmplIds: getConfiguredSubscribeTemplateIds(),
        subscriptionEnabled: settings.subscriptionEnabled,
        notifyFrequency: settings.notifyFrequency,
      })
      this.refreshTemplateConfig()
    },

    async refreshTemplateConfig() {
      const templateConfig = await refreshSubscribeTemplateConfig()
      this.setData({ tmplIds: templateConfig.templateIds })
    },

    persistSubscriptions() {
      const subs = this.data.subscriptions.map((s: any) => ({
        marketId: s.marketId,
        enabled: s.enabled,
        timing: s.timing,
      }))
      saveStoredSubscriptions(subs)
    },

    updateSub(index: number, patch: Record<string, any>) {
      const data: Record<string, any> = {}
      Object.keys(patch).forEach((key) => {
        data[`subscriptions[${index}].${key}`] = patch[key]
      })
      this.setData(data)
      this.persistSubscriptions()
    },

    async onMarketToggle(e: any) {
      const index = e.currentTarget.dataset.index
      const enabled = e.detail
      const sub = this.data.subscriptions[index]
      const i18n = getI18n(getAppSettings().language).notification

      if (enabled && !this.data.subscriptionEnabled) {
        wx.showToast({ title: i18n.enableSettingsFirst, icon: 'none' })
        this.updateSub(index, { enabled: false })
        return
      }

      if (enabled) {
        const tmplIds = getConfiguredSubscribeTemplateIds()
        if (tmplIds.length === 0) {
          this.updateSub(index, { enabled: true })
          wx.showToast({ title: i18n.templateMissing, icon: 'none', duration: 2200 })
          return
        }

        const authResult = await requestSubscribeAuthorization(tmplIds)
        this.updateSub(index, { enabled: true })
        if (authResult.acceptedTemplateIds.length > 0) {
          wx.showToast({ title: `${sub.marketName}${i18n.localEnabled}`, icon: 'none' })
        } else {
          wx.showToast({ title: i18n.authSuggest, icon: 'none', duration: 2000 })
        }
      } else {
        this.updateSub(index, { enabled: false })
        wx.showToast({ title: `${sub.marketName}${i18n.disabled}`, icon: 'none' })
      }
    },

    showTimingPicker(e: any) {
      const index = e.currentTarget.dataset.index
      this.setData({
        showTimingSheet: true,
        activeMarketIndex: index,
      })
    },

    onTimingSheetClose() {
      this.setData({ showTimingSheet: false })
    },

    onTimingSelect(e: any) {
      const value = e.detail.value as TimingValue
      const index = this.data.activeMarketIndex
      this.updateSub(index, {
        timing: value,
        timingLabel: getTimingLabel(value),
      })
      this.setData({ showTimingSheet: false })

      const sub = this.data.subscriptions[index]
      const i18n = getI18n(getAppSettings().language).notification
      wx.showToast({
        title: `${sub.marketName}${i18n.timingPrefix}${getTimingLabel(value)}`,
        icon: 'none',
        duration: 1500,
      })
    },

    async onAuthorizeAll() {
      const i18n = getI18n(getAppSettings().language).notification
      const tmplIds = getConfiguredSubscribeTemplateIds()
      if (tmplIds.length === 0) {
        wx.showToast({ title: i18n.templateMissing, icon: 'none', duration: 2200 })
        return
      }

      const result = await requestSubscribeAuthorization(tmplIds)
      wx.showToast({
        title: result.acceptedTemplateIds.length > 0 ? i18n.authSuccess : i18n.authFail,
        icon: 'none',
      })
    },

    async onSendTestNotification() {
      if (this.data.sendingTest) return

      const settings = getAppSettings()
      const i18n = getI18n(settings.language).notification

      if (!settings.subscriptionEnabled) {
        wx.showToast({ title: i18n.enableSettingsFirst, icon: 'none' })
        return
      }

      const tmplIds = getConfiguredSubscribeTemplateIds()
      if (tmplIds.length === 0) {
        wx.showToast({ title: i18n.templateMissing, icon: 'none', duration: 2200 })
        return
      }

      const targetSub = this.data.subscriptions.find((item: any) => item.enabled) || this.data.subscriptions[0]
      if (!targetSub) return

      this.setData({ sendingTest: true })
      const authResult = await requestSubscribeAuthorization(tmplIds)
      const templateId = authResult.acceptedTemplateIds[0]

      if (!templateId) {
        this.setData({ sendingTest: false })
        wx.showToast({ title: i18n.authSuggest, icon: 'none', duration: 2000 })
        return
      }

      const payload = buildMarketOpenSubscribePayload({
        templateId,
        marketName: targetSub.marketName,
        timingLabel: targetSub.timingLabel,
        openTime: targetSub.openTime,
      })
      const result = await sendSubscribeMessage(payload)
      this.setData({
        sendingTest: false,
        notifyMessages: getNotificationMessages(),
      })

      addLog('发送通知', result.ok ? `已发送: ${targetSub.marketName}` : `发送失败: ${result.msg}`)
      wx.showToast({
        title: result.ok ? i18n.sendSuccess : i18n.sendFail,
        icon: 'none',
        duration: 2000,
      })
    },

    onTapMessage(e: any) {
      const { index } = e.currentTarget.dataset
      if (index !== undefined) {
        markNotificationMessageRead(index)
        this.setData({ [`notifyMessages[${index}].read`]: true })
      }
    },
  },
})
