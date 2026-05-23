import referenceData from "./cfw100ParameterReference.json" with { type: "json" };
import {
  PARAMETER_ENRICHMENT,
  deriveDifficulty,
} from "./cfw100ParameterEnrichment.js";
import {
  PARAMETER_SIMULATION_SUPPORT,
  getDefaultSimulationSupport,
} from "./cfw100ParameterSimulationSupport.js";

const CATEGORY_DESCRIPTIONS = {
  acesso_leitura: "Usado para monitorar grandezas, estados internos, alarmes, falhas ou informações do inversor.",
  rampas_referencias: "Configura rampas, referências e limites que determinam como a frequência do inversor evolui.",
  controle_motor: "Ajusta o comportamento elétrico do motor, incluindo torque, curva V/f e compensações.",
  senha_display_controle: "Configura senha, indicações da HMI e funções gerais de controle do inversor.",
  comando_referencia: "Define de onde vem o comando do inversor e qual fonte fornece a referência de velocidade.",
  analogicas_frequencia: "Configura entradas e saídas analógicas ou sinais de frequência usados pelo inversor.",
  entradas_digitais: "Define a função das entradas digitais e como elas comandam o inversor.",
  saidas_digitais: "Configura sinais digitais de saída para indicar estados e condições do inversor.",
  frenagem_serial: "Reúne parâmetros de frenagem, frequências evitadas e comunicação serial.",
  flying_motor: "Configura recursos de continuidade de operação e dados auxiliares do motor.",
  dados_motor: "Armazena os dados nominais do motor usados para controle, proteção e cálculos internos.",
  comunicacao: "Configura comunicação serial, CANopen ou DeviceNet e seus estados de operação.",
  bluetooth_softplc: "Configura Bluetooth, teclas de controle e recursos da SoftPLC.",
  geral: "Parâmetro de configuração geral do CFW100.",
};

const CATEGORY_LABEL = {
  acesso_leitura: "Leitura e monitoração",
  rampas_referencias: "Rampas e referências",
  controle_motor: "Controle do motor",
  senha_display_controle: "Senha, display e controle",
  comando_referencia: "Comando e referência",
  analogicas_frequencia: "Analógicas e frequência",
  entradas_digitais: "Entradas digitais",
  saidas_digitais: "Saídas digitais",
  frenagem_serial: "Frenagem e serial",
  flying_motor: "Flying start e motor",
  dados_motor: "Dados do motor",
  comunicacao: "Comunicação",
  bluetooth_softplc: "Bluetooth e SoftPLC",
  geral: "Geral",
};

const referenceByCode = Object.fromEntries(
  referenceData.parameters.map((reference) => [reference.code, reference]),
);

const NUMERIC_TOKEN_REGEX = /-?\d+(?:[.,]\d+)?/g;

function extractNumericTokens(text) {
  if (typeof text !== "string") {
    return [];
  }

  return [...text.matchAll(NUMERIC_TOKEN_REGEX)].map((match) => ({
    raw: match[0],
    value: Number(match[0].replace(",", ".")),
  }));
}

function expandOptionValues(optionValue) {
  const tokens = extractNumericTokens(optionValue);
  if (tokens.length === 0) {
    return [];
  }

  const [first, second] = tokens.map((token) => token.value);
  if (
    typeof second === "number" &&
    /\ba\b/i.test(optionValue) &&
    Number.isInteger(first) &&
    Number.isInteger(second) &&
    second >= first &&
    second - first <= 100
  ) {
    return Array.from({ length: second - first + 1 }, (_, index) => first + index);
  }

  return [first];
}

function getReferenceOptions(reference) {
  if (!reference) {
    return [];
  }

  if (reference.options?.length) {
    return reference.options;
  }

  const sourceCode = reference.range?.match(/Ver opções em (P\d+)/i)?.[1];
  return sourceCode ? referenceByCode[sourceCode]?.options ?? [] : [];
}

