# 博学书城前端

博学书城前端是一个基于 React 18 的在线书城应用。项目目前包含面向读者的商城、购书 Agent 助手和管理员后台三部分，与 Go 后端 `Bookstore_Backend` 及可选的 Python Agent 服务 `bookstore-agent` 配合运行。

## 当前功能

### 读者端

- 首页轮播图、分类入口、精选图书、热销榜和新书展示
- 暖色编辑型视觉系统、SVG 图标、本地主视觉兜底和浅色/深色模式
- 图书搜索、分类浏览和图书详情
- 用户注册、验证码登录、个人资料与密码修改
- 图书收藏、购物车、订单创建、支付和历史订单
- 登录状态、购物车数据的浏览器本地持久化
- 响应式页面布局与加入购物车动画
- 桌面与移动端均提供 44px 以上触控目标、可见焦点和减少动态效果支持

### 购书助手

- 商城页面右下角提供购书 Agent 入口
- 支持连续对话、流式文本、Markdown 和表格内容
- 支持展示图书推荐卡片、打开图书详情和加入购物车
- 请求最近 10 条有效对话记录，可主动停止生成

### 管理后台

- 数据概览：图书、用户、订单、收入、库存和销售趋势
- 图书管理：查询、新增、编辑和上下架
- 分类管理：新增、编辑、排序和启停
- 订单管理：查询、筛选和状态调整
- 用户管理：查询用户和分配管理员角色
- 轮播图管理：新增、编辑、排序和启停
- `/admin` 路由会校验登录用户的 `is_admin` 字段；普通用户和未登录用户无法进入
- 深色侧栏运营工作台、响应式抽屉导航、数据表格、状态标签和具备焦点管理的编辑弹窗

管理后台默认调用真实后端接口。只有显式设置 `REACT_APP_ADMIN_DEMO_MODE=true` 时，真实接口失败后才会回退到保存在 `localStorage` 中的演示数据。

## 技术栈

- React 18.2
- React Router 6.8
- Create React App / React Scripts 5
- React Context
- React Markdown + remark-gfm
- CSS3
- Fetch API
- Nginx（生产环境静态文件服务）

## 环境要求

- Node.js 18 或更高版本
- npm
- 已启动的 Go 后端，默认地址为 `http://localhost:8080`
- 如需使用购书助手，需额外启动 `bookstore-agent`，默认地址为 `http://localhost:8000`

## 本地开发

进入前端目录并安装依赖：

```bash
cd bookstore-fronted-master
npm install
```

在项目根目录创建 `.env.local`。本地完整联调可使用：

```dotenv
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
REACT_APP_AGENT_API_URL=http://localhost:8000/api/v1/agent/chat
REACT_APP_ADMIN_DEMO_MODE=false
```

启动开发服务器：

```bash
npm start
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。修改环境变量后需要重新启动开发服务器。

> 所有商城、用户、收藏、订单和管理请求都通过 `src/config/api.js` 读取统一 API 地址。本地未配置时默认使用 `http://localhost:8080/api/v1`；Docker 构建则使用同源 `/api/v1`。

## 常用命令

```bash
npm start          # 启动开发服务器
npm run build      # 生成生产构建到 build/ 目录
npm test           # 以交互模式运行测试
```

## 页面路由

### 商城路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页 |
| `/book/:id` | 图书详情 |
| `/category/:category` | 分类图书 |
| `/search?q=关键词` | 搜索结果 |
| `/cart` | 购物车 |
| `/payment/:orderId` | 订单支付 |
| `/orders` | 历史订单 |
| `/favorites` | 收藏列表 |
| `/profile` | 个人资料 |

### 管理后台路由

| 路径 | 页面 |
| --- | --- |
| `/admin` | 数据概览 |
| `/admin/books` | 图书管理 |
| `/admin/categories` | 分类管理 |
| `/admin/orders` | 订单管理 |
| `/admin/users` | 用户管理 |
| `/admin/carousel` | 轮播图管理 |

登录用户的后端资料需要返回 `is_admin: true`，头像菜单才会显示“管理后台”入口，路由守卫也才会允许访问。

## 项目结构

```text
bookstore-fronted-master/
├── public/
│   └── images/                    # 首页本地主视觉及优化后的 WebP 资源
├── src/
│   ├── admin/
│   │   ├── components/             # 后台通用组件和权限守卫
│   │   ├── layout/                 # 后台侧栏与页面框架
│   │   ├── pages/                  # 后台业务页面
│   │   ├── services/adminApi.js    # 真实管理接口及可选演示回退
│   │   └── styles/                 # 后台样式
│   ├── components/
│   │   ├── StoreIcon.js           # 商城统一 SVG 图标
│   │   └── AgentAssistant/         # 购书助手、流式请求和推荐卡片
│   ├── contexts/                   # 用户、购物车、收藏和动画状态
│   ├── config/api.js               # 商城与 Agent 的统一接口地址
│   ├── layouts/StoreLayout.js      # 商城公共头部、页脚和购书助手
│   ├── pages/                      # 商城详情、分类、搜索和订单页面
│   ├── App.js                      # Context 装配和页面路由
│   └── index.js                    # React 入口
├── Dockerfile                      # 前端生产镜像构建
├── compose.yaml                    # 三项目及 MySQL、Redis 一键编排
├── .env.docker.example             # Compose 环境变量示例
├── nginx.conf                      # Nginx 静态服务及 API 代理
└── package.json
```

