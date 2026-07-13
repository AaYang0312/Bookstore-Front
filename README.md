# 博学书城前端

博学书城前端是一个基于 React 的在线书城应用，与 `Bookstore_Backend` 配合提供图书浏览、搜索、收藏、购物车、下单和用户中心等功能。

## 功能特性

- 首页图书、热销榜和新书展示
- 图书搜索、分类浏览和详情页
- 用户注册、登录与个人资料管理
- 图书收藏与收藏列表
- 购物车、订单创建、支付和历史订单
- 响应式页面布局与加入购物车动画

## 技术栈

- React 18.2
- React Router 6.8
- Create React App / React Scripts 5
- CSS3
- Fetch API
- Nginx（生产环境静态文件服务）

## 环境要求

- Node.js 18 或更高版本
- npm
- 已启动的博学书城后端，默认地址为 `http://localhost:8080`

## 本地开发

进入前端目录后安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm start
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。页面中的 API 请求目前直接访问 `http://localhost:8080/api/v1`，因此联调前需先启动后端。

## 常用命令

```bash
npm start          # 启动开发服务器
npm run build      # 生成生产构建到 build/ 目录
npm test           # 以交互模式运行测试
```

## 页面路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/book/:id` | 图书详情 |
| `/category/:category` | 分类图书 |
| `/search` | 搜索结果 |
| `/cart` | 购物车 |
| `/payment` | 创建订单并支付 |
| `/payment/:orderId` | 指定订单支付 |
| `/orders` | 历史订单 |
| `/favorites` | 收藏列表 |
| `/profile` | 个人资料 |

## 项目结构

```text
bookstore-fronted-master/
├── public/                 # HTML 模板和公共静态资源
├── src/
│   ├── components/         # 头部、图书卡片、登录弹窗等通用组件
│   ├── contexts/           # 用户、购物车、收藏和动画状态
│   ├── pages/              # 详情、分类、搜索、订单等页面
│   ├── App.js              # 全局 Context 与页面路由
│   ├── App.css             # 应用级样式
│   ├── index.js            # React 入口
│   └── index.css           # 全局基础样式
├── Dockerfile              # 前端生产镜像构建
├── nginx.conf              # Nginx 静态服务及 API 反向代理配置
└── package.json
```

## 登录状态和本地数据

- 登录成功后，访问令牌保存在浏览器 `localStorage` 中，用户信息由 React Context 管理。
- 需要登录的收藏、订单和个人资料请求会携带 `Authorization: Bearer <token>`。
- 购物车状态由 React Context 管理，并同步保存到 `localStorage`。

## 生产构建

```bash
npm run build
```

构建产物位于 `build/`，可部署到任意支持 SPA 回退的静态服务器。使用 Nginx 时，需要将未知页面路径回退到 `index.html`，否则直接刷新 React Router 页面会返回 404。

## Docker 运行

构建并启动前端镜像：

```bash
docker build -t bookstore-frontend .
docker run --rm -p 3000:3000 bookstore-frontend
```

镜像中的 Nginx 在 3000 端口提供页面，并将 `/api/` 代理到 `bookstore-backend:8080`。若通过 Docker Compose 运行，请将后端服务命名为 `bookstore-backend`，或同步修改 `nginx.conf` 中的地址。

> 注意：当前源码中的 API 地址是完整的 `http://localhost:8080`，不会经过 Nginx 的 `/api/` 代理。若要将前端和后端完整容器化，应先把请求地址统一改为相对路径或可配置的环境变量。

## 后端接口

后端的安装、配置和完整路由列表见 [后端 README](../Bookstore_Backend/README.md)。

## 已知联调事项

当前前端还会请求分类列表、轮播图、退出登录、分类图书和订单详情接口，但现有后端路由尚未注册这些接口。相关页面联调前，需要补充后端实现，或调整前端以使用现有接口。
