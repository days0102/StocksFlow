// app.ts
import { addLog } from './utils/util'
import { applyRuntimeSettings, getAppSettings } from './utils/settings'
import { injectCloudMock } from './utils/mockCloud'

const accountInfo = wx.getAccountInfoSync?.()
if (wx.cloud?.init) {
  wx.cloud.init({ traceUser: true })
}
if (accountInfo?.miniProgram?.envVersion !== 'release') {
  injectCloudMock()
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    const runtimeData = applyRuntimeSettings({ updatePages: false })
    this.globalData.settings = runtimeData.appSettings
    this.globalData.runtimeData = runtimeData

    let logs = wx.getStorageSync('logs') || []
    if (logs.length > 0 && typeof logs[0] === 'number') {
      logs = logs.map((time: number) => ({ time, action: '应用启动', detail: 'App Launch' }))
      wx.setStorageSync('logs', logs)
    }
    addLog('应用启动', '小程序拉起/初始化')

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
  onShow() {
    const runtimeData = applyRuntimeSettings()
    this.globalData.settings = runtimeData.appSettings
    this.globalData.runtimeData = runtimeData
  },
  onThemeChange() {
    if (getAppSettings().themeMode !== 'system') return

    const runtimeData = applyRuntimeSettings()
    this.globalData.settings = runtimeData.appSettings
    this.globalData.runtimeData = runtimeData
  },
})
