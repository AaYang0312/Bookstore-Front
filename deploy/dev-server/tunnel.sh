#!/bin/zsh

set -euo pipefail

readonly TUNNEL_LABEL="com.codex.bookstore-tunnel"
readonly TUNNEL_DOMAIN="gui/$(id -u)"
readonly TUNNEL_SERVICE="${TUNNEL_DOMAIN}/${TUNNEL_LABEL}"
readonly SCRIPT_DIR="${0:A:h}"
readonly TUNNEL_PLIST="${SCRIPT_DIR}/${TUNNEL_LABEL}.plist"

is_running() {
    launchctl print "${TUNNEL_SERVICE}" >/dev/null 2>&1
}

show_status() {
    if ! is_running; then
        echo "书城 SSH 隧道：已停止"
        return 0
    fi

    local service_state
    local service_pid
    service_state="$(launchctl print "${TUNNEL_SERVICE}" | awk -F'= ' '/state =/{print $2; exit}')"
    service_pid="$(launchctl print "${TUNNEL_SERVICE}" | awk -F'= ' '/pid =/{print $2; exit}')"

    echo "书城 SSH 隧道：${service_state:-已加载}，PID ${service_pid:-未知}"
}

case "${1:-status}" in
    start)
        if is_running; then
            echo "书城 SSH 隧道已经启动"
            show_status
            exit 0
        fi

        launchctl bootstrap "${TUNNEL_DOMAIN}" "${TUNNEL_PLIST}"
        echo "书城 SSH 隧道已启动；断线时 launchd 会自动重连"
        show_status
        ;;
    stop)
        if ! is_running; then
            echo "书城 SSH 隧道已经停止"
            exit 0
        fi

        launchctl bootout "${TUNNEL_SERVICE}"
        echo "书城 SSH 隧道已停止，不会继续重连"
        ;;
    status)
        show_status
        ;;
    restart)
        if is_running; then
            launchctl bootout "${TUNNEL_SERVICE}"
        fi
        launchctl bootstrap "${TUNNEL_DOMAIN}" "${TUNNEL_PLIST}"
        echo "书城 SSH 隧道已重新启动"
        show_status
        ;;
    *)
        echo "用法：$0 {start|stop|restart|status}" >&2
        exit 2
        ;;
esac
