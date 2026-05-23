function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function stepOverloadIxt({
  currentIxtPercent,
  motorCurrent,
  overloadCurrent,
  deltaMs,
}) {
  if (overloadCurrent <= 0) {
    return currentIxtPercent;
  }

  const ratio = motorCurrent / overloadCurrent;
  if (ratio <= 1) {
    return clamp(currentIxtPercent - (deltaMs / 1000) * 1.5, 0, 100);
  }

  // Calibração didática: 150% de P156 leva aproximadamente 60 s até F072.
  const heatingPerSecond = ((ratio - 1) / 0.5) * (100 / 60);
  return clamp(currentIxtPercent + heatingPerSecond * (deltaMs / 1000), 0, 100);
}
