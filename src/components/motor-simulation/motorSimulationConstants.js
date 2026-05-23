export const MOTOR_IDLE_IMAGE = "/motor-parado.png";
export const SAMPLE_INTERVAL_MS = 50;

export const TIME_WINDOWS = [
  { label: "15s", ms: 15_000 },
  { label: "30s", ms: 30_000 },
  { label: "1min", ms: 60_000 },
  { label: "5min", ms: 300_000 },
];

export const SERIES = [
  { key: "rpm", label: "Rota\u00e7\u00e3o", unit: "rpm", color: "#2563eb", floor: 1800 },
  { key: "current", label: "Corrente", unit: "A", color: "#ea580c", floor: 2 },
  { key: "frequency", label: "Frequ\u00eancia", unit: "Hz", color: "#059669", floor: 60 },
  { key: "temperature", label: "Temp.", unit: "\u00b0C", color: "#dc2626", floor: 100 },
  { key: "ixtPercent", label: "Ixt", unit: "%", color: "#7c3aed", floor: 100 },
  { key: "torquePercent", label: "Torque", unit: "%", color: "#d97706", floor: 100 },
];
