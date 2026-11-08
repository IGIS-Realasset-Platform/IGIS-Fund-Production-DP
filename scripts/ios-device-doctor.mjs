import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getIPhoneCandidates } from './ios-device-selection.mjs';

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
    console.error('1. 사용할 iPhone을 USB로 연결하고 잠금을 해제하세요.');
    console.error('2. iPhone에 표시되는 이 컴퓨터 신뢰 안내를 확인하세요.');
    console.error('3. `npm run ios:open`으로 Xcode를 열고 Window > Devices and Simulators에서 새 iPhone 연결 상태를 확인하세요.');
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
    const candidates = getIPhoneCandidates(devices);
    if (candidates.length === 0) {
        throw new Error('연결 가능한 iPhone이 없습니다. 새 iPhone을 USB로 연결하고 신뢰/페어링을 완료해 주세요.');
    }

    let connectedPhone;
    let developerModeDisabled = false;
    for (const iPhone of candidates) {
        console.log(`iPhone 점검: ${iPhone.deviceProperties?.name || iPhone.identifier}`);
        const probeResult = run('xcrun', [
            'devicectl', 'device', 'info', 'apps',
            '--device', iPhone.identifier,
            '--bundle-id', capacitorConfig.appId,
            '--timeout', '15',
        ], 20_000);
        if (!probeResult.error && probeResult.status === 0) {
            connectedPhone = iPhone;
            break;
        }
        developerModeDisabled ||= /Developer Mode is disabled/i.test(`${probeResult.stderr || ''}\n${probeResult.stdout || ''}`);
    }
    if (!connectedPhone) {
        if (developerModeDisabled) {
            throw new Error('iPhone의 개발자 모드가 꺼져 있습니다. iPhone 설정 > 개인정보 보호 및 보안 > 개발자 모드를 켜고 재시동 후 활성화를 확인하세요.');
        }
        throw new Error('연결 가능한 iPhone의 디버그 터널을 열지 못했습니다. Xcode에서 기기 준비 상태를 확인해 주세요.');
    }
    console.log(`iPhone 확인: ${connectedPhone.deviceProperties?.name || connectedPhone.identifier}`);

    console.log('iPhone 디버그 연결 정상: Xcode에서 바로 실행할 수 있습니다.');
} catch (error) {
    console.error(`iOS 점검 실패: ${error.message}`);
    printRecoveryGuide();
    process.exitCode = 1;
} finally {
    rmSync(outputDirectory, { recursive: true, force: true });
}
