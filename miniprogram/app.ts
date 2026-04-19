// app.ts
import { addLog } from './utils/util'

App<IAppOption>({
  globalData: {},
  onLaunch() {
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
})