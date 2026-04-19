export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export const addLog = (action: string, detail: string = '') => {
  const logs = wx.getStorageSync('logs') || []
  logs.unshift({
    time: Date.now(),
    action,
    detail
  })
  if (logs.length > 50) logs.pop()
  wx.setStorageSync('logs', logs)
}