## 登录状态和本地数据

- 登录成功后，访问令牌以 `token` 为键保存在 `localStorage` 中。
- 页面启动时会通过 `/user/profile` 恢复用户资料和管理员身份。
- 收藏、订单、个人资料和管理接口会携带 `Authorization: Bearer <token>`。
- 购物车由 React Context 管理，并同步保存到 `localStorage`。
- 退出登录会清除本地令牌和用户状态；当前 Go 后端尚未注册 `DELETE /user/logout`，因此暂时没有服务端令牌失效流程。
- 管理后台演示模式的数据使用 `bookstore_admin_demo_v1` 键保存在 `localStorage`。

## 服务与接口关系

| 功能 | 本地联调地址 | 说明 |
| --- | --- | --- |
| 商城及用户接口 | `http://localhost:8080/api/v1` | 由 `Bookstore_Backend` 提供 |
| 管理后台接口 | `http://localhost:8080/api/v1/admin/*` | 需要 JWT 且用户具有管理员权限 |
| 购书助手 | `http://localhost:8000/api/v1/agent/chat` | 需通过 `REACT_APP_AGENT_API_URL` 指向 `bookstore-agent`；未配置时前端代码会请求 8080 端口 |

后端目前已经注册首页轮播、分类、图书、收藏、订单详情及管理后台接口。Go 后端的安装、数据库配置和完整路由见 [后端 README](../Bookstore_Backend/README.md)，Agent 的模型配置和启动方式见 [Agent README](../bookstore-agent/README.md)。

## 生产构建

```bash
npm run build
```

构建产物位于 `build/`，可部署到任意支持 SPA 回退的静态服务器。使用 Nginx 时，需要将未知页面路径回退到 `index.html`，否则直接刷新 React Router 页面会返回 404。

Create React App 会在构建阶段写入 `REACT_APP_*` 环境变量，部署后修改容器环境变量不会自动改变已经生成的静态文件。

## Docker 一键部署

`compose.yaml` 会构建并启动以下服务：

- `bookstore-frontend`：React 生产构建与 Nginx，端口 3000
- `bookstore-backend`：Go API，端口 8080
- `bookstore-agent`：FastAPI Agent，端口 8000
- `mysql`：MySQL 8.4，首次启动自动执行建表和示例数据脚本
- `redis`：Redis 7，保存缓存、验证码和限流数据

首次启动：

```bash
cp .env.docker.example .env.docker
# 编辑 .env.docker，至少替换 MODEL_API_KEY、TAVILY_API_KEY 和共享环境的 MySQL 密码
docker compose --env-file .env.docker up --build -d
docker compose ps
```

服务全部变为 `healthy` 后访问：

| 服务 | 地址 |
| --- | --- |
| 书城页面 | `http://localhost:3000` |
| Go API | `http://localhost:8080/api/v1` |
| Agent API 文档 | `http://localhost:8000/docs` |

查看日志与停止服务：

```bash
docker compose --env-file .env.docker logs -f
docker compose --env-file .env.docker down
```

MySQL 与 Redis 使用命名数据卷，普通 `down` 不会删除数据。若确实要清空数据库并重新导入 SQL，可以执行 `docker compose --env-file .env.docker down -v`；该命令会永久删除 Compose 创建的数据卷。

前端镜像在构建阶段将 API 地址设置为同源路径。Nginx 把 `/api/v1/agent/*` 转发给 Agent，其余 `/api/*` 转发给 Go 后端，因此浏览器不需要知道容器服务名，也不会再绕过代理访问硬编码的 `localhost:8080`。

## 当前联调边界

- Go 后端、MySQL 和 Redis 应先于前端启动。
- Compose 已通过健康检查和 `depends_on` 自动处理 MySQL、Redis、Go 后端、Agent、前端的启动顺序。
- 购书助手是独立的可选服务；未启动时商城其他功能不受影响，助手面板会显示连接失败提示。
- 管理后台默认不会用演示数据掩盖真实接口错误；需要纯前端演示时才设置 `REACT_APP_ADMIN_DEMO_MODE=true`。
- 前端会发起 `DELETE /user/logout`，但当前 Go 后端没有对应路由；退出操作目前依赖清除浏览器本地登录状态。
