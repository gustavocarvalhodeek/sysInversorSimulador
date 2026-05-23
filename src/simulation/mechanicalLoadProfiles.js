// Perfis de carga mecânica para o simulador CFW100.
//
// Cada perfil define:
//   tauMs           — constante de tempo mecânica do rotor (ms). Determina a
//                     rapidez com que mechanicalHz segue outputFrequency.
//                     Quanto maior, mais lento o RPM responde.
//   coastDecayFactor — multiplicador sobre a taxa natural de decaimento do
//                     coast-down (P229=1). Fator > 1: desacelera mais rápido
//                     (baixa inércia); fator < 1: desacelera mais lento (alta
//                     inércia).
//   label / labelKey — texto PT-BR e chave i18n para exibição na UI.

export const MECHANICAL_LOAD_PROFILES = {
  noLoad: {
    id: "noLoad",
    tauMs: 40,
    coastDecayFactor: 2.0,
    label: "Motor em vazio",
    labelKey: "mechanicalLoad.noLoad",
    descriptionKey: "mechanicalLoad.noLoadDesc",
  },
  lightLoad: {
    id: "lightLoad",
    tauMs: 80,
    coastDecayFactor: 1.0,
    label: "Carga leve",
    labelKey: "mechanicalLoad.lightLoad",
    descriptionKey: "mechanicalLoad.lightLoadDesc",
  },
  pump: {
    id: "pump",
    tauMs: 140,
    coastDecayFactor: 0.65,
    label: "Bomba centrifuga",
    labelKey: "mechanicalLoad.pump",
    descriptionKey: "mechanicalLoad.pumpDesc",
  },
  fan: {
    id: "fan",
    tauMs: 200,
    coastDecayFactor: 0.50,
    label: "Ventilador",
    labelKey: "mechanicalLoad.fan",
    descriptionKey: "mechanicalLoad.fanDesc",
  },
  conveyor: {
    id: "conveyor",
    tauMs: 300,
    coastDecayFactor: 0.35,
    label: "Esteira transportadora",
    labelKey: "mechanicalLoad.conveyor",
    descriptionKey: "mechanicalLoad.conveyorDesc",
  },
  highInertia: {
    id: "highInertia",
    tauMs: 450,
    coastDecayFactor: 0.20,
    label: "Alta inercia",
    labelKey: "mechanicalLoad.highInertia",
    descriptionKey: "mechanicalLoad.highInertiaDesc",
  },
};

export const DEFAULT_LOAD_PROFILE_ID = "lightLoad";

export const LOAD_PROFILE_IDS = Object.keys(MECHANICAL_LOAD_PROFILES);

// Retorna o perfil pelo ID. Fallback seguro para lightLoad se ID inválido.
export function getLoadProfile(id) {
  return (
    MECHANICAL_LOAD_PROFILES[id] ??
    MECHANICAL_LOAD_PROFILES[DEFAULT_LOAD_PROFILE_ID]
  );
}
