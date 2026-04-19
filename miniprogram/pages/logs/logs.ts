// logs.ts
import { formatTime } from '../../utils/util'

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
  return { icon: 'setting-o', bg: 'bg-gray' }
}

Component({
  data: {
    logs: [] as any[],
  },
  lifetimes: {
    attached() {
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
          action: actionStr,
          detail: detailStr,
          icon: meta.icon,
          bgClass: meta.bg
        }
      })
      this.setData({ logs })
    }
  },
})
