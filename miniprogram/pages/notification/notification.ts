const MARKET_LIST = [
  { id: 'cn', name: 'A股', icon: '🇨🇳', openTime: '09:30' },
  { id: 'hk', name: '港股', icon: '🇭🇰', openTime: '09:30' },
  { id: 'us', name: '美股', icon: '🇺🇸', openTime: '09:30' },
  { id: 'uk', name: '英股', icon: '🇬🇧', openTime: '08:00' },
]

const TIMING_OPTIONS = [
  { name: '开盘时', value: 'at_open' },
  { name: '开盘前5分钟', value: '5min_before' },
  { name: '开盘前15分钟', value: '15min_before' },
]

const TIMING_MAP: Record<string, string> = {
  at_open: '开盘时',
  '5min_before': '开盘前5分钟',
  '15min_before': '开盘前15分钟',
}

// 微信订阅消息模板ID — 在微信小程序后台「订阅消息」中配置后填入
// WeChat subscription message template IDs — configure in WeChat Mini Program Console
const TMPL_IDS: string[] = []

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
    marketList: MARKET_LIST,
    timingOptions: TIMING_OPTIONS,
    subscriptions: [] as any[],
    activeMarketIndex: -1,
    showTimingSheet: false,
    notifyMessages: [] as any[],
    tmplIds: TMPL_IDS,
  },

  lifetimes: {
    attached() {
      this.loadData()
    },
  },

  methods: {
    loadData() {
      const saved = wx.getStorageSync('settings_subscriptions') || []
      const subscriptions = MARKET_LIST.map(market => {
        const savedSub = saved.find((s: any) => s.marketId === market.id)
        const timing = (savedSub && savedSub.timing) || '15min_before'
        return {
          marketId: market.id,
          marketName: market.name,
          marketIcon: market.icon,
          openTime: market.openTime,
          enabled: savedSub ? savedSub.enabled : false,
          timing,
          timingLabel: TIMING_MAP[timing] || '开盘前15分钟',
        }
      })

      this.setData({
        subscriptions,
        notifyMessages: generateMockMessages(),
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

      if (enabled) {
        wx.requestSubscribeMessage({
          tmplIds: this.data.tmplIds,
          success: () => {
            this.updateSub(index, { enabled: true })
            wx.showToast({ title: `${sub.marketName}通知已开启`, icon: 'none' })
          },
          fail: () => {
            // 用户拒绝授权但也保存偏好，后续可重新授权
            this.updateSub(index, { enabled: true })
            wx.showToast({ title: '建议授权以接收通知', icon: 'none', duration: 2000 })
          },
        })
      } else {
        this.updateSub(index, { enabled: false })
        wx.showToast({ title: `${sub.marketName}通知已关闭`, icon: 'none' })
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
      const { value } = e.detail
      const index = this.data.activeMarketIndex
      this.updateSub(index, {
        timing: value,
        timingLabel: TIMING_MAP[value] || value,
      })
      this.setData({ showTimingSheet: false })

      const sub = this.data.subscriptions[index]
      wx.showToast({
        title: `${sub.marketName}提醒：${TIMING_MAP[value]}`,
        icon: 'none',
        duration: 1500,
      })
    },

    onAuthorizeAll() {
      wx.requestSubscribeMessage({
        tmplIds: this.data.tmplIds,
        success: () => {
          wx.showToast({ title: '订阅授权成功', icon: 'none' })
        },
        fail: () => {
          wx.showToast({ title: '授权失败，请稍后重试', icon: 'none' })
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
