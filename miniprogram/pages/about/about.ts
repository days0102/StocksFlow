// about.ts
Component({
  data: {
    appVersion: 'v0.1.0',
    githubLink: 'https://github.com/days0102/StocksFlow',
  },
  methods: {
    copyGithubLink() {
      wx.setClipboardData({
        data: this.data.githubLink,
        success() {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        }
      })
    }
  }
})
