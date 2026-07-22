import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const capacitorConfig = JSON.parse(readFileSync(path.join(projectRoot, 'capacitor.config.json'), 'utf8'));
const outputDirectory = mkdtempSync(path.join(tmpdir(), 'igis-ios-doctor-'));
const devicesJsonPath = path.join(outputDirectory, 'devices.json');

const run = (command, args, timeout) => spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    timeout,
});

const printRecoveryGuide = () => {
    console.error('\n복구 방법:');
    console.error('1. iPhone 잠금을 해제하고 Mac과 같은 Wi-Fi에 연결하거나 USB 케이블을 연결하세요.');
    console.error('2. Xcode를 완전히 종료하세요.');
    console.error('3. 터미널에서 `pkill -x CoreDeviceService`를 실행하세요.');
    console.error('4. `npm run ios:ready`를 다시 실행하세요.');
};

try {
    if (process.platform !== 'darwin') {
        throw new Error('iOS 기기 점검은 macOS에서만 실행할 수 있습니다.');
    }

    const listResult = run('xcrun', [
        'devicectl',
        'list',
        'devices',
        '--timeout',
        '10',
        '--json-output',
        devicesJsonPath,
    ], 15_000);

    if (listResult.error || listResult.status !== 0) {
        throw new Error('CoreDeviceService가 기기 목록에 응답하지 않습니다.');
    }

    const devices = JSON.parse(readFileSync(devicesJsonPath, 'utf8')).result?.devices || [];
    const iPhone = devices.find((device) => (
        device.hardwareProperties?.deviceType === 'iPhone'
        && device.connectionProperties?.pairingState === 'paired'
    ));

    if (!iPhone) {
        throw new Error('페어링된 iPhone을 찾지 못했습니다.');
    }

    console.log(`iPhone 확인: ${iPhone.deviceProperties?.name || iPhone.identifier}`);

    const probeResult = run('xcrun', [
        'devicectl',
        'device',
        'info',
        'apps',
        '--device',
        iPhone.identifier,
        '--bundle-id',
        capacitorConfig.appId,
        '--timeout',
        '15',
    ], 20_000);

    if (probeResult.error || probeResult.status !== 0) {
        throw new Error('iPhone 디버그 터널을 열지 못했습니다.');
    }

    console.log('iPhone 디버그 연결 정상: Xcode에서 바로 실행할 수 있습니다.');
} catch (error) {
    console.error(`iOS 점검 실패: ${error.message}`);
    printRecoveryGuide();
    process.exitCode = 1;
} finally {
    rmSync(outputDirectory, { recursive: true, force: true });
}
