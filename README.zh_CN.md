# StocksFlow

## 简介

微信小程序项目，用于跟踪全球知名证券交易所的交易时段与休市安排。

---

## 当前目录结构

```text
.
├── miniprogram/
│   ├── app.ts                     # 小程序入口逻辑
│   ├── app.json                   # 全局页面与窗口配置
│   ├── app.less                   # 全局样式
│   ├── sitemap.json               # 小程序索引配置
│   ├── components/
│   │   └── navigation-bar/        # 自定义导航栏组件
│   ├── pages/
│   │   ├── index/                 # 首页，当前仍是模板示例页面
│   │   └── logs/                  # 启动日志页
│   └── utils/
│       └── util.ts                # 通用时间格式化工具
├── typings/                       # 微信小程序类型声明
├── package.json                   # npm 配置
├── tsconfig.json                  # TypeScript 编译配置
├── project.config.json            # 微信开发者工具项目配置
└── project.private.config.json    # 本地私有配置
```

---

## 当前已实现内容

目前代码中已经存在的能力只有：

- 小程序启动时调用 `wx.login`
- 使用本地存储记录启动日志
- 一个自定义导航栏组件
- 一个模板首页
- 一个日志查看页
- 一个简单的时间格式化工具函数

---

## 快速开始

### 1. 环境准备

+ [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
+ [Node.js](https://nodejs.org/)

### 2. 获取源码与依赖

```sh
git clone https://github.com/days0102/StocksFlow.git
cd StocksFlow
npm install
```

### 3. 导入项目

打开微信开发者工具，点击导入项目：

+ 项目目录：选择项目根目录
+ AppID：可直接使用默认配置

仓库目前没有额外的构建脚本，主要依赖微信开发者工具进行编译和预览。

---

## 贡献者

* [@days0102](https://github.com/days0102)
* [@ixpqxi](https://github.com/ixpqxi)


