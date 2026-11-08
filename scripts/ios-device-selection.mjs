// Pairing records can survive a phone replacement. Never probe an unavailable phone.
export function getIPhoneCandidates(devices = []) {
    return devices.filter(device => (
        device.hardwareProperties?.deviceType === 'iPhone'
        && device.connectionProperties?.pairingState === 'paired'
        && device.connectionProperties?.tunnelState !== 'unavailable'
    )).sort((left, right) => (
        Number(right.connectionProperties?.tunnelState === 'connected')
        - Number(left.connectionProperties?.tunnelState === 'connected')
    ));
}