function getReferenceOptionValues(reference) {
  return [...new Set(
    getReferenceOptions(reference).flatMap((option) => expandOptionValues(option.value)),
  )].sort((a, b) => a - b);
}

function parseRange(range) {
  if (typeof range !== "string" || range.length === 0) {
    return null;
  }

  const hexMatch = range.match(/([0-9a-f]+)\s+a\s+([0-9a-f]+)\s+\(hexa\)/i);
  if (hexMatch) {
    return {
      min: Number.parseInt(hexMatch[1], 16),
      max: Number.parseInt(hexMatch[2], 16),
    };
  }

  const tokens = extractNumericTokens(range);
  if (!/\ba\b/i.test(range) || tokens.length < 2) {
    return null;
  }

  return {
    min: tokens[0].value,
    max: tokens[1].value,
  };
}

function inferDecimals(...texts) {
  return Math.max(
    0,
    ...texts.flatMap((text) =>
      extractNumericTokens(text).map((token) => {
        const decimalPart = token.raw.split(/[.,]/)[1];
        return decimalPart?.length ?? 0;
      }),
    ),
  );
}

function inferUnit(...texts) {
  const joined = texts.filter(Boolean).join(" ");
  const unitPatterns = [
    ["kHz", /\bkHz\b/],
    ["Hz", /\bHz\b/],
    ["rpm", /\brpm\b/],
    ["%", /%/],
    ["A", /\bA\b/],
    ["V", /\bV\b/],
    ["s", /\bs\b/],
    ["ºC", /[º°]C/],
  ];

  return unitPatterns.find(([, pattern]) => pattern.test(joined))?.[0] ?? "";
}

function deriveReferenceMetadata(reference) {
  const range = parseRange(reference?.range);
  const optionValues = getReferenceOptionValues(reference);
  const defaultValue = extractNumericTokens(reference?.factoryDefault)[0]?.value;
  const decimals = inferDecimals(reference?.range, reference?.factoryDefault);

  return {
    value: defaultValue,
    min: range?.min ?? optionValues[0],
    max: range?.max ?? optionValues.at(-1),
    decimals,
    step: decimals > 0 ? 10 ** -decimals : 1,
    unit: inferUnit(reference?.range, reference?.factoryDefault),
    options: getReferenceOptions(reference),
  };
}

function parameter(code, name, options = {}) {
  const reference = referenceByCode[code];
  const enrichment = PARAMETER_ENRICHMENT[code] ?? {};
  const properties = options.properties ?? reference?.properties ?? [];
  const editable = options.editable ?? reference?.editable ?? true;
  const isReadOnly = editable === false || properties.includes("ro");
  const referenceMetadata = deriveReferenceMetadata(reference);
  const category = options.category ?? "geral";
  const simulationSupport =
    PARAMETER_SIMULATION_SUPPORT[code] ??
    getDefaultSimulationSupport({ readOnly: isReadOnly });

  return {
    code,
    manual: {
      name: reference?.name ?? name,
      category,
      categoryLabel: reference?.category ?? CATEGORY_LABEL[category] ?? "Geral",
      description:
        reference?.description ??
        options.description ??
        CATEGORY_DESCRIPTIONS[category],
      shortDescription:
        reference?.shortDescription ??
        options.description ??
        CATEGORY_DESCRIPTIONS[category],
      longDescription: enrichment.longDescription ?? "",
      example: enrichment.example ?? "",
      difficulty: deriveDifficulty(code, properties),
      range: reference?.range ?? "",
      factoryDefault: reference?.factoryDefault ?? "",
      pageReference: reference?.pageReference ?? "",
      access: reference?.access ?? (isReadOnly ? "somente_leitura" : "editavel"),
      requiresAccessory: reference?.requiresAccessory ?? null,
      editCondition: reference?.editCondition ?? "",
    },
    runtime: {
      value: options.value ?? referenceMetadata.value ?? 0,
      editable: !isReadOnly,
      decimals: options.decimals ?? referenceMetadata.decimals ?? 0,
      step: options.step ?? referenceMetadata.step ?? 1,
      min: options.min ?? referenceMetadata.min ?? 0,
      max: options.max ?? referenceMetadata.max ?? 9999,
      unit: options.unit ?? referenceMetadata.unit ?? "",
      properties,
      readOnly: isReadOnly,
      requiresStoppedMotor: properties.includes("cfg"),
      options: referenceMetadata.options,
    },
    simulation: {
      implementationStatus: simulationSupport.status,
      effects: simulationSupport.effects,
      simulatorBehavior: reference?.simulatorBehavior ?? "",
      relatedParameters: enrichment.relatedParameters ?? [],
    },
  };
}

