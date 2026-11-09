import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';

const platform = process.argv[2];

if (!['ios', 'android'].includes(platform)) {
  throw new Error('Usage: node scripts/capacitor-live-sync.mjs <ios|android>');
}

const configPath = new URL('../capacitor.config.json', import.meta.url);
const originalConfig = await readFile(configPath, 'utf8');
const baseConfig = JSON.parse(originalConfig);
const interfaces = Object.entries(networkInterfaces()).sort(([a], [b]) =>
  Number(b === 'en0') - Number(a === 'en0'));
const host = process.env.IOS_LIVE_HOST || interfaces.flatMap(([, addresses]) => addresses)
  .find(address => address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.'))?.address;
if (!host) throw new Error('개발 서버에 사용할 LAN 주소가 없습니다. Wi-Fi 연결을 확인하세요.');
const serverUrl = `http://${host}:8082`;
const response = await fetch(serverUrl, { signal: AbortSignal.timeout(5000) });
if (!response.ok) throw new Error(`8082 개발 서버가 응답하지 않습니다: ${response.status}`);
console.log(`모바일 테스트 서버: ${serverUrl}`);
const liveConfig = {
  ...baseConfig,
  ios: {
    ...baseConfig.ios,
    webContentsDebuggingEnabled: true,
  },
  server: {
    url: serverUrl,
    cleartext: true,
  },
};

try {
  await writeFile(configPath, `${JSON.stringify(liveConfig, null, 2)}\n`);
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(command, ['cap', 'sync', platform], {
    cwd: new URL('..', import.meta.url),
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status || 1;
} finally {
  await writeFile(configPath, originalConfig);
}
