// Decide which ramp time pair (accel/decel) and ramp shape (linear or S)
// the drive uses, following CFW100 P104/P105 and the emergency ramp
// (P106/P107). Hardware/network-driven ramp selection still falls back to the
// 1st ramp with an honest note.

const RAMP_SELECTION = {
  0: { kind: "PRIMEIRA", simulated: true, label: "1a rampa", labelKey: "rampSelector.ramp1" },
  1: { kind: "SEGUNDA", simulated: true, label: "2a rampa", labelKey: "rampSelector.ramp2" },
  2: { kind: "DI", simulated: false, label: "DIx", labelKey: "commandSource.dix" },
  3: { kind: "SERIAL", simulated: false, label: "Serial/USB", labelKey: "commandSource.serialUsb" },
  4: { kind: "RESERVADO", simulated: true, label: "Reservado", labelKey: "commandSource.reserved" },
  5: { kind: "CODN", simulated: false, label: "CO/DN", labelKey: "commandSource.codn" },
  6: { kind: "SOFTPLC", simulated: false, label: "SoftPLC", labelKey: "commandSource.softplc" },
};

function createRampNote(key, fallback, params = {}) {
  return {
    key,
    fallback,
    params,
  };
}

export function selectRamp(hmiState) {
  const p = hmiState.parameters;
  const notes = [];

  if (hmiState.emergencyStop) {
    return {
      label: "Emergencia",
      labelKey: "rampSelector.emergency",
      accelTime: p.P106?.value ?? 0,
      decelTime: p.P107?.value ?? 0,
      sShape: false, // The CFW100 emergency ramp is linear.
      notes,
    };
  }

  const selection =
    RAMP_SELECTION[p.P105?.value ?? 0] ?? RAMP_SELECTION[0];

  let useSecond = selection.kind === "SEGUNDA";
  if (!selection.simulated) {
    notes.push(
      createRampNote(
        "rampSelector.notSimulated",
        `Selecao de rampa "${selection.label}" nao simulada: usando 1a rampa.`,
        {
          label: {
            key: selection.labelKey,
            fallback: selection.label,
          },
        },
      ),
    );
    useSecond = false;
  }

  const sShape = (p.P104?.value ?? 0) === 1;

  return {
    label: useSecond ? "2a rampa" : "1a rampa",
    labelKey: useSecond ? "rampSelector.ramp2" : "rampSelector.ramp1",
    accelTime: useSecond ? p.P102?.value ?? 0 : p.P100?.value ?? 0,
    decelTime: useSecond ? p.P103?.value ?? 0 : p.P101?.value ?? 0,
    sShape,
    notes,
  };
}
