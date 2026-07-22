# syntax=docker/dockerfile:1

# 使用Node.js官方镜像作为构建环境
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# Create React App 在构建阶段写入这些地址。容器内统一使用同源路径，
# 再由 Nginx 转发到对应服务。
ARG REACT_APP_API_BASE_URL=/api/v1
ARG REACT_APP_AGENT_API_URL=/api/v1/agent/chat
ARG REACT_APP_ADMIN_DEMO_MODE=false
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL} \
    REACT_APP_AGENT_API_URL=${REACT_APP_AGENT_API_URL} \
    REACT_APP_ADMIN_DEMO_MODE=${REACT_APP_ADMIN_DEMO_MODE}

# 构建应用
RUN npm run build

# 使用nginx作为生产环境
FROM nginx:alpine

# 复制构建产物到nginx目录
COPY --from=builder /app/build /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
