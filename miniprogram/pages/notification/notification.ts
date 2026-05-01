import {
  MarketId,
  SUBSCRIBE_TEMPLATE_IDS,
  createRuntimeData,
  getAppSettings,
  getI18n,
  getMarketLabel,
  syncRuntimeSettings,
} from '../../utils/settings'

type TimingValue = 'at_open' | '5min_before' | '15min_before'

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

function generateMockMessages() {
  const now = new Date()
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const days: Date[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d)
  }

  return [
    {
      id: 'm1',
      type: 'market_open',
      title: 'A股即将开盘',
      marketName: 'A股',
      time: '09:15',
      date: fmt(days[0]),
      content: 'A股将于15分钟后开盘，请关注今日行情。',
      read: false,
    },
    {
      id: 'm2',
      type: 'market_open',
      title: '港股即将开盘',
      marketName: '港股',
      time: '09:25',
      date: fmt(days[0]),
      content: '港股将于5分钟后开盘，恒指期货小幅走高。',
      read: false,
    },
    {
      id: 'm3',
      type: 'market_close',
      title: '美股收盘回顾',
      marketName: '美股',
      time: '16:00',
      date: fmt(days[1]),
      content: '美股已收盘，道指上涨0.5%，纳指上涨0.3%。',
      read: true,
    },
    {
      id: 'm4',
      type: 'holiday',
      title: '美股休市提醒',
      marketName: '美股',
      time: '08:00',
      date: fmt(days[2]),
      content: '今日美股因阵亡将士纪念日休市，明日恢复交易。',
      read: true,
    },
    {
      id: 'm5',
      type: 'market_open',
      title: '英股即将开盘',
      marketName: '英股',
      time: '07:50',
      date: fmt(days[3]),
      content: '英股将于10分钟后开盘，富时100指数期货上涨。',
      read: true,
    },
    {
      id: 'm6',
      type: 'system',
      title: '通知功能已上线',
      marketName: '系统',
      time: '12:00',
      date: fmt(days[5]),
      content: '现在可以订阅市场开盘提醒，设置提醒时机，不错过交易机会。',
      read: true,
    },
  ]
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
    tmplIds: SUBSCRIBE_TEMPLATE_IDS,
    subscriptionEnabled: getAppSettings().subscriptionEnabled,
    notifyFrequency: getAppSettings().notifyFrequency,
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
      const saved = wx.getStorageSync('settings_subscriptions') || []
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
        notifyMessages: generateMockMessages(),
        tmplIds: SUBSCRIBE_TEMPLATE_IDS,
        subscriptionEnabled: settings.subscriptionEnabled,
        notifyFrequency: settings.notifyFrequency,
      })
    },

    persistSubscriptions() {
      const subs = this.data.subscriptions.map((s: any) => ({
        marketId: s.marketId,
        enabled: s.enabled,
        timing: s.timing,
      }))
      wx.setStorageSync('settings_subscriptions', subs)
    },

    updateSub(index: number, patch: Record<string, any>) {
      const data: Record<string, any> = {}
      Object.keys(patch).forEach(k => {
        data[`subscriptions[${index}].${k}`] = patch[k]
      })
      this.setData(data)
      this.persistSubscriptions()
    },

    onMarketToggle(e: any) {
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
        if (this.data.tmplIds.length === 0) {
          this.updateSub(index, { enabled: true })
          wx.showToast({ title: `${sub.marketName}${i18n.localEnabled}`, icon: 'none' })
          return
        }

        wx.requestSubscribeMessage({
          tmplIds: this.data.tmplIds,
          success: () => {
            this.updateSub(index, { enabled: true })
            wx.showToast({ title: `${sub.marketName}${i18n.localEnabled}`, icon: 'none' })
          },
          fail: () => {
            // 用户拒绝授权但也保存偏好，后续可重新授权
            this.updateSub(index, { enabled: true })
            wx.showToast({ title: i18n.authSuggest, icon: 'none', duration: 2000 })
          },
        })
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

    onAuthorizeAll() {
      const i18n = getI18n(getAppSettings().language).notification
      wx.requestSubscribeMessage({
        tmplIds: this.data.tmplIds,
        success: () => {
          wx.showToast({ title: i18n.authSuccess, icon: 'none' })
        },
        fail: () => {
          wx.showToast({ title: i18n.authFail, icon: 'none' })
        },
      })
    },

    onTapMessage(e: any) {
      const { index } = e.currentTarget.dataset
      if (index !== undefined) {
        this.setData({ [`notifyMessages[${index}].read`]: true })
      }
    },
  },
})
