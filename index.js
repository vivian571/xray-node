// Xray launcher for PaaS (Northflank / Velixir style):
// - downloads the Xray binary at runtime (pinned release, linux amd64/arm64)
// - writes a VLESS + WebSocket inbound config from env vars
// - env: UUID (required), WS_PATH (default /ray), PORT (platform-provided)
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const XRAY_VERSION = process.env.XRAY_VERSION || 'v25.10.15';
const UUID = process.env.UUID;
const WS_PATH = process.env.WS_PATH || '/ray';
const PORT = parseInt(process.env.PORT || '8080', 10);
if (!UUID) { console.error('FATAL: UUID env var is required'); process.exit(1); }

const arch = os.arch() === 'arm64' ? 'arm64-v8a' : '64';
const dir = path.join(os.tmpdir(), 'xray');
fs.mkdirSync(dir, { recursive: true });
const zip = path.join(dir, 'xray.zip');
const url = `https://github.com/XTLS/Xray-core/releases/download/${XRAY_VERSION}/Xray-linux-${arch}.zip`;
console.log('downloading', url);
execFileSync('curl', ['-fsSL', '-o', zip, url], { stdio: 'inherit' });
execFileSync('unzip', ['-o', zip, '-d', dir], { stdio: 'inherit' });
fs.chmodSync(path.join(dir, 'xray'), 0o755);

const config = {
  log: { loglevel: 'warning' },
  inbounds: [{
    listen: '0.0.0.0',
    port: PORT,
    protocol: 'vless',
    settings: { clients: [{ id: UUID }], decryption: 'none' },
    streamSettings: { network: 'ws', security: 'none', wsSettings: { path: WS_PATH } }
  }],
  outbounds: [{ protocol: 'freedom' }]
};
const cfgPath = path.join(dir, 'config.json');
fs.writeFileSync(cfgPath, JSON.stringify(config));
console.log(`starting xray on :${PORT} path ${WS_PATH}`);
const proc = spawn(path.join(dir, 'xray'), ['run', '-c', cfgPath], { stdio: 'inherit' });
proc.on('exit', (code) => { console.log('xray exited', code); process.exit(code ?? 1); });
