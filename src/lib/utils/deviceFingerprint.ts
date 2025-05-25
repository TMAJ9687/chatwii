// Generates a device fingerprint (anonymous, persistent, privacy-friendly)
export function getDeviceFingerprint() {
  let fingerprint = localStorage.getItem('device_fingerprint');
  if (!fingerprint) {
    // Use a simple random UUID (could be improved with more entropy if needed)
    fingerprint = crypto.randomUUID();
    localStorage.setItem('device_fingerprint', fingerprint);
  }
  return fingerprint;
}
