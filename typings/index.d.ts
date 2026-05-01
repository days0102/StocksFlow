/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    settings?: import('../miniprogram/utils/settings').AppSettings,
    runtimeData?: import('../miniprogram/utils/settings').RuntimeData,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
