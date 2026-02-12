#!/usr/bin/env bash
set -euo pipefail

SESSION="autofeed5174"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

has_session() {
  # macOS `screen -ls` exits with code 1 even when sessions exist.
  (screen -ls 2>/dev/null || true) | grep -q "${SESSION}" || return 1
}

cmd="${1:-}"
case "$cmd" in
  start)
    if has_session; then
      echo "screen session already running: ${SESSION}"
      exit 0
    fi

    # Use login shell so PATH/NVM etc work as expected.
    screen -S "$SESSION" -dm bash -lc "cd \"$ROOT\" && node scripts/dev-full.js --watch"
    echo "started screen session: ${SESSION}"
    ;;
  stop)
    screen -S "$SESSION" -X quit >/dev/null 2>&1 || true
    echo "stopped screen session: ${SESSION}"
    ;;
  attach)
    exec screen -r "$SESSION"
    ;;
  status)
    if has_session; then
      echo "running: ${SESSION}"
    else
      echo "not running: ${SESSION}"
      exit 1
    fi
    ;;
  *)
    cat <<EOF
Usage: $0 <start|stop|attach|status>

Starts/stops a detached screen session running the full userscript dev server on 127.0.0.1:5174.
EOF
    exit 2
    ;;
esac
