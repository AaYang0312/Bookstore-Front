# dev-server 前端与本地后端部署

公网入口：

- 书城：`http://47.120.34.148/bookstore/`
- 前端健康检查：`http://47.120.34.148/bookstore-health`
- 现有博客：`http://47.120.34.148/`

## 本地服务

在 `bookstore-fronted-master` 目录运行：

```bash
docker compose --env-file ../bookstore-agent/.env \
  up --build -d mysql redis bookstore-backend bookstore-agent
```

Go 后端和 Agent 默认只绑定本机 `127.0.0.1:8080` 与
`127.0.0.1:8000`。MySQL、Redis 不发布宿主机端口。

## 反向 SSH 隧道

隧道采用按需启动模式。启动后由 macOS LaunchAgent
`com.codex.bookstore-tunnel` 保活和自动重连；停止后不会继续尝试连接。

快速启动：

```bash
./deploy/dev-server/tunnel.sh start
```

快速停止：

```bash
./deploy/dev-server/tunnel.sh stop
```

查看状态或重新连接：

```bash
./deploy/dev-server/tunnel.sh status
./deploy/dev-server/tunnel.sh restart
```

服务器端反向端口仅绑定 `127.0.0.1:18080` 和
`127.0.0.1:18000`，分别转发到本地 Go 后端和 Agent。

## 更新前端

```bash
PUBLIC_URL=/bookstore \
REACT_APP_API_BASE_URL=/bookstore-api/v1 \
REACT_APP_AGENT_API_URL=/bookstore-api/v1/agent/chat \
REACT_APP_ADMIN_DEMO_MODE=false \
npm run build

rsync -az build/ dev-server:/var/www/bookstore/
```

服务器 Nginx 配置源文件为 `bookstore.conf`，线上位置为
`/etc/nginx/conf.d/bookstore.conf`。更新后应先运行 `nginx -t`，
检查通过再执行 `systemctl reload nginx`。
