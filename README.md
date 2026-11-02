# xray-node

Node.js launcher for Xray (VLESS + WebSocket) on PaaS platforms (Render / Northflank / Velixir).

At startup it downloads the pinned Xray release, writes a config from environment
variables, and runs it:

- `UUID` (required) — VLESS user id
- `WS_PATH` — WebSocket path, default `/ray`
- `PORT` — listen port, provided by the platform