const readOnly = (options = {}) => ({
  ...options,
  editable: false,
  properties: [...(options.properties ?? []), "ro"],
});

const cfg = (options = {}) => ({
  ...options,
  properties: [...(options.properties ?? []), "cfg"],
});

const BASE_PARAMETER_SCHEMA = [
  parameter("P000", "Acesso aos Parâmetros", {
    category: "acesso_leitura",
    value: 1,
    min: 0,
    max: 9999,
    description: "Controla a liberação de acesso aos parâmetros quando a senha está habilitada.",
  }),
  parameter("P001", "Referência Velocidade", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "Hz",
    description: "Mostra a referência de velocidade solicitada ao inversor.",
  })),
  parameter("P002", "Velocidade de Saída do Motor", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "rpm",
    description: "Mostra a velocidade estimada de saída do motor.",
  })),
  parameter("P003", "Corrente do Motor", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "A",
    description: "Mostra a corrente instantânea do motor.",
  })),
  parameter("P004", "Tensão do Barramento CC", readOnly({
    category: "acesso_leitura",
    unit: "V",
    description: "Mostra a tensão medida no barramento CC.",
  })),
  parameter("P005", "Frequência de Saída do Motor", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "Hz",
    description: "Mostra a frequência real aplicada ao motor.",
  })),
  parameter("P006", "Estado do Inversor", readOnly({
    category: "acesso_leitura",
    description: "Indica o estado atual do inversor, como pronto, em funcionamento ou falha.",
  })),
  parameter("P007", "Tensão de Saída", readOnly({
    category: "acesso_leitura",
    unit: "V",
    description: "Mostra a tensão instantânea aplicada na saída do inversor.",
  })),
  parameter("P009", "Torque no Motor", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "%",
    properties: ["VVW"],
    description: "Exibe o torque estimado em % do torque nominal. Relevante apenas no modo VVW (P202=5); em V/f é calculado indiretamente e pode não refletir o torque real.",
  })),
  parameter("P011", "Corrente Ativa", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "A",
  })),
  parameter("P012", "Estado DI8 a DI1", readOnly({ category: "acesso_leitura" })),
  parameter("P013", "Estado DO3 a DO1", readOnly({
    category: "acesso_leitura",
    properties: ["*"],
  })),
  parameter("P014", "Valor de AO1", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "%",
    properties: ["*"],
  })),
  parameter("P018", "Valor de AI1", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "%",
    properties: ["*"],
  })),
  parameter("P022", "Valor de FI em Hz", readOnly({
    category: "acesso_leitura",
    unit: "Hz",
  })),
  parameter("P023", "Versão de Software", readOnly({
    category: "acesso_leitura",
    decimals: 2,
  })),
  parameter("P024", "Versão de Software do Acessório", readOnly({
    category: "acesso_leitura",
    decimals: 2,
    properties: ["*", "**"],
  })),
  parameter("P027", "Configuração do Acessório", readOnly({ category: "acesso_leitura" })),
  parameter("P029", "Configuração de Hardware de Potência", readOnly({
    category: "acesso_leitura",
    description: "Identifica a configuração do hardware de potência reconhecida pelo inversor.",
  })),
  parameter("P030", "Temperatura do Módulo", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "\u00b0C", // Item 16: corrigido de "C" para "°C"
  })),
  parameter("P037", "Sobrecarga do Motor Ixt", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "%",
  })),
  parameter("P047", "Estado CONF", readOnly({ category: "acesso_leitura" })),
  parameter("P048", "Alarme Atual", readOnly({ category: "acesso_leitura" })),
  parameter("P049", "Falha Atual", readOnly({ category: "acesso_leitura" })),
  parameter("P050", "Última Falha", readOnly({ category: "acesso_leitura" })),
  parameter("P051", "Corrente na Última Falha", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "A",
  })),
  parameter("P052", "Barramento CC na Última Falha", readOnly({
    category: "acesso_leitura",
    unit: "V",
  })),
  parameter("P053", "Frequência na Última Falha", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "Hz",
  })),
  parameter("P054", "Temperatura na Última Falha", readOnly({
    category: "acesso_leitura",
    decimals: 1,
    unit: "\u00b0C", // Item 16: corrigido de "C" para "°C"
  })),
  parameter("P060", "Segunda Falha", readOnly({ category: "acesso_leitura" })),
  parameter("P070", "Terceira Falha", readOnly({ category: "acesso_leitura" })),

  parameter("P100", "Tempo de Aceleração", {
    category: "rampas_referencias",
    value: 5,
    decimals: 1,
    step: 0.1,
    min: 0.1, // Manual CFW100: mínimo 0.1 s
    max: 999.9,
    unit: "s",
    description: "Define o tempo de aceleração da frequência de saída até a referência.",
  }),
  parameter("P101", "Tempo de Desaceleração", {
    category: "rampas_referencias",
    value: 10,
    decimals: 1,
    step: 0.1,
    min: 0.1, // Manual CFW100: mínimo 0.1 s
    max: 999.9,
    unit: "s",
    description: "Define o tempo de desaceleração da frequência de saída até a referência.",
  }),
  parameter("P102", "Tempo de Aceleração da 2a Rampa", {
    category: "rampas_referencias",
    value: 5,
    decimals: 1,
    step: 0.1,
    min: 0.1,
    max: 999.9,
    unit: "s",
    description: "Tempo de aceleração usado quando a 2a rampa está selecionada.",
  }),
  parameter("P103", "Tempo de Desaceleração da 2a Rampa", {
    category: "rampas_referencias",
    value: 10,
    decimals: 1,
    step: 0.1,
    min: 0.1,
    max: 999.9,
    unit: "s",
    description: "Tempo de desaceleração usado quando a 2a rampa está selecionada.",
  }),
  parameter("P104", "Rampa S", {
    category: "rampas_referencias",
    value: 0,
    max: 1,
    description: "Ativa (1) a rampa em S, suavizando início e fim da variação.",
  }),
  parameter("P105", "Seleção 1a/2a Rampa", {
    category: "rampas_referencias",
    value: 0,
    max: 6,
    description: "Escolhe entre 1a rampa, 2a rampa ou fonte externa de seleção.",
  }),
  parameter("P106", "Tempo de Aceleração da Rampa de Emergência", {
    category: "rampas_referencias",
    value: 5,
    decimals: 1,
    step: 0.1,
    min: 0.1,
    max: 999.9,
    unit: "s",
    description: "Tempo de aceleração aplicado na rampa de emergência.",
  }),
  parameter("P107", "Tempo de Desaceleração da Rampa de Emergência", {
    category: "rampas_referencias",
    value: 5,
    decimals: 1,
    step: 0.1,
    min: 0.1,
    max: 999.9,
    unit: "s",
    description: "Tempo de desaceleração aplicado na parada de emergência.",
  }),
  parameter("P120", "Backup da Referência de Velocidade", { category: "rampas_referencias" }),
  parameter("P121", "Referência pela HMI", {
    category: "rampas_referencias",
    value: 3,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Define a referência de frequência comandada pela HMI.",
  }),
  parameter("P122", "Referência JOG", {
    category: "rampas_referencias",
    value: 5,
    decimals: 1,
    step: 0.1,
    min: -300,
    max: 300,
    unit: "Hz",
    description: "Define a frequência aplicada durante o comando JOG.",
  }),
  ...[3, 10, 20, 30, 40, 50, 60, 66].map((preset, index) =>
    parameter(`P${124 + index}`, `Referência ${index + 1} Multispeed`, {
      category: "rampas_referencias",
      value: preset,
      decimals: 1,
      step: 0.1,
      min: -300,
      max: 300,
      unit: "Hz",
      description: `Define a referência ${index + 1} usada no modo Multispeed.`,
    }),
  ),
  parameter("P133", "Frequência Mínima", {
    category: "rampas_referencias",
    value: 3,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Define o limite mínimo permitido para a referência de frequência.",
  }),
  parameter("P134", "Frequência Máxima", {
    category: "rampas_referencias",
    value: 66,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Define o limite máximo permitido para a referência de frequência.",
  }),
  parameter("P135", "Corrente Máxima de Saída", {
    category: "rampas_referencias",
    value: 2.1, // 1.5 x Inom (P401 = 1.4 A)
    decimals: 1,
    step: 0.1,
    max: 10,
    unit: "A",
    description: "Limite de corrente de saída; acima dele a aceleração é reduzida.",
  }),

  parameter("P136", "Boost de Torque Manual", {
    category: "controle_motor",
    value: 0,
    decimals: 1,
    step: 0.1,
    max: 30,
    unit: "%",
    description: "Reforço de tensão em baixa frequência para aumentar o torque de partida.",
  }),
  parameter("P137", "Boost de Torque Automático", {
    category: "controle_motor",
    value: 0,
    decimals: 1,
    step: 0.1,
    max: 30,
    unit: "%",
    description: "Reforço de tensão proporcional a carga em baixa frequência.",
  }),
  parameter("P138", "Compensação de Escorregamento", {
    category: "controle_motor",
    value: 0,
    decimals: 1,
    step: 0.1,
    min: -10,
    max: 10,
    unit: "%",
    description: "Aumenta a frequência com carga para compensar a queda de rotação.",
  }),
  parameter("P139", "Filtro Corrente de Saída", {
    category: "controle_motor",
    value: 0.005,
    decimals: 3,
    step: 0.001,
    max: 9.999,
    unit: "s",
  }),
  parameter("P140", "Filtro Compensação de Escorregamento", {
    category: "controle_motor",
    value: 0.5,
    decimals: 3,
    step: 0.001,
    max: 9.999,
    unit: "s",
  }),
  parameter("P142", "Tensão de Saída Máxima", {
    category: "controle_motor",
    value: 100,
    decimals: 1,
    step: 0.1,
    max: 100,
    unit: "%",
    description: "Tensão máxima da curva V/f, em % da tensão nominal do motor.",
  }),
  parameter("P143", "Tensão de Saída Intermediária", {
    category: "controle_motor",
    value: 50,
    decimals: 1,
    step: 0.1,
    max: 100,
    unit: "%",
    description: "Tensão no ponto intermediário da curva V/f.",
  }),
  parameter("P145", "Frequência de Início de Enfraquecimento de Campo", {
    category: "controle_motor",
    value: 60,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Acima desta frequência a tensão satura e o torque disponível cai.",
  }),
  parameter("P146", "Frequência de Saída Intermediária", {
    category: "controle_motor",
    value: 30,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Frequência do ponto intermediário da curva V/f.",
  }),
  ...[
    ["P149", "Compensação do Link DC"],
    ["P150", "Tipo de Regulação Ud e LC"],
    ["P151", "Nível de Regulação Ud V/f"],
    ["P178", "Fluxo Nominal"],
  ].map(([code, name]) => parameter(code, name, { category: "controle_motor" })),
  parameter("P156", "Corrente de Sobrecarga", {
    category: "controle_motor",
    value: 1.68, // 1.2 x Inom
    decimals: 1,
    step: 0.1,
    max: 10,
    unit: "A",
    description: "Corrente de atuação da proteção de sobrecarga (Ixt).",
  }),

  parameter("P200", "Senha", {
    category: "senha_display_controle",
    max: 9999,
    description: "Ativa, desativa ou programa uma nova senha para acesso aos parâmetros.",
  }),
  parameter("P202", "Tipo de Controle", cfg({
    category: "senha_display_controle",
    value: 0,
    max: 5,
    description: "Define o modo de controle do inversor.\n" +
      "0 = V/f linear (curva por pontos P142/P143/P145/P146)\n" +
      "1 = V/f quadrático (ideal para cargas centrífugas: bombas e ventiladores)\n" +
      "2 = V/f linear com compensação de corrente ativa\n" +
      "3 = V/f quadrático com compensação de corrente ativa\n" +
      "4 = Sem função (não utilizado no CFW100)\n" +
      "5 = VVW (Voltage Vector control with boost automático e escorregamento corrigido)",
  })),
  parameter("P204", "Carrega/Salva Parâmetros", cfg({ category: "senha_display_controle" })),
  parameter("P207", "Parâmetro para Barra", { category: "senha_display_controle" }),
  parameter("P208", "Fundo de Escala da Referência", { category: "senha_display_controle" }),
  parameter("P209", "Unidade de Engenharia da Referência", { category: "senha_display_controle" }),
  parameter("P210", "Forma de Indicação da Referência", { category: "senha_display_controle" }),
  parameter("P213", "Fator de Escala da Barra", { category: "senha_display_controle" }),
  parameter("P219", "Redução da Frequência de Chaveamento", { category: "senha_display_controle" }),

  ...[
    ["P220", "Seleção Fonte LOC/REM", 0, 11],
    ["P221", "Seleção Referência LOC", 0, 17],
    ["P222", "Seleção Referência REM", 2, 17],
    ["P223", "Seleção Giro LOC", 0, 12],
    ["P224", "Seleção Gira/Para LOC", 0, 5],
    ["P225", "Seleção JOG LOC", 1, 6],
    ["P226", "Seleção Giro REM", 2, 12],
    ["P227", "Seleção Gira/Para REM", 3, 5],
    ["P228", "Seleção JOG REM", 1, 6],
  ].map(([code, name, value, max]) =>
    parameter(code, name, {
      category: "comando_referencia",
      value,
      max,
    }),
  ),

  ...[
    ["P231", "Função do Sinal AI1"],
    ["P232", "Ganho da Entrada AI1"],
    ["P233", "Sinal da Entrada AI1"],
    ["P234", "Offset da Entrada AI1"],
    ["P235", "Filtro da Entrada AI1"],
    ["P245", "Filtro da Entrada em Frequência FI"],
    ["P246", "Entrada em Frequência FI"],
    ["P247", "Ganho da Entrada FI"],
    ["P248", "Entrada FI Mínima"],
    ["P249", "Offset da Entrada FI"],
    ["P250", "Entrada FI Máxima"],
    ["P251", "Função da Saída AO1"],
    ["P252", "Ganho da Saída AO1"],
    ["P253", "Sinal da Saída AO1"],
  ].map(([code, name]) => parameter(code, name, { category: "analogicas_frequencia" })),

  ...Array.from({ length: 8 }, (_, index) =>
    parameter(`P${263 + index}`, `Função da Entrada DI${index + 1}`, {
      category: "entradas_digitais",
    }),
  ),
  parameter("P271", "Sinal das DIs", { category: "entradas_digitais" }),

  ...[
    ["P275", "Função da Saída DO1"],
    ["P276", "Função da Saída DO2"],
    ["P277", "Função da Saída DO3"],
    ["P281", "Frequência Fx"],
    ["P282", "Corrente Ix"],
    ["P283", "Histerese para Fx e Ix"],
    ["P284", "Histerese para Torque"],
    ["P285", "Torque Tx"],
  ].map(([code, name]) => parameter(code, name, { category: "saidas_digitais" })),

  ...[
    ["P299", "Tempo Frenagem na Partida"],
    ["P300", "Tempo Frenagem na Parada"],
    ["P301", "Frequência de Início"],
    ["P302", "Tensão Frenagem CC"],
    ["P303", "Frequência Evitada 1"],
    ["P304", "Frequência Evitada 2"],
    ["P306", "Faixa Evitada"],
    ["P308", "Endereço Serial"],
    ["P310", "Taxa de Comunicação Serial"],
    ["P311", "Configuração dos Bytes Serial"],
    ["P312", "Protocolo Serial"],
    ["P313", "Ação para Erro de Comunicação"],
    ["P314", "Watchdog Serial"],
    ["P316", "Estado da Interface Serial"],
  ].map(([code, name]) => parameter(code, name, { category: "frenagem_serial" })),

  ...[
    ["P320", "Flying Start/Ride-Through"],
    ["P331", "Rampa de Tensão"],
    ["P332", "Tempo Morto"],
    ["P340", "Tempo Auto-Reset"],
    ["P375", "Temperatura do NTC"],
    ["P397", "Compensação de Escorregamento Regenerativo"],
  ].map(([code, name]) => parameter(code, name, { category: "flying_motor" })),

  parameter("P399", "Rendimento Nominal do Motor", cfg({
    category: "dados_motor",
    value: 67,
    decimals: 1,
    step: 0.1,
    max: 100,
    unit: "%",
  })),
  parameter("P400", "Tensão Nominal do Motor", cfg({
    category: "dados_motor",
    value: 220,
    min: 127, // Item 15: mínimo realista para CFW100 versão 200 V
    max: 240,
    unit: "V",
    description: "Tensão nominal do motor; base da curva V/f.",
  })),
  parameter("P401", "Corrente Nominal do Motor", cfg({
    category: "dados_motor",
    value: 1.4,
    decimals: 1,
    step: 0.1,
    max: 10,
    unit: "A",
    description: "Corrente nominal do motor; referência de carga e proteções.",
  })),
  parameter("P402", "Rotação Nominal do Motor", cfg({
    category: "dados_motor",
    value: 1720,
    max: 9999,
    unit: "rpm",
    description: "Rotação nominal; usada para calcular rpm e escorregamento.",
  })),
  parameter("P403", "Frequência Nominal do Motor", cfg({
    category: "dados_motor",
    value: 60,
    decimals: 1,
    step: 0.1,
    max: 300,
    unit: "Hz",
    description: "Frequência nominal; ponto nominal da curva V/f.",
  })),
  parameter("P404", "Potência Nominal do Motor", cfg({
    category: "dados_motor",
    value: 2,
    max: 5,
    description: "Código da potência nominal do motor.",
  })),
  parameter("P407", "Fator de Potência Nominal do Motor", cfg({
    category: "dados_motor",
    value: 0.69,
    decimals: 2,
    step: 0.01,
    min: 0.5,
    max: 0.99,
    description: "Fator de potência nominal; usado no cálculo de corrente e torque.",
  })),
  parameter("P409", "Resistência do Estator", cfg({
    category: "dados_motor",
    value: 10.63,
    decimals: 2,
    step: 0.01,
    min: 0.01,
    max: 99.99,
    unit: "ohm",
  })),

  ...[
    ["P680", "Estado Lógico"],
    ["P681", "Velocidade 13 bits"],
    ["P682", "Controle Serial"],
    ["P683", "Referência de Velocidade Serial"],
    ["P684", "Controle CO/DN"],
    ["P685", "Referência de Velocidade CO/DN"],
    ["P700", "Protocolo CAN"],
    ["P701", "Endereco CAN"],
    ["P702", "Taxa de Comunicação CAN"],
    ["P703", "Reset de Bus Off"],
    ["P705", "Estado Controlador CAN"],
    ["P706", "Telegramas CAN RX"],
    ["P707", "Telegramas CAN TX"],
    ["P708", "Contador de Bus Off"],
    ["P709", "Mensagens CAN Perdidas"],
    ["P710", "Instâncias I/O DeviceNet"],
    ["P711", "Leitura #3 DeviceNet"],
    ["P712", "Leitura #4 DeviceNet"],
    ["P713", "Leitura #5 DeviceNet"],
    ["P714", "Leitura #6 DeviceNet"],
    ["P715", "Escrita #3 DeviceNet"],
    ["P716", "Escrita #4 DeviceNet"],
    ["P717", "Escrita #5 DeviceNet"],
    ["P718", "Escrita #6 DeviceNet"],
    ["P719", "Estado Rede DeviceNet"],
    ["P720", "Estado Mestre DeviceNet"],
    ["P721", "Estado Comunicação CANopen"],
    ["P722", "Estado do Nó CANopen"],
  ].map(([code, name]) => parameter(code, name, { category: "comunicacao" })),

  parameter("P770", "Nome Bluetooth", { category: "bluetooth_softplc" }),
  parameter("P771", "Senha Bluetooth", { category: "bluetooth_softplc" }),
  parameter("P840", "Estado Teclas Controle", { category: "bluetooth_softplc" }),
  parameter("P900", "Estado da SoftPLC", { category: "bluetooth_softplc" }),
  parameter("P901", "Comando para SoftPLC", { category: "bluetooth_softplc" }),
  parameter("P902", "Tempo Ciclo Scan", { category: "bluetooth_softplc" }),
  ...Array.from({ length: 50 }, (_, index) =>
    parameter(`P${910 + index}`, `Parâmetro SoftPLC ${index + 1}`, {
      category: "bluetooth_softplc",
    }),
  ),
];

