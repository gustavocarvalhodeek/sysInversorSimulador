export const IMPLEMENTATION_STATUS = {
  CATALOG_ONLY: "catalog_only",
  READ_ONLY_SUPPORTED: "read_only_supported",
  EDITABLE_WITHOUT_EFFECT: "editable_without_effect",
  PARTIAL: "partial",
  FULL: "full",
};

export const IMPLEMENTATION_STATUS_LABEL = {
  [IMPLEMENTATION_STATUS.CATALOG_ONLY]: "Apenas catalogado",
  [IMPLEMENTATION_STATUS.READ_ONLY_SUPPORTED]: "Leitura suportada",
  [IMPLEMENTATION_STATUS.EDITABLE_WITHOUT_EFFECT]: "Editável sem efeito",
  [IMPLEMENTATION_STATUS.PARTIAL]: "Suporte parcial",
  [IMPLEMENTATION_STATUS.FULL]: "Suporte completo",
};

export const SIMULATION_EFFECT_LABEL = {
  telemetry: "Telemetria",
  ramp_control: "Controle de rampa",
  multispeed_reference: "Referências multispeed",
  motor_model: "Modelo do motor",
  digital_input_functions: "Funções de entradas digitais",
  password_access: "Acesso por senha",
  ramp_selection: "Seleção de rampa",
  reference_backup: "Backup de referência",
  hmi_reference: "Referência pela HMI",
  jog_reference: "Referência JOG",
  frequency_limits: "Limites de frequência",
  current_limit: "Limite de corrente",
  overload_protection: "Proteção de sobrecarga",
  motor_control_mode: "Modo de controle do motor",
  parameter_set_persistence: "Carga e salvamento de parâmetros",
  display_bar: "Barra gráfica",
  locrem_selection: "Seleção LOC/REM",
  reference_source_selection: "Seleção da fonte de referência",
  rotation_selection: "Seleção do sentido de giro",
  run_command_selection: "Seleção do comando Gira/Para",
  jog_source_selection: "Seleção da fonte JOG",
  stop_mode: "Modo de parada",
  analog_input_scaling: "Escala da entrada analógica",
  frequency_input_scaling: "Escala da entrada em frequência",
};

const support = (status, effects = []) => ({ status, effects });
const entries = (codes, status, effects) =>
  Object.fromEntries(codes.map((code) => [code, support(status, effects)]));

const TELEMETRY_CODES = [
  "P001",
  "P002",
  "P003",
  "P004",
  "P005",
  "P006",
  "P007",
  "P009",
  "P011",
  "P012",
  "P018",
  "P022",
  "P037",
  "P047",
  "P048",
  "P049",
  "P050",
  "P051",
  "P052",
  "P053",
  "P054",
  "P680",
  "P683",
  "P685",
];

const RAMP_CODES = ["P100", "P101", "P102", "P103", "P104", "P106", "P107"];
const MULTISPEED_CODES = ["P124", "P125", "P126", "P127", "P128", "P129", "P130", "P131"];
const MOTOR_MODEL_CODES = [
  "P136",
  "P137",
  "P138",
  "P142",
  "P143",
  "P145",
  "P146",
  "P400",
  "P401",
  "P402",
  "P403",
  "P407",
];
const DIGITAL_INPUT_CODES = ["P263", "P264", "P265", "P266", "P267", "P268", "P269", "P270"];

// Fonte única sobre o que o simulador realmente suporta hoje.
export const PARAMETER_SIMULATION_SUPPORT = {
  ...entries(TELEMETRY_CODES, IMPLEMENTATION_STATUS.READ_ONLY_SUPPORTED, [
    "telemetry",
  ]),
  ...entries(RAMP_CODES, IMPLEMENTATION_STATUS.FULL, ["ramp_control"]),
  ...entries(MULTISPEED_CODES, IMPLEMENTATION_STATUS.FULL, [
    "multispeed_reference",
  ]),
  ...entries(MOTOR_MODEL_CODES, IMPLEMENTATION_STATUS.FULL, ["motor_model"]),
  ...entries(DIGITAL_INPUT_CODES, IMPLEMENTATION_STATUS.PARTIAL, [
    "digital_input_functions",
  ]),

  P000: support(IMPLEMENTATION_STATUS.FULL, ["password_access"]),
  P105: support(IMPLEMENTATION_STATUS.PARTIAL, ["ramp_selection"]),
  P120: support(IMPLEMENTATION_STATUS.FULL, ["reference_backup"]),
  P121: support(IMPLEMENTATION_STATUS.FULL, ["hmi_reference"]),
  P122: support(IMPLEMENTATION_STATUS.FULL, ["jog_reference"]),
  P133: support(IMPLEMENTATION_STATUS.FULL, ["frequency_limits"]),
  P134: support(IMPLEMENTATION_STATUS.FULL, ["frequency_limits"]),
  P135: support(IMPLEMENTATION_STATUS.FULL, ["current_limit"]),
  P156: support(IMPLEMENTATION_STATUS.FULL, ["overload_protection"]),
  P200: support(IMPLEMENTATION_STATUS.FULL, ["password_access"]),
  P202: support(IMPLEMENTATION_STATUS.FULL, ["motor_control_mode"]),
  P204: support(IMPLEMENTATION_STATUS.FULL, ["parameter_set_persistence"]),
  P207: support(IMPLEMENTATION_STATUS.FULL, ["display_bar"]),
  P208: support(IMPLEMENTATION_STATUS.FULL, ["display_bar"]),
  P220: support(IMPLEMENTATION_STATUS.FULL, ["locrem_selection"]),
  P221: support(IMPLEMENTATION_STATUS.PARTIAL, ["reference_source_selection"]),
  P222: support(IMPLEMENTATION_STATUS.PARTIAL, ["reference_source_selection"]),
  P223: support(IMPLEMENTATION_STATUS.FULL, ["rotation_selection"]),
  P224: support(IMPLEMENTATION_STATUS.FULL, ["run_command_selection"]),
  P225: support(IMPLEMENTATION_STATUS.FULL, ["jog_source_selection"]),
  P226: support(IMPLEMENTATION_STATUS.FULL, ["rotation_selection"]),
  P227: support(IMPLEMENTATION_STATUS.FULL, ["run_command_selection"]),
  P228: support(IMPLEMENTATION_STATUS.FULL, ["jog_source_selection"]),
  P229: support(IMPLEMENTATION_STATUS.FULL, ["stop_mode"]),
  P232: support(IMPLEMENTATION_STATUS.FULL, ["analog_input_scaling"]),
  P234: support(IMPLEMENTATION_STATUS.FULL, ["analog_input_scaling"]),
  P247: support(IMPLEMENTATION_STATUS.FULL, ["frequency_input_scaling"]),
  P248: support(IMPLEMENTATION_STATUS.FULL, ["frequency_input_scaling"]),
  P249: support(IMPLEMENTATION_STATUS.FULL, ["frequency_input_scaling"]),
  P250: support(IMPLEMENTATION_STATUS.FULL, ["frequency_input_scaling"]),
};

export function getDefaultSimulationSupport({ readOnly }) {
  return readOnly
    ? support(IMPLEMENTATION_STATUS.CATALOG_ONLY)
    : support(IMPLEMENTATION_STATUS.EDITABLE_WITHOUT_EFFECT);
}
