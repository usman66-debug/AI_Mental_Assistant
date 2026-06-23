# AI心理健康助手

> 一次温暖的对话，化孤独为慰藉

基于 Vue 3 构建的 AI 心理健康助手，为用户提供情感陪伴、情绪记录和心理健康知识服务。

## 测试账户

后台账号：admin
密码：123456

前台账密：自行注册

## 🌟 功能特性

### 用户端功能

- **AI 心理咨询**：与 AI 助手进行情感对话，获得温暖的陪伴和支持
- **情绪日记**：记录每日心情，追踪情绪变化趋势
- **知识文章**：浏览心理健康相关的专业知识和文章
- **情绪识别**：支持多种情绪标签（开心、悲伤、焦虑、平静等）

### 管理后台功能

- **数据分析仪表盘**：实时展示用户数据、咨询统计、情绪趋势
- **知识文章管理**：创建、编辑、删除心理健康知识文章
- **咨询记录管理**：查看和管理用户与 AI 的对话记录
- **情绪日志管理**：查看用户的情绪记录数据

## 🛠️ 技术栈

| 技术         | 版本    | 说明         |
| ------------ | ------- | ------------ |
| Vue          | ^3.5.32 | 前端框架     |
| Vue Router   | ^5.0.4  | 路由管理     |
| Pinia        | ^3.0.4  | 状态管理     |
| Element Plus | ^2.14.0 | UI 组件库    |
| ECharts      | ^6.1.0  | 数据可视化   |
| Vite         | ^8.0.8  | 构建工具     |
| Sass         | ^1.97.2 | CSS 预处理器 |
| axios        | ^1.16.1 | HTTP 客户端  |

## 📁 项目结构

```
src/
├── apis/                 # API 请求封装
│   ├── admin.js          # 后台接口
│   └── frontend.js       # 前台接口
├── assets/               # 静态资源
│   ├── images/           # 图片资源
│   └── *.css             # 样式文件
├── components/           # 组件
│   ├── backend/          # 后台组件
│   │   ├── BackendLayout.vue   # 后台布局
│   │   ├── SideBar.vue         # 侧边栏
│   │   ├── NavBar.vue          # 导航栏
│   │   └── RichTextEditor.vue  # 富文本编辑器
│   └── frontend/         # 前台组件
│       └── FrontendLayout.vue  # 前台布局
├── config/               # 配置文件
├── router/               # 路由配置
├── stores/               # Pinia 状态管理
├── utils/                # 工具函数
└── views/                # 页面视图
    ├── AuthLayoutCom/    # 认证页面
    │   ├── LoginView.vue
    │   └── RegisterView.vue
    ├── backend/          # 后台页面
    │   ├── DashBoard.vue
    │   ├── KnowledgeView.vue
    │   ├── ConsultationView.vue
    │   └── EmotionalView.vue
    └── frontend/         # 前台页面
        ├── HomeView.vue
        ├── FrontKnowledgeView.vue
        ├── ConsultationView.vue
        ├── EmotionDiary.vue
        └── ArticleDetail.vue
```

## 🚀 快速开始

### 环境要求

- Node.js >= 22.12.0 或 ^20.19.0
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 开发模式

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 生产构建

启动后访问 http://localhost:5173

### 生产构建

````bash
```bash
npm run build
````

### 代码检查

### 代码检查

````bash
```bash
npm run lint
````

### 代码格式化

```bash
npm run format
```

## 🔧 配置说明

项目配置文件位于 `src/config/index.js`：

```js
export const imgUrlAt = 'http://159.75.169.224:1235'
```

## 📱 页面路由

| 路径                 | 页面     | 说明             |
| -------------------- | -------- | ---------------- |
| `/`                  | 首页     | 用户端首页       |
| `/knowledge`         | 知识文章 | 心理健康知识列表 |
| `/consultation`      | AI 咨询  | AI 心理咨询对话  |
| `/emotion-diary`     | 情绪日记 | 情绪记录页面     |
| `/auth/login`        | 登录     | 用户登录         |
| `/auth/register`     | 注册     | 用户注册         |
| `/back/dashboard`    | 数据看板 | 后台数据分析     |
| `/back/knowledge`    | 文章管理 | 知识文章管理     |
| `/back/consultation` | 咨询管理 | 咨询记录管理     |
| `/back/emotional`    | 情绪管理 | 情绪日志管理     |

## 🎨 设计特色

- **温暖的配色方案**：以绿色为主色调，传递治愈和安心感
- **响应式设计**：支持桌面端和移动端访问
- **流畅的动画效果**：页面切换和交互都有平滑的过渡效果

## 📄 许可证

MIT License

---

**让温暖触手可及** ❤️

### 代码格式化

```bash
npm run format
```

## 🔧 配置说明

项目配置文件位于 `src/config/index.js`：

```js
export const imgUrlAt = 'http://159.75.169.224:1235'
```

## 📱 页面路由

| 路径                 | 页面     | 说明             |
| -------------------- | -------- | ---------------- |
| `/`                  | 首页     | 用户端首页       |
| `/knowledge`         | 知识文章 | 心理健康知识列表 |
| `/consultation`      | AI 咨询  | AI 心理咨询对话  |
| `/emotion-diary`     | 情绪日记 | 情绪记录页面     |
| `/auth/login`        | 登录     | 用户登录         |
| `/auth/register`     | 注册     | 用户注册         |
| `/back/dashboard`    | 数据看板 | 后台数据分析     |
| `/back/knowledge`    | 文章管理 | 知识文章管理     |
| `/back/consultation` | 咨询管理 | 咨询记录管理     |
| `/back/emotional`    | 情绪管理 | 情绪日志管理     |

## 🎨 设计特色

- **温暖的配色方案**：以绿色为主色调，传递治愈和安心感
- **响应式设计**：支持桌面端和移动端访问
- **流畅的动画效果**：页面切换和交互都有平滑的过渡效果

## 📄 许可证

MIT License

---

**让温暖触手可及** ❤️
