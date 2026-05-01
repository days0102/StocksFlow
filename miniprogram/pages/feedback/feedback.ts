// feedback.ts
import { addLog } from '../../utils/util'
import { createRuntimeData, getAppSettings, getI18n, syncRuntimeSettings } from '../../utils/settings'

const CATEGORY_META = [
  { value: 'feature', icon: '💡' },
  { value: 'bug', icon: '🐛' },
  { value: 'ui', icon: '🎨' },
  { value: 'data', icon: '📊' },
  { value: 'other', icon: '💬' },
]

function buildCategories() {
  const labels = getI18n(getAppSettings().language).feedback.categories
  return CATEGORY_META.map(category => ({
    ...category,
    label: labels[category.value as keyof typeof labels],
  }))
}

Component({
  data: {
    ...createRuntimeData(),
    categories: buildCategories(),
    selectedCategory: '',
    content: '',
    contact: '',
    canSubmit: false,
  },

  lifetimes: {
    attached() {
      this.refreshRuntime()
    },
  },
  pageLifetimes: {
    show() {
      this.refreshRuntime()
    },
  },

  methods: {
    refreshRuntime() {
      syncRuntimeSettings(this)
      this.setData({ categories: buildCategories() })
    },

    onSelectCategory(e: WechatMiniprogram.TouchEvent) {
      const { value } = e.currentTarget.dataset
      this.setData({ selectedCategory: value })
      this.checkCanSubmit()
    },

    onInput(e: any) {
      this.setData({ content: e.detail.value })
      this.checkCanSubmit()
    },

    onContactInput(e: any) {
      this.setData({ contact: e.detail.value })
    },

    checkCanSubmit() {
      const { selectedCategory, content } = this.data
      this.setData({
        canSubmit: !!selectedCategory && content.length >= 10,
      })
    },

    onSubmit() {
      if (!this.data.canSubmit) return

      const { selectedCategory, content, contact } = this.data

      const submissions = wx.getStorageSync('feedback_submissions') || []
      submissions.unshift({
        id: Date.now(),
        selectedCategory,
        content,
        contact,
        createdAt: Date.now(),
      })
      wx.setStorageSync('feedback_submissions', submissions.slice(0, 50))
      addLog('提交意见反馈', buildCategories().find(item => item.value === selectedCategory)?.label || selectedCategory)

      wx.showToast({
        title: getI18n(getAppSettings().language).feedback.submitted,
        icon: 'none',
        duration: 2000,
      })

      // Reset form
      setTimeout(() => {
        this.setData({
          selectedCategory: '',
          content: '',
          contact: '',
          canSubmit: false,
        })
        wx.navigateBack()
      }, 1500)
    },
  },
})
