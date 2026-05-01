// about.ts
import { APP_VERSION, createRuntimeData, getAppSettings, getI18n, syncRuntimeSettings } from '../../utils/settings'

Component({
  data: {
    ...createRuntimeData(),
    appVersion: APP_VERSION,
    githubLink: 'https://github.com/days0102/StocksFlow',
  },
  lifetimes: {
    attached() {
      syncRuntimeSettings(this)
    },
  },
  pageLifetimes: {
    show() {
      syncRuntimeSettings(this)
    },
  },
  methods: {
    copyGithubLink() {
      wx.setClipboardData({
        data: this.data.githubLink,
        success() {
          wx.showToast({
            title: getI18n(getAppSettings().language).common.copied,
            icon: 'success'
          })
        }
      })
    }
  }
})
