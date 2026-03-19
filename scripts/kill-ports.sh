#!/bin/bash
# Kill processes using HR service ports
set -e

PORTS=(5010 5011 5012 5013 5020 5021 5023 5379 5380 5080)

echo "Checking for processes using HR ports..."

for PORT in "${PORTS[@]}"; do
    PID=$(fuser $PORT/tcp 2>/dev/null | awk '{print $1}' || true)

    if [ -z "$PID" ]; then
        PID=$(ss -tlnp | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1 || true)
    fi

    if [ -n "$PID" ]; then
        echo "Killing process $PID using port $PORT"
        kill $PID 2>/dev/null || true
        sleep 1
        kill -0 $PID 2>/dev/null && kill -9 $PID 2>/dev/null || true
    else
        echo "Port $PORT is free"
    fi
done

echo "Done!"
