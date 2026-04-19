// logs.ts - 通知设置页面

interface NotificationType {
  type: string;
  title: string;
  description: string;
  icon: string;
  subscribed: boolean;
}

interface FrequencyOption {
  value: string;
  label: string;
}

Component({
  data: {
    notificationTypes: [] as NotificationType[],
    frequencyOptions: [
      { value: 'realtime', label: '实时通知' },
      { value: 'hourly', label: '每小时汇总' },
      { value: 'daily', label: '每日汇总' },
      { value: 'weekly', label: '每周汇总' }
    ] as FrequencyOption[],
    selectedFrequency: 'realtime',
    hasUnsavedChanges: false
  },

  lifetimes: {
    attached() {
      this.loadNotificationSettings();
    }
  },

  methods: {
    // 加载通知设置
    loadNotificationSettings() {
      // 从本地存储加载已保存的设置
      const savedSettings = wx.getStorageSync('notificationSettings') || {};
      
      // 默认通知类型列表
      const defaultNotifications: NotificationType[] = [
        {
          type: 'system',
          title: '系统通知',
          description: '系统更新、维护公告等重要信息',
          icon: '🔔',
          subscribed: savedSettings.system !== undefined ? savedSettings.system : true
        },
        {
          type: 'market',
          title: '市场动态',
          description: '市场价格波动、交易提醒',
          icon: '📈',
          subscribed: savedSettings.market !== undefined ? savedSettings.market : true
        },
        {
          type: 'calendar',
          title: '日历提醒',
          description: '日程安排、事件提醒',
          icon: '📅',
          subscribed: savedSettings.calendar !== undefined ? savedSettings.calendar : true
        },
        {
          type: 'promotion',
          title: '优惠活动',
          description: '促销活动、优惠券发放',
          icon: '🎁',
          subscribed: savedSettings.promotion !== undefined ? savedSettings.promotion : false
        }
      ];

      this.setData({
        notificationTypes: defaultNotifications,
        selectedFrequency: savedSettings.frequency || 'realtime'
      });
    },

    // 切换通知订阅状态
    onToggleNotification(e: any) {
      const { type } = e.currentTarget.dataset;
      const subscribed = e.detail.value;
      
      const { notificationTypes } = this.data;
      const updatedTypes = notificationTypes.map(item => {
        if (item.type === type) {
          return { ...item, subscribed };
        }
        return item;
      });

      this.setData({
        notificationTypes: updatedTypes,
        hasUnsavedChanges: true
      });

      // 显示提示
      wx.showToast({
        title: subscribed ? '已开启通知' : '已关闭通知',
        icon: 'none',
        duration: 1500
      });
    },

    // 选择通知频率
    onFrequencyChange(e: any) {
      const frequency = e.detail.value;
      this.setData({
        selectedFrequency: frequency,
        hasUnsavedChanges: true
      });
    },

    // 保存设置
    onSaveSettings() {
      const { notificationTypes, selectedFrequency } = this.data;
      
      // 构建设置对象
      const settings: Record<string, any> = {
        frequency: selectedFrequency
      };
      
      notificationTypes.forEach(item => {
        settings[item.type] = item.subscribed;
      });

      // 保存到本地存储
      wx.setStorageSync('notificationSettings', settings);
      
      this.setData({
        hasUnsavedChanges: false
      });

      wx.showToast({
        title: '设置已保存',
        icon: 'success',
        duration: 2000
      });

      // 可以在这里添加订阅微信模板消息的逻辑
      this.subscribeToWechatNotifications(settings);
    },

    // 订阅微信模板消息（示例）
    subscribeToWechatNotifications(settings: Record<string, any>) {
      // 获取已订阅的通知类型
      const subscribedTypes = settings.notificationTypes
        ? Object.keys(settings).filter(key => settings[key] === true && key !== 'frequency')
        : [];
      
      // 如果需要请求微信订阅消息权限，可以在此处添加
      // wx.requestSubscribeMessage({
      //   tmplIds: ['template_id_1', 'template_id_2'],
      //   success(res) {
      //     console.log('订阅成功', res);
      //   }
      // });
      
      console.log('订阅的消息类型:', subscribedTypes);
      console.log('通知频率:', settings.frequency);
    }
  },
})
