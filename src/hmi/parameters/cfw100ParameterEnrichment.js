// Conteúdo didático complementar aos dados do manual (cfw100ParameterReference.json).
// O JSON traz dados oficiais (faixa, padrão, acesso, descrição). Aqui adicionamos
// o que o JSON não possui e que ajuda o estudo: descrição detalhada, exemplo
// prático, parâmetros relacionados e nível de dificuldade. Só preenchemos onde
// conseguimos ser fiéis ao comportamento real do CFW100; o resto usa fallback.

export const PARAMETER_ENRICHMENT = {
  P000: {
    difficulty: "basico",
    relatedParameters: ["P200"],
    longDescription:
      "Ponto de liberação de acesso. Com a senha ativa (P200 = 1), o usuário digita aqui a senha gravada; depois disso o display mostra apenas 1 para acesso liberado ou 0 para acesso bloqueado, mantendo o valor real oculto.",
    example:
      "Com P200 = 1, ajuste P000 com a senha gravada para liberar a edição. Se a senha estiver inativa, P000 não aparece na HMI.",
  },
  P001: {
    difficulty: "basico",
    relatedParameters: ["P121", "P133", "P134", "P005"],
    longDescription:
      "Mostra a referência de velocidade ativa, ou seja, o alvo de frequência que o inversor tenta atingir pela rampa. É somente leitura: reflete P121 (HMI) limitado por P133 e P134.",
    example:
      "Ajustando a referência da HMI para 45.0 Hz, P001 passa a indicar 45.0 Hz, e a saída (P005) sobe via rampa até esse valor.",
  },
  P002: {
    difficulty: "basico",
    relatedParameters: ["P005", "P402"],
    longDescription:
      "Velocidade estimada do eixo do motor, derivada da frequência de saída e dos dados nominais do motor. Acompanha P005 proporcionalmente.",
    example:
      "Para um motor de 4 polos a 60 Hz, P002 indica aproximadamente 1800 rpm.",
  },
  P003: {
    difficulty: "basico",
    relatedParameters: ["P005", "P401", "P135"],
    longDescription:
      "Corrente eficaz que o inversor entrega ao motor. Sobe com a carga e durante a aceleração; usada nas proteções de sobrecarga.",
    example:
      "Em vazio a corrente fica perto da corrente de magnetização; sob carga nominal aproxima-se da corrente nominal do motor (P401).",
  },
  P004: {
    difficulty: "basico",
    relatedParameters: ["P007"],
    longDescription:
      "Tensão do barramento CC interno (após a ponte retificadora). Em rede 220 V fica em torno de 311 V. Quedas geram subtensão (Sub); excesso gera sobretensão.",
    example:
      "Alimentado em 220 Vca, P004 estabiliza por volta de 311 Vcc com o inversor pronto.",
  },
  P005: {
    difficulty: "basico",
    relatedParameters: ["P001", "P002", "P100", "P101"],
    longDescription:
      "Frequência realmente aplicada ao motor neste instante. Evolui de 0 até a referência obedecendo às rampas de aceleração (P100) e desaceleração (P101).",
    example:
      "Com P100 = 5.0 s e referência 60.0 Hz, P005 sai de 0.0 e chega a 60.0 Hz em aproximadamente 5 s.",
  },
  P006: {
    difficulty: "basico",
    relatedParameters: ["P005"],
    longDescription:
      "Estado operacional do inversor. No display aparece como rdY (pronto), o valor de frequência (em funcionamento), Sub (subtensão), conF (configuração inválida) ou Fxxx/Axxx (falha/alarme).",
    example:
      "Parado e sem falhas mostra rdY; ao acionar I, passa a indicar a frequência de saída.",
  },
  P100: {
    difficulty: "basico",
    relatedParameters: ["P101", "P102", "P103", "P104", "P105"],
    longDescription:
      "Tempo da rampa de aceleração: quanto o inversor leva para elevar a frequência de 0 até a frequência máxima (P134). Valores maiores deixam a partida mais suave; menores tornam a aceleração mais brusca e exigem mais corrente.",
    example:
      "Com P100 = 5.0 s, P134 = 60.0 Hz e referência 60.0 Hz, a saída sobe de 0.0 a 60.0 Hz em cerca de 5 s. Se a referência for 30.0 Hz, leva cerca de 2,5 s.",
  },
  P101: {
    difficulty: "basico",
    relatedParameters: ["P100", "P102", "P103"],
    longDescription:
      "Tempo da rampa de desaceleração: quanto o inversor leva para reduzir a frequência de P134 até 0. Tempos curtos podem elevar a tensão do barramento CC por regeneração.",
    example:
      "Com P101 = 10.0 s, ao parar a partir de 60.0 Hz a saída cai a 0.0 Hz em cerca de 10 s.",
  },
  P121: {
    difficulty: "basico",
    relatedParameters: ["P001", "P120", "P133", "P134"],
    longDescription:
      "Referência de frequência ajustada pelas teclas da HMI. É o alvo de velocidade quando a fonte de referência é o teclado. Sempre limitada por P133 (mínima) e P134 (máxima).",
    example:
      "Pressionando ▲ no modo monitoração, P121 sobe de 0.1 em 0.1 Hz até o limite de P134.",
  },
  P133: {
    difficulty: "basico",
    relatedParameters: ["P134", "P121", "P001"],
    longDescription:
      "Frequência mínima de operação. Com o motor acionado, a saída nunca fica abaixo deste valor, mesmo que a referência seja menor. Protege motor e carga de operar muito devagar.",
    example:
      "Com P133 = 3.0 Hz e referência 0.0 Hz, ao acionar I o motor estabiliza em 3.0 Hz, não em 0.",
  },
  P134: {
    difficulty: "basico",
    relatedParameters: ["P133", "P121", "P208"],
    longDescription:
      "Frequência máxima de operação. Limita a referência e a saída; também é a referência das rampas P100/P101 (tempo de 0 até P134).",
    example:
      "Com P134 = 66.0 Hz, mesmo pedindo mais pela HMI a saída não ultrapassa 66.0 Hz.",
  },
  P200: {
    difficulty: "intermediario",
    relatedParameters: ["P000"],
    longDescription:
      "Controla a senha de acesso: 0 desativa, 1 indica senha ativa e valores de 2 a 9999 programam uma nova senha. Depois de salvar uma nova senha, o próprio P200 volta a mostrar 1.",
    example:
      "Programe um valor entre 2 e 9999 em P200 para criar ou alterar a senha. Com a proteção ativa, libere o acesso digitando a senha atual em P000.",
  },
  P202: {
    difficulty: "intermediario",
    relatedParameters: ["P400", "P401", "P402", "P403"],
    longDescription:
      "Seleciona o modo de controle do motor (V/f linear, V/f quadrático ou VVW). Por exigir motor parado, só pode ser alterado com o inversor desabilitado.",
    example:
      "Para cargas de bomba/ventilador, V/f quadrático reduz consumo em baixa rotação.",
  },
};

const DIFFICULTY_BY_RANGE = [
  { test: (n) => n <= 99, level: "basico" },
  { test: (n) => n <= 199, level: "basico" },
  { test: (n) => n <= 319, level: "intermediario" },
  { test: (n) => n <= 398, level: "intermediario" },
  { test: (n) => n <= 499, level: "avancado" },
];

export function deriveDifficulty(code, properties = []) {
  const explicit = PARAMETER_ENRICHMENT[code]?.difficulty;
  if (explicit) {
    return explicit;
  }

  const number = Number(code.slice(1));
  if (Number.isNaN(number)) {
    return "intermediario";
  }

  // Comunicação / SoftPLC / dados de motor são os mais avançados.
  if (number >= 500 || properties.includes("VVW")) {
    return "avancado";
  }

  const match = DIFFICULTY_BY_RANGE.find((entry) => entry.test(number));
  return match ? match.level : "intermediario";
}

export const DIFFICULTY_LABEL = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};
