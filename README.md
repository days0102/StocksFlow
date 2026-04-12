# StocksFlow

## Introduction

A WeChat Mini Program designed to track trading sessions and market holidays across major global stock exchanges.

---

## Project Structure

```text
.
├── miniprogram/
│   ├── app.ts                  # Mini Program entry logic
│   ├── app.json                # Global page and window configuration
│   ├── app.less                # Global styles
│   ├── sitemap.json            # Search indexing configuration
│   ├── components/
│   │   └── navigation-bar/     # Custom navigation bar component
│   ├── pages/
│   │   ├── index/              # Home page (currently a template)
│   │   └── logs/               # Startup logs page
│   └── utils/
│       └── util.ts             # Utility for time formatting
├── typings/                    # WeChat Mini Program type definitions
├── package.json                # npm configuration
├── tsconfig.json               # TypeScript compilation configuration
├── project.config.json         # WeChat DevTools project configuration
└── project.private.config.json # Local private configuration
```

---

## Features Implemented

The current version includes the following core capabilities:

* **Authentication**: Automated `wx.login` call upon application startup.
* **Logging**: Persistent local storage for application startup logs.
* **Components**: A pre-built custom navigation bar component.
* **UI/UX**: Template-based home page and logs viewing page.
* **Utilities**: A basic time formatting tool.

---

## Getting Started

### 1. Prerequisites

Ensure you have the following installed:
* [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (Stable version recommended)
* [Node.js](https://nodejs.org/) (LTS version recommended)

### 2. Setup and Installation

Clone the repository and install dependencies via terminal:

```bash
git clone https://github.com/days0102/StocksFlow.git
cd StocksFlow
npm install
```

### 3. Importing the Project

1. Launch **WeChat DevTools** and click **Import**.
2. **Project Directory**: Select the root folder of this repository.
3. **AppID**: You may use the default `touristappid` or your own test ID.

---

## Contributors

* [@days0102](https://github.com/days0102)
* [@ixpqxi](https://github.com/ixpqxi)