function buildReferenceOnlyParameter(reference) {
  return parameter(reference.code, reference.name, {
    category: reference.category,
    editable: reference.editable,
    properties: reference.properties,
  });
}

export const CFW100_PARAMETER_SCHEMA = [
  ...BASE_PARAMETER_SCHEMA,
  ...referenceData.parameters
    .filter((reference) => !BASE_PARAMETER_SCHEMA.some((parameterItem) => parameterItem.code === reference.code))
    .map(buildReferenceOnlyParameter),
].sort((a, b) => Number(a.code.slice(1)) - Number(b.code.slice(1)));

function flattenParameterSchema(parameterSchema) {
  return {
    code: parameterSchema.code,
    name: parameterSchema.manual.name,
    category: parameterSchema.manual.category,
    categoryLabel: parameterSchema.manual.categoryLabel,
    value: parameterSchema.runtime.value,
    editable: parameterSchema.runtime.editable,
    decimals: parameterSchema.runtime.decimals,
    step: parameterSchema.runtime.step,
    min: parameterSchema.runtime.min,
    max: parameterSchema.runtime.max,
    unit: parameterSchema.runtime.unit,
    properties: parameterSchema.runtime.properties,
    implementationStatus: parameterSchema.simulation.implementationStatus,
    simulationEffects: parameterSchema.simulation.effects,
    description: parameterSchema.manual.description,
    shortDescription: parameterSchema.manual.shortDescription,
    longDescription: parameterSchema.manual.longDescription,
    example: parameterSchema.manual.example,
    relatedParameters: parameterSchema.simulation.relatedParameters,
    difficulty: parameterSchema.manual.difficulty,
    simulatorBehavior: parameterSchema.simulation.simulatorBehavior,
    range: parameterSchema.manual.range,
    factoryDefault: parameterSchema.manual.factoryDefault,
    pageReference: parameterSchema.manual.pageReference,
    access: parameterSchema.manual.access,
    readOnly: parameterSchema.runtime.readOnly,
    requiresStoppedMotor: parameterSchema.runtime.requiresStoppedMotor,
    requiresAccessory: parameterSchema.manual.requiresAccessory,
    options: parameterSchema.runtime.options,
    editCondition: parameterSchema.manual.editCondition,
  };
}

export const CFW100_PARAMETER_CATALOG =
  CFW100_PARAMETER_SCHEMA.map(flattenParameterSchema);





