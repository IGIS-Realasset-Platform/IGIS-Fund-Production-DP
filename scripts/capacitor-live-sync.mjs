import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const platform = process.argv[2];

if (!['ios', 'android'].includes(platform)) {
  throw new Error('Usage: node scripts/capacitor-live-sync.mjs <ios|android>');
}

const configPath = new URL('../capacitor.config.json', import.meta.url);
const originalConfig = await readFile(configPath, 'utf8');
const baseConfig = JSON.parse(originalConfig);
const liveConfig = {
  ...baseConfig,
  ios: {
    ...baseConfig.ios,
    webContentsDebuggingEnabled: true,
  },
  server: {
    url: 'http://172.16.100.191:8082',
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
