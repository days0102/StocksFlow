// feedback.ts
Component({
  data: {
    categories: [
      { label: '功能建议', value: 'feature', icon: '💡' },
      { label: 'Bug 报告', value: 'bug', icon: '🐛' },
      { label: '界面优化', value: 'ui', icon: '🎨' },
      { label: '数据问题', value: 'data', icon: '📊' },
      { label: '其他', value: 'other', icon: '💬' },
    ],
    selectedCategory: '',
    content: '',
    contact: '',
    canSubmit: false,
  },

  methods: {
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

      // TODO: Send to backend API
      console.log('Feedback submitted:', { selectedCategory, content, contact })

      wx.showToast({
        title: '反馈已提交，感谢您！',
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
