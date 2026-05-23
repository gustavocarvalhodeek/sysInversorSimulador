function data(label, value, unit = "") {
  return { label, value, unit };
}

function state(name, description) {
  return { name, description };
}

function point(label, value) {
  return { label, value };
}

function binaryChart() {
  return [
    point("0 ms", 0),
    point("100 ms", 0),
    point("200 ms", 1),
    point("300 ms", 1),
  ];
}

function pulseChart() {
  return [
    point("0 ms", 0),
    point("80 ms", 1),
    point("160 ms", 0),
    point("240 ms", 1),
  ];
}

function rampChart() {
  return [
    point("0 s", 0),
    point("2 s", 18),
    point("4 s", 36),
    point("6 s", 60),
  ];
}

function inrushChart() {
  return [
    point("0 ms", 0),
    point("50 ms", 100),
    point("120 ms", 60),
    point("220 ms", 35),
  ];
}

function thermalChart() {
  return [
    point("0 s", 25),
    point("10 s", 40),
    point("20 s", 62),
    point("30 s", 78),
  ];
}

function analogChart() {
  return [
    point("0%", 0),
    point("25%", 25),
    point("50%", 50),
    point("100%", 100),
  ];
}

function tripChart() {
  return [
    point("0 s", 0),
    point("4 s", 20),
    point("8 s", 55),
    point("12 s", 100),
  ];
}

function voltageChart() {
  return [
    point("0 ms", 24),
    point("40 ms", 24),
    point("80 ms", 23.8),
    point("120 ms", 24),
  ];
}

function component(config) {
  return {
    kind: "component",
    status: "planned",
    simulationMode: "planned",
    description: "",
    functionDescription: "",
    operatingPrinciple: "",
    typicalApplications: [],
    mainData: [],
    visualStates: [],
    chartTitle: "Curva didatica",
    chartDescription: "Representacao conceitual do comportamento do componente.",
    chartData: [],
    tags: [],
    limitations: [],
    ...config,
  };
}

export const SIMULATABLE_COMPONENTS = [
  component({
    id: "cfw100",
    name: "Inversor WEG CFW100",
    shortName: "CFW100",
    categoryId: "drives",
    kind: "drive",
    status: "available",
    simulationMode: "full",
    description: "Inversor didatico com simulacao completa de HMI, parametros, motor e protecoes.",
    functionDescription:
      "Controla a velocidade do motor por variacao de frequencia, rampa, referencia e logica de comando.",
    operatingPrinciple:
      "Retifica a entrada, forma um barramento CC e sintetiza uma saida CA PWM com frequencia variavel para o motor.",
    typicalApplications: [
      "Bancadas didaticas de acionamentos eletricos.",
      "Bombas, ventiladores e esteiras com variacao de velocidade.",
    ],
    mainData: [
      data("Tensao de entrada tipica", "220", "Vca"),
      data("Frequencia de saida", "0 a 66", "Hz"),
      data("Modos didaticos", "HMI, presets, falhas, motor", ""),
      data("Estado atual no projeto", "Simulador principal aberto", ""),
    ],
    visualStates: [
      state("Ready", "Equipamento energizado e pronto para partir."),
      state("Run", "Saida ativa com frequencia aplicada ao motor."),
      state("Falha", "Protecao ativa com codigo de falha no display."),
    ],
    chartTitle: "Rampa de frequencia",
    chartDescription:
      "Curva didatica da frequencia de saida durante uma aceleracao controlada.",
    chartData: rampChart(),
    tags: ["WEG", "VFD", "PWM", "motor"],
    limitations: [
      "A biblioteca nao troca o simulador atual; o CFW100 continua na tela principal.",
      "Os detalhes desta biblioteca resumem o modulo existente, sem duplicar toda a HMI aqui.",
    ],
  }),
  component({
    id: "soft-starter",
    name: "Soft starter",
    shortName: "Soft starter",
    categoryId: "drives",
    kind: "drive",
    description: "Partida eletronica suave para reduzir pico de corrente e impacto mecanico.",
    functionDescription:
      "Limita a tensao aplicada ao motor durante a partida e, em muitos casos, durante a parada suave.",
    operatingPrinciple:
      "Controla o angulo de disparo de tiristores para elevar gradualmente a tensao eficaz no motor.",
    typicalApplications: [
      "Bombas e ventiladores com necessidade de partida suave.",
      "Transportadores com reducao de tranco mecanico.",
    ],
    mainData: [
      data("Grandeza principal", "Tensao eficaz de partida", ""),
      data("Comportamento esperado", "Reducao de corrente de partida", ""),
      data("Elemento de potencia", "Tiristores em antiparalelo", ""),
    ],
    visualStates: [
      state("Pronto", "Equipamento alimentado e aguardando comando."),
      state("Rampa de partida", "Tensao sobe progressivamente no motor."),
      state("Bypass", "Motor em regime com caminho de potencia estabilizado."),
    ],
    chartTitle: "Corrente de partida suavizada",
    chartDescription:
      "Representacao conceitual da corrente reduzida durante a partida suave.",
    chartData: inrushChart(),
    tags: ["partida", "tiristor", "corrente"],
    limitations: [
      "Este componente ainda nao possui simulacao interativa.",
      "A curva exibida e apenas didatica e nao substitui a folha tecnica do fabricante.",
    ],
  }),
  component({
    id: "generic-vfd",
    name: "Inversor de frequencia generico",
    shortName: "VFD generico",
    categoryId: "drives",
    kind: "drive",
    description: "Representacao conceitual de um inversor de frequencia fora do modelo CFW100.",
    functionDescription:
      "Permite estudar o papel do VFD no controle de torque, velocidade e rampas de aceleracao.",
    operatingPrinciple:
      "Usa eletronia de potencia para converter energia fixa em saida controlada por frequencia e tensao.",
    typicalApplications: [
      "Comparacao didatica entre familias de inversores.",
      "Introducao a controle escalar e vetorial.",
    ],
    mainData: [
      data("Variavel de controle", "Frequencia de saida", "Hz"),
      data("Topologia comum", "Retificador + barramento CC + inversor PWM", ""),
      data("Niveis de simulacao", "Apenas informativo nesta fase", ""),
    ],
    visualStates: [
      state("Desligado", "Sem alimentacao ou sem habilitacao de potencia."),
      state("Pronto", "Referencia configurada e comando disponivel."),
      state("Operando", "Motor recebendo frequencia controlada."),
    ],
    chartTitle: "Perfil conceitual de velocidade",
    chartDescription:
      "Curva didatica de referencia de velocidade aplicada por um VFD.",
    chartData: rampChart(),
    tags: ["VFD", "controle", "velocidade"],
    limitations: [
      "Nao representa um fabricante especifico nem substitui o simulador do CFW100.",
      "Nao ha parametros interativos nem tela dedicada para outros inversores.",
    ],
  }),
  component({
    id: "thermal-magnetic-breaker",
    name: "Disjuntor termomagnetico",
    shortName: "Disjuntor TM",
    categoryId: "protection",
    kind: "protection",
    status: "visualOnly",
    simulationMode: "visualOnly",
    description: "Protecao contra sobrecarga e curto-circuito em circuitos de forca e comando.",
    functionDescription:
      "Secciona o circuito e interrompe a corrente quando a resposta termica ou magnetica ultrapassa o limite.",
    operatingPrinciple:
      "Combina um elemento termico para sobrecorrente sustentada e um elemento magnetico para faltas abruptas.",
    typicalApplications: [
      "Alimentacao de paines eletricos.",
      "Protecao de circuitos de motores e cargas auxiliares.",
    ],
    mainData: [
      data("Curvas comuns", "B, C e D", ""),
      data("Protecao principal", "Sobrecarga e curto", ""),
      data("Acionamento", "Manual com disparo automatico", ""),
    ],
    visualStates: [
      state("Fechado", "Circuito energizado e alavanca em operacao."),
      state("Disparado", "Mecanismo abriu o circuito por falha."),
      state("Rearmado", "Pronto para religamento manual apos verificacao."),
    ],
    chartTitle: "Corrente x tempo de disparo",
    chartDescription:
      "Curva conceitual mostrando que correntes maiores reduzem o tempo de disparo.",
    chartData: tripChart(),
    tags: ["protecao", "curva", "disparo"],
    limitations: [
      "A visualizacao e apenas conceitual e nao calcula curva real de fabricante.",
      "Nao existe atuacao ligada ao simulador principal nesta fase.",
    ],
  }),
  component({
    id: "fuse",
    name: "Fusivel",
    shortName: "Fusivel",
    categoryId: "protection",
    kind: "protection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Elemento de protecao por fusao do elo quando a corrente excede o limite.",
    functionDescription:
      "Protege circuitos contra curto-circuito e, dependendo da classe, contra sobrecorrentes especificas.",
    operatingPrinciple:
      "O elo fusivel aquece por efeito Joule ate romper, abrindo o circuito protegido.",
    typicalApplications: [
      "Protecao de semicondutores, fontes e circuitos de potencia.",
      "Seccionamento complementar em paines industriais.",
    ],
    mainData: [
      data("Grandeza critica", "Corrente nominal", "A"),
      data("Resposta", "Fusao do elo", ""),
      data("Classes comuns", "gG, aM, ultra rapido", ""),
    ],
    visualStates: [
      state("Integro", "Elo em condicao normal e circuito fechado."),
      state("Sobrecorrente", "Aquecimento crescente no elemento fusivel."),
      state("Aberto", "Elo fundido e circuito interrompido."),
    ],
    chartTitle: "Aquecimento do elo",
    chartDescription:
      "Representacao conceitual do aumento termico que leva a fusao do elo.",
    chartData: thermalChart(),
    tags: ["elo", "curto", "seccionamento"],
    limitations: [
      "Nao ha modelagem de energia passante nem selecao de classe fusivel.",
      "Os dados sao didaticos e nao executam protecao real no projeto.",
    ],
  }),
  component({
    id: "thermal-overload-relay",
    name: "Rele termico",
    shortName: "Rele termico",
    categoryId: "protection",
    kind: "protection",
    description: "Protecao contra sobrecarga sustentada em motores de inducao.",
    functionDescription:
      "Monitora o efeito termico da corrente e abre o circuito de comando quando o ajuste e excedido.",
    operatingPrinciple:
      "Elementos bimetalicos ou equivalentes termicos deformam com o aquecimento e acionam o contato de disparo.",
    typicalApplications: [
      "Comando de motores com contator.",
      "Paines de partida direta ou reversora.",
    ],
    mainData: [
      data("Referencia principal", "Faixa de ajuste de corrente", "A"),
      data("Acoplamento tipico", "A jusante do contator", ""),
      data("Reset", "Manual ou automatico", ""),
    ],
    visualStates: [
      state("Normal", "Corrente dentro da faixa ajustada."),
      state("Aquecendo", "Sobrecarga acumulando energia termica."),
      state("Disparado", "Contato de comando aberto por sobrecarga."),
    ],
    chartTitle: "Acumulo termico",
    chartDescription:
      "Curva conceitual do aquecimento acumulado ate o ponto de disparo.",
    chartData: tripChart(),
    tags: ["motor", "sobrecarga", "bimetal"],
    limitations: [
      "Ainda nao ha simulacao interativa de disparo termico independente.",
      "A sobrecarga real do app continua vinculada ao CFW100 e ao modelo existente.",
    ],
  }),
  component({
    id: "surge-protection-device",
    name: "DPS",
    shortName: "DPS",
    categoryId: "protection",
    kind: "protection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Dispositivo de protecao contra surtos para limitar sobretensoes transitivas.",
    functionDescription:
      "Desvia surtos para o aterramento e ajuda a preservar eletronia sensivel no painel.",
    operatingPrinciple:
      "Mantem alta impedancia em regime normal e baixa impedancia durante a sobretensao transitiva.",
    typicalApplications: [
      "Quadros de comando com equipamentos eletronicos.",
      "Protecao de fontes, IHMs e inversores contra surtos.",
    ],
    mainData: [
      data("Parametro chave", "Nivel de protecao Up", ""),
      data("Instalacao", "Entre fase, neutro e terra", ""),
      data("Evento protegido", "Surtos transitivos", ""),
    ],
    visualStates: [
      state("Stand-by", "Em espera, sem conduzir em regime normal."),
      state("Limitando surto", "Desvia energia para reduzir a sobretensao."),
      state("Fim de vida", "Pode exigir substituicao apos eventos severos."),
    ],
    chartTitle: "Pico de tensao limitado",
    chartDescription:
      "Exemplo conceitual de um surto reduzido pelo DPS durante um evento transitivo.",
    chartData: [
      point("0 us", 0),
      point("5 us", 100),
      point("10 us", 45),
      point("15 us", 10),
    ],
    tags: ["surto", "aterramento", "protecao"],
    limitations: [
      "Nao ha simulacao de surto, aterramento ou energia dissipada.",
      "A curva mostrada serve apenas para entendimento visual do principio.",
    ],
  }),
  component({
    id: "phase-loss-relay",
    name: "Rele falta de fase",
    shortName: "Falta de fase",
    categoryId: "protection",
    kind: "protection",
    description: "Monitor de rede trifasica para falta, sequencia ou desequilibrio de fase.",
    functionDescription:
      "Bloqueia o circuito de comando quando detecta condicao insegura na alimentacao trifasica.",
    operatingPrinciple:
      "Compara presenca e ordem das fases, atuando um rele interno quando a rede sai da faixa configurada.",
    typicalApplications: [
      "Paineis de motores trifasicos.",
      "Protecao de bombas e ventiladores em redes industriais.",
    ],
    mainData: [
      data("Rede monitorada", "Trifasica", ""),
      data("Falhas tipicas", "Falta, inversao e desequilibrio", ""),
      data("Saida", "Contato de rele", ""),
    ],
    visualStates: [
      state("Rede valida", "Sequencia e tensao dentro do esperado."),
      state("Alarme de fase", "Falha detectada no monitoramento."),
      state("Saida bloqueada", "Contato interno muda para impedir o comando."),
    ],
    chartTitle: "Presenca de fase ao longo do tempo",
    chartDescription:
      "Exemplo conceitual de perda de uma fase e consequente bloqueio do rele.",
    chartData: [
      point("0 s", 100),
      point("2 s", 100),
      point("4 s", 35),
      point("6 s", 0),
    ],
    tags: ["fase", "rede", "monitoramento"],
    limitations: [
      "Ainda nao ha simulacao interativa de rede trifasica externa.",
      "O item serve como visualizacao didatica do principio de protecao.",
    ],
  }),
  component({
    id: "contactor",
    name: "Contator",
    shortName: "Contator",
    categoryId: "control-signaling",
    kind: "control",
    description: "Elemento eletromecanico para comutar cargas e motores por comando de bobina.",
    functionDescription:
      "Fecha ou abre contatos principais e auxiliares quando a bobina de comando e energizada.",
    operatingPrinciple:
      "Um campo magnetico atrai o nucleo movel, deslocando os contatos para alterar o estado do circuito.",
    typicalApplications: [
      "Partida direta de motores.",
      "Comandos com selo, reversao e intertravamento.",
    ],
    mainData: [
      data("Sinal de comando", "Bobina CA ou CC", ""),
      data("Contatos", "Principais e auxiliares", ""),
      data("Uso comum", "Acionamento de cargas", ""),
    ],
    visualStates: [
      state("Desenergizado", "Bobina sem tensao e contatos em repouso."),
      state("Atracado", "Bobina energizada e nucleo magnetico acionado."),
      state("Contatos fechados", "Carga conectada pelo conjunto principal."),
    ],
    chartTitle: "Estado da bobina e dos contatos",
    chartDescription:
      "Sinal logico simples mostrando o momento em que a bobina fecha os contatos.",
    chartData: binaryChart(),
    tags: ["bobina", "contatos", "potencia"],
    limitations: [
      "Ainda nao ha simulacao de desgaste, arco ou enclausuramento mecanico.",
      "O comportamento mostrado nao aciona cargas reais dentro do projeto.",
    ],
  }),
  component({
    id: "auxiliary-relay",
    name: "Rele auxiliar",
    shortName: "Rele auxiliar",
    categoryId: "control-signaling",
    kind: "control",
    description: "Rele para multiplicar contatos e implementar logica de comando.",
    functionDescription:
      "Replica um comando em varios contatos auxiliares, isolando niveis de potencia e sinal.",
    operatingPrinciple:
      "A bobina energiza um nucleo que desloca contatos NA e NF para novos estados logicos.",
    typicalApplications: [
      "Selagem de comandos.",
      "Intertravamentos e sinalizacao de etapas.",
    ],
    mainData: [
      data("Tipo de sinal", "Digital", ""),
      data("Contatos usuais", "NA e NF", ""),
      data("Interface", "Bobina de rele", ""),
    ],
    visualStates: [
      state("Repouso", "Contatos permanecem no estado original."),
      state("Energizado", "Bobina ativa e contatos comutados."),
      state("Retorno", "Mola reposiciona o conjunto apos a retirada do sinal."),
    ],
    chartTitle: "Comutacao de contato auxiliar",
    chartDescription:
      "Representacao conceitual do pulso de comando e da troca de estado logico.",
    chartData: pulseChart(),
    tags: ["logica", "selo", "contatos"],
    limitations: [
      "Nao ha circuito de comando associado a este rele dentro da biblioteca.",
      "Os contatos mostrados sao conceituais e nao editaveis.",
    ],
  }),
  component({
    id: "timer-relay",
    name: "Rele temporizador",
    shortName: "Temporizador",
    categoryId: "control-signaling",
    kind: "control",
    description: "Rele de tempo para atrasar ou estender eventos de comando.",
    functionDescription:
      "Introduz atraso na energizacao ou desenergizacao de contatos para compor sequencias.",
    operatingPrinciple:
      "Um circuito temporizador interno conta um intervalo e depois altera o estado dos contatos.",
    typicalApplications: [
      "Sequencias de partida.",
      "Sinalizacoes temporizadas e intertravamentos de processo.",
    ],
    mainData: [
      data("Grandeza principal", "Tempo ajustado", "s"),
      data("Funcao comum", "Retardo na energizacao", ""),
      data("Saida", "Contato temporizado", ""),
    ],
    visualStates: [
      state("Aguardando", "Bobina ativa, mas contato ainda nao comutou."),
      state("Temporizando", "Contagem interna em andamento."),
      state("Comutado", "Contato mudou apos o tempo configurado."),
    ],
    chartTitle: "Tempo de retardo",
    chartDescription:
      "Curva conceitual onde o comando ocorre antes da resposta do contato temporizado.",
    chartData: [
      point("0 s", 0),
      point("1 s", 0),
      point("2 s", 0),
      point("3 s", 1),
    ],
    tags: ["tempo", "sequencia", "controle"],
    limitations: [
      "Nao ha temporizador real integrado ao circuito do simulador.",
      "O grafico mostra apenas um atraso conceitual fixo.",
    ],
  }),
  component({
    id: "push-button-na-nf",
    name: "Botao pulsador NA/NF",
    shortName: "Pulsador",
    categoryId: "control-signaling",
    kind: "control",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Botao de comando momentaneo com contatos normalmente abertos e normalmente fechados.",
    functionDescription:
      "Gera um pulso de comando para ligar, parar, resetar ou intertravar funcoes no painel.",
    operatingPrinciple:
      "Ao pressionar, o mecanismo comuta momentaneamente os contatos e retorna por mola ao soltar.",
    typicalApplications: [
      "Comandos liga/desliga e reset.",
      "Confirmacao de etapas em bancadas didaticas.",
    ],
    mainData: [
      data("Tipo de contato", "NA/NF", ""),
      data("Modo de operacao", "Momentaneo", ""),
      data("Sinal tipico", "Digital", ""),
    ],
    visualStates: [
      state("Solto", "Contatos permanecem no estado de repouso."),
      state("Pressionado", "Contato muda apenas durante o acionamento."),
      state("Retornado", "A mola leva o conjunto ao repouso."),
    ],
    chartTitle: "Pulso de comando",
    chartDescription:
      "Representacao didatica do pulso logico gerado por um pressionamento curto.",
    chartData: pulseChart(),
    tags: ["botoeira", "liga", "reset"],
    limitations: [
      "Nao existe botoeira externa acoplada ao circuito principal nesta etapa.",
      "O item serve como referencia de funcionamento e nomenclatura NA/NF.",
    ],
  }),
  component({
    id: "emergency-stop-button",
    name: "Botao de emergencia",
    shortName: "E-stop",
    categoryId: "control-signaling",
    kind: "control",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Comando de seguranca para interromper rapidamente a acao de uma maquina ou painel.",
    functionDescription:
      "Abre o circuito de seguranca para remover a permissao de operacao em situacoes anormais.",
    operatingPrinciple:
      "Um mecanismo mecanico trava o botao acionado ate o rearme manual, mantendo o circuito aberto.",
    typicalApplications: [
      "Paineis industriais e bancadas de treinamento.",
      "Linhas com risco mecanico ou necessidade de parada segura.",
    ],
    mainData: [
      data("Contato principal", "NF de seguranca", ""),
      data("Acionamento", "Travante por pressao", ""),
      data("Rearme", "Manual por giro ou puxada", ""),
    ],
    visualStates: [
      state("Armado", "Botao em condicao normal e circuito de seguranca fechado."),
      state("Acionado", "Contato NF abre e bloqueia a operacao."),
      state("Rearmado", "Permissao somente apos destravamento manual."),
    ],
    chartTitle: "Permissao de seguranca",
    chartDescription:
      "Sinal logico que cai para zero quando o botao de emergencia e acionado.",
    chartData: [
      point("0 ms", 1),
      point("100 ms", 1),
      point("200 ms", 0),
      point("300 ms", 0),
    ],
    tags: ["seguranca", "NF", "travante"],
    limitations: [
      "Nao ha circuito de seguranca dedicado nem categoria de seguranca calculada.",
      "A visualizacao nao substitui pratica real de seguranca de maquinas.",
    ],
  }),
  component({
    id: "selector-switch",
    name: "Chave seletora",
    shortName: "Seletora",
    categoryId: "control-signaling",
    kind: "control",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Chave para selecionar modos de operacao ou direcoes de comando.",
    functionDescription:
      "Mantem um estado escolhido pelo operador, como local/remoto, manual/automatico ou sentido.",
    operatingPrinciple:
      "Um eixo mecanico mantem os contatos posicionados no ponto selecionado ate nova comutacao.",
    typicalApplications: [
      "Selecao local/remoto.",
      "Chaves manual/automatico e frente/reverso.",
    ],
    mainData: [
      data("Operacao", "Mantida", ""),
      data("Posicoes comuns", "2 ou 3", ""),
      data("Tipo de sinal", "Digital discreto", ""),
    ],
    visualStates: [
      state("Posicao 0", "Estado inicial ou neutro da chave."),
      state("Posicao 1", "Primeira selecao ativa."),
      state("Posicao 2", "Segunda selecao ativa, quando aplicavel."),
    ],
    chartTitle: "Mudanca de posicao",
    chartDescription:
      "Representacao conceitual de estados discretos mantidos em uma chave seletora.",
    chartData: [
      point("0 s", 0),
      point("2 s", 1),
      point("4 s", 1),
      point("6 s", 2),
    ],
    tags: ["modo", "selecao", "manual"],
    limitations: [
      "Nao existe chave seletora conectada ao fluxo do app nesta fase.",
      "A curva mostra apenas a ideia de estados discretos mantidos.",
    ],
  }),
  component({
    id: "pilot-light",
    name: "Sinaleiro",
    shortName: "Sinaleiro",
    categoryId: "control-signaling",
    kind: "control",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Indicador luminoso para estados de operacao, alarme ou disponibilidade.",
    functionDescription:
      "Converte um estado eletrico em indicacao visual para o operador no painel.",
    operatingPrinciple:
      "Quando alimentado, o elemento luminoso emite luz continua ou piscante conforme o circuito de comando.",
    typicalApplications: [
      "Sinalizar ligado, parado, falha ou alarme.",
      "Confirmar permissao ou etapa de processo.",
    ],
    mainData: [
      data("Tecnologia comum", "LED", ""),
      data("Cores usuais", "Vermelho, verde, amarelo", ""),
      data("Tipo de sinal", "Digital", ""),
    ],
    visualStates: [
      state("Apagado", "Sem alimentacao ou comando desligado."),
      state("Aceso", "Indicacao visual ligada de forma continua."),
      state("Piscando", "Indicacao intermitente para chamar atencao."),
    ],
    chartTitle: "Sinal luminoso",
    chartDescription:
      "Pulso logico simples ilustrando um sinaleiro em estado aceso.",
    chartData: binaryChart(),
    tags: ["indicacao", "LED", "painel"],
    limitations: [
      "Nao ha sinaleiros reais inseridos no layout da aplicacao.",
      "A visualizacao nao controla cores dinamicamente por evento do simulador.",
    ],
  }),
  component({
    id: "buzzer",
    name: "Buzzer",
    shortName: "Buzzer",
    categoryId: "control-signaling",
    kind: "control",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Sinalizador sonoro para alarmes e eventos que exigem atencao.",
    functionDescription:
      "Emite um aviso sonoro quando um circuito de alarme, falha ou permissao e ativado.",
    operatingPrinciple:
      "Um elemento piezoeletrico ou eletromagnetico vibra quando energizado e produz som audivel.",
    typicalApplications: [
      "Alarmes de painel.",
      "Aviso de anomalia ou fim de ciclo.",
    ],
    mainData: [
      data("Sinal de comando", "Digital", ""),
      data("Saida", "Aviso sonoro", ""),
      data("Tecnologia comum", "Piezoeletrico", ""),
    ],
    visualStates: [
      state("Silencioso", "Sem alimentacao ou sem alarme."),
      state("Ativo", "Som emitido de forma continua."),
      state("Intermitente", "Aviso alternado para chamar atencao."),
    ],
    chartTitle: "Sinal de acionamento do buzzer",
    chartDescription:
      "Exemplo conceitual de pulsos logicos usados para buzzer intermitente.",
    chartData: pulseChart(),
    tags: ["alarme", "som", "indicacao"],
    limitations: [
      "Nao ha audio real na biblioteca.",
      "A representacao fica restrita a dados e estados visuais didaticos.",
    ],
  }),
  component({
    id: "inductive-sensor",
    name: "Sensor indutivo",
    shortName: "Indutivo",
    categoryId: "sensors",
    kind: "sensor",
    description: "Sensor sem contato para detectar metais em curta distancia.",
    functionDescription:
      "Informa ao comando a presenca de um alvo metalico por meio de uma saida digital.",
    operatingPrinciple:
      "Um oscilador interno cria um campo eletromagnetico; a aproximacao do metal altera esse campo e comuta a saida.",
    typicalApplications: [
      "Deteccao de pecas metalicas em esteiras.",
      "Contagem e posicionamento em automacao.",
    ],
    mainData: [
      data("Alvo tipico", "Metal", ""),
      data("Saida comum", "PNP ou NPN", ""),
      data("Alimentacao tipica", "10 a 30", "Vcc"),
    ],
    visualStates: [
      state("Sem deteccao", "Nenhum alvo metalico dentro da distancia sensivel."),
      state("Deteccao ativa", "Aproximacao do alvo comutou a saida."),
      state("Retorno", "Saida volta ao repouso quando o alvo se afasta."),
    ],
    chartTitle: "Saida do sensor indutivo",
    chartDescription:
      "Sinal logico simples indicando aproximacao e afastamento de um alvo metalico.",
    chartData: pulseChart(),
    tags: ["sensor", "metal", "PNP"],
    limitations: [
      "Ainda nao existe alvo virtual interativo para esse sensor.",
      "A biblioteca mostra apenas o principio de deteccao e a resposta esperada.",
    ],
  }),
  component({
    id: "capacitive-sensor",
    name: "Sensor capacitivo",
    shortName: "Capacitivo",
    categoryId: "sensors",
    kind: "sensor",
    description: "Sensor sem contato para materiais solidos ou liquidos com base em variacao de capacitancia.",
    functionDescription:
      "Detecta materiais diversos e entrega uma saida digital para o circuito de comando.",
    operatingPrinciple:
      "A aproximacao do material altera a capacitancia do campo eletrico do sensor e muda o estado da saida.",
    typicalApplications: [
      "Deteccao de nivel em reservatorios.",
      "Presenca de materiais nao metalicos.",
    ],
    mainData: [
      data("Alvo tipico", "Solidos e liquidos", ""),
      data("Ajuste comum", "Sensibilidade frontal", ""),
      data("Saida", "Digital PNP/NPN", ""),
    ],
    visualStates: [
      state("Sem material", "Campo eletrico sem alteracao relevante."),
      state("Deteccao", "Capacitancia alterada pela presenca do alvo."),
      state("Ajuste fino", "Sensibilidade definida para o material observado."),
    ],
    chartTitle: "Variacao de sinal por aproximacao",
    chartDescription:
      "Curva conceitual de aumento de resposta conforme o material se aproxima do sensor.",
    chartData: analogChart(),
    tags: ["sensor", "nivel", "material"],
    limitations: [
      "Nao ha simulacao de ajuste fino por tipo de material.",
      "Os dados servem como apoio didatico e nao como calibracao real.",
    ],
  }),
  component({
    id: "photoelectric-sensor",
    name: "Sensor fotoeletrico",
    shortName: "Fotoeletrico",
    categoryId: "sensors",
    kind: "sensor",
    description: "Sensor optico para detectar objetos por feixe de luz emitido e recebido.",
    functionDescription:
      "Converte a interrupcao ou reflexao de luz em um sinal digital para o controle.",
    operatingPrinciple:
      "Um emissor envia luz e um receptor monitora sua presenca ou reflexao, comutando a saida quando o padrao muda.",
    typicalApplications: [
      "Contagem de pecas e embalagens.",
      "Barreiras opticas em automacao leve.",
    ],
    mainData: [
      data("Metodo comum", "Barreira, reflexao ou difuso", ""),
      data("Saida", "Digital", ""),
      data("Variavel observada", "Interrupcao de feixe", ""),
    ],
    visualStates: [
      state("Feixe livre", "Receptor recebe o sinal esperado."),
      state("Objeto detectado", "Feixe interrompido ou refletido conforme o tipo."),
      state("Retorno normal", "Feixe restabelecido e saida retorna."),
    ],
    chartTitle: "Sinal optico detectado",
    chartDescription:
      "Representacao binaria da mudanca de estado quando um objeto cruza o feixe.",
    chartData: pulseChart(),
    tags: ["sensor", "optico", "barreira"],
    limitations: [
      "Nao existe cenario grafico com feixe, refletor ou alvo fisico.",
      "O item explica o conceito, mas nao possui simulacao optica real.",
    ],
  }),
  component({
    id: "limit-switch",
    name: "Fim de curso",
    shortName: "Fim de curso",
    categoryId: "sensors",
    kind: "sensor",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Sensor mecanico acionado por contato fisico no final de um deslocamento.",
    functionDescription:
      "Informa o limite de movimento ou a presenca de uma posicao mecanica no sistema.",
    operatingPrinciple:
      "Uma alavanca ou pino mecanico desloca contatos internos quando tocado por um elemento movel.",
    typicalApplications: [
      "Posicionamento de atuadores.",
      "Fim de curso de portas, eixos e esteiras.",
    ],
    mainData: [
      data("Tipo de atuacao", "Mecanica", ""),
      data("Contatos", "NA/NF", ""),
      data("Sinal", "Digital", ""),
    ],
    visualStates: [
      state("Livre", "Nenhum atuador pressionando o mecanismo."),
      state("Pressionado", "O deslocamento mecanico alterou os contatos."),
      state("Retorno", "O mecanismo volta ao estado inicial apos liberar o atuador."),
    ],
    chartTitle: "Contato de limite mecanico",
    chartDescription:
      "Pulso simples representando o instante em que o limite mecanico foi atingido.",
    chartData: pulseChart(),
    tags: ["mecanico", "limite", "NA/NF"],
    limitations: [
      "Nao ha mecanismo fisico no app para acionar o fim de curso.",
      "A visualizacao tem carater apenas documental e didatico.",
    ],
  }),
  component({
    id: "encoder",
    name: "Encoder",
    shortName: "Encoder",
    categoryId: "sensors",
    kind: "sensor",
    description: "Sensor de realimentacao para velocidade, posicao ou sentido de rotacao.",
    functionDescription:
      "Entrega pulsos proporcionais ao movimento de um eixo para malhas de monitoramento ou controle.",
    operatingPrinciple:
      "Um disco ou elemento magnetico gera pulsos lidos eletronicamente conforme a rotacao do eixo.",
    typicalApplications: [
      "Realimentacao de velocidade.",
      "Contagem de pulsos e posicionamento.",
    ],
    mainData: [
      data("Saida tipica", "Pulsos A/B/Z", ""),
      data("Grandeza observada", "Rotacao e posicao", ""),
      data("Uso didatico", "Feedback de movimento", ""),
    ],
    visualStates: [
      state("Parado", "Sem pulsos, eixo sem movimento."),
      state("Girando", "Sequencia de pulsos proporcional a velocidade."),
      state("Referencia", "Pulso de indice em uma volta especifica."),
    ],
    chartTitle: "Pulsos do encoder",
    chartDescription:
      "Representacao conceitual da geracao de pulsos conforme o movimento do eixo.",
    chartData: [
      point("0 ms", 0),
      point("20 ms", 1),
      point("40 ms", 0),
      point("60 ms", 1),
    ],
    tags: ["feedback", "pulsos", "velocidade"],
    limitations: [
      "Nao ha realimentacao de encoder conectada ao simulador do CFW100.",
      "A curva nao traduz resolucao real nem quadratura completa.",
    ],
  }),
  component({
    id: "temperature-sensor",
    name: "Sensor de temperatura",
    shortName: "Temp sensor",
    categoryId: "sensors",
    kind: "sensor",
    description: "Sensor para monitorar aquecimento de motores, modulo ou processo.",
    functionDescription:
      "Converte temperatura em um sinal analogico ou digital para protecao, alarme ou controle.",
    operatingPrinciple:
      "A resistencia, tensao ou estado do elemento sensor muda com a temperatura e e interpretado pelo circuito.",
    typicalApplications: [
      "Protecao termica de motores e inversores.",
      "Supervisao de processos e ambientes.",
    ],
    mainData: [
      data("Sinais comuns", "PT100, NTC, 4-20 mA", ""),
      data("Grandeza medida", "Temperatura", "C"),
      data("Uso", "Alarme e monitoramento", ""),
    ],
    visualStates: [
      state("Temperatura nominal", "Leitura dentro da faixa segura."),
      state("Aquecendo", "Valor sobe com a carga ou ambiente."),
      state("Alarme", "Valor ultrapassa o limite configurado."),
    ],
    chartTitle: "Temperatura ao longo do tempo",
    chartDescription:
      "Curva didatica de subida termica usada para entendimento de alarmes de temperatura.",
    chartData: thermalChart(),
    tags: ["temperatura", "alarme", "analogico"],
    limitations: [
      "Nao ha sensor de temperatura externo integrado ao estado global.",
      "A leitura do app principal continua ligada ao modulo do CFW100.",
    ],
  }),
  component({
    id: "plc",
    name: "CLP",
    shortName: "CLP",
    categoryId: "automation",
    kind: "automation",
    description: "Controlador logico programavel para logica sequencial e intertravamentos.",
    functionDescription:
      "Executa regras de automacao para ler entradas, processar logica e comandar saidas.",
    operatingPrinciple:
      "Varre entradas, executa programa ciclico e atualiza saidas em um tempo de scan repetitivo.",
    typicalApplications: [
      "Automacao de maquinas e paines.",
      "Sequencias intertravadas com sensores e atuadores.",
    ],
    mainData: [
      data("Ciclo basico", "Leitura, logica e escrita", ""),
      data("Sinais", "Entradas e saidas digitais/analogicas", ""),
      data("Tempo didatico", "Scan ciclico", "ms"),
    ],
    visualStates: [
      state("RUN", "Programa em execucao e saidas podendo atualizar."),
      state("STOP", "Programa parado para manutencao ou ajuste."),
      state("Falha", "Erro interno ou diagnostico critico."),
    ],
    chartTitle: "Ciclo de scan",
    chartDescription:
      "Curva conceitual do ciclo repetitivo de leitura, processamento e atualizacao.",
    chartData: [
      point("Entrada", 20),
      point("Logica", 60),
      point("Saida", 85),
      point("Fim do scan", 100),
    ],
    tags: ["automacao", "scan", "logica"],
    limitations: [
      "Ainda nao ha runtime de CLP ou programacao interativa.",
      "O item serve para estudo conceitual da arquitetura de automacao.",
    ],
  }),
  component({
    id: "hmi",
    name: "IHM",
    shortName: "IHM",
    categoryId: "automation",
    kind: "automation",
    description: "Interface homem-maquina para operacao, ajuste e diagnostico.",
    functionDescription:
      "Apresenta estados, alarmes, setpoints e comandos em uma tela dedicada ao operador.",
    operatingPrinciple:
      "Recebe dados do controlador, organiza telas e envia comandos de navegacao ou ajuste.",
    typicalApplications: [
      "Paines de supervisao local.",
      "Ajuste de parametros e exibicao de alarmes.",
    ],
    mainData: [
      data("Interacao", "Toque, botoes ou navegação", ""),
      data("Dados exibidos", "Estados, alarmes, setpoints", ""),
      data("Papel no projeto atual", "Conceitual alem da HMI do CFW100", ""),
    ],
    visualStates: [
      state("Tela principal", "Resumo do processo ou equipamento."),
      state("Tela de ajustes", "Operador altera parametros e setpoints."),
      state("Tela de alarmes", "Lista falhas e orienta diagnostico."),
    ],
    chartTitle: "Atualizacao de tela",
    chartDescription:
      "Representacao simples do fluxo de atualizacao de dados entre controlador e IHM.",
    chartData: [
      point("Leitura", 20),
      point("Atualizacao", 45),
      point("Comando", 70),
      point("Confirmacao", 90),
    ],
    tags: ["interface", "operador", "diagnostico"],
    limitations: [
      "A unica interface interativa real do projeto continua sendo a HMI frontal do CFW100.",
      "Nao existe tela de IHM externa ou navegacao por paginas nesta etapa.",
    ],
  }),
  component({
    id: "digital-input-module",
    name: "Modulo de entrada digital",
    shortName: "Entrada digital",
    categoryId: "automation",
    kind: "automation",
    description: "Modulo para ler sinais discretos de botoes, sensores e contatos.",
    functionDescription:
      "Converte estados de campo em bits disponiveis para o controlador logico.",
    operatingPrinciple:
      "Monitora tensao ou continuidade em canais independentes e atualiza o estado logico associado.",
    typicalApplications: [
      "Leitura de sensores de campo.",
      "Interface entre botoeiras e CLP.",
    ],
    mainData: [
      data("Tipo de sinal", "Digital discreto", ""),
      data("Canais comuns", "8, 16 ou 32", ""),
      data("Tensao tipica", "24", "Vcc"),
    ],
    visualStates: [
      state("Canal em 0", "Nenhum sinal presente ou contato aberto."),
      state("Canal em 1", "Sinal presente no canal."),
      state("Falha de leitura", "Valor inconsistente ou sem referencia."),
    ],
    chartTitle: "Estado logico de entrada",
    chartDescription:
      "Mudanca de um canal digital ao longo do tempo de amostragem.",
    chartData: binaryChart(),
    tags: ["I/O", "digital", "24V"],
    limitations: [
      "Nao ha CLP nem barramento modular ativo para consumir esses canais.",
      "A representacao e apenas didatica e nao reflete protocolo real.",
    ],
  }),
  component({
    id: "digital-output-module",
    name: "Modulo de saida digital",
    shortName: "Saida digital",
    categoryId: "automation",
    kind: "automation",
    description: "Modulo para acionar sinais discretos a partir de um controlador.",
    functionDescription:
      "Entrega niveis logicos ou comutacoes para rele, contator, sinaleiro e outros atuadores.",
    operatingPrinciple:
      "Um comando interno seta o canal de saida, habilitando transistor, rele ou triac conforme o modulo.",
    typicalApplications: [
      "Acionamento de sinalizadores e interfaces.",
      "Comando de reles auxiliares ou contatores.",
    ],
    mainData: [
      data("Tipo de canal", "Transistor ou rele", ""),
      data("Sinal", "Digital", ""),
      data("Uso tipico", "Acionamento de atuadores", ""),
    ],
    visualStates: [
      state("Desligado", "Canal sem energizacao na saida."),
      state("Ligado", "Canal entrega sinal ou tensao ao atuador."),
      state("Protegido", "Saida inibida por falha ou intertravamento."),
    ],
    chartTitle: "Comando de saida discreta",
    chartDescription:
      "Sinal logico do canal de saida quando o controlador habilita um atuador.",
    chartData: binaryChart(),
    tags: ["I/O", "saida", "atuador"],
    limitations: [
      "Nao existe modulo de saida controlando componentes reais na biblioteca.",
      "Os estados mostrados nao estao ligados a um controlador de fato.",
    ],
  }),
  component({
    id: "analog-module",
    name: "Modulo analogico",
    shortName: "Modulo analogico",
    categoryId: "automation",
    kind: "automation",
    description: "Modulo para ler ou enviar sinais continuos em malhas analogicas.",
    functionDescription:
      "Interfaz sensores ou atuadores analogicos com o controlador, convertendo grandezas continuas.",
    operatingPrinciple:
      "Converte tensao ou corrente analogica em valor numerico, ou o inverso, para a logica de automacao.",
    typicalApplications: [
      "Leitura de pressao, temperatura ou nivel.",
      "Comando de referencia analogica para drives.",
    ],
    mainData: [
      data("Faixas usuais", "0-10 V / 4-20 mA", ""),
      data("Tipo de grandeza", "Analogica", ""),
      data("Uso", "Medicao e comando", ""),
    ],
    visualStates: [
      state("Zero de escala", "Sem referencia ou valor minimo."),
      state("Faixa intermediaria", "Leitura ou comando proporcional."),
      state("Fundo de escala", "Valor maximo da faixa configurada."),
    ],
    chartTitle: "Sinal analogico",
    chartDescription:
      "Curva simples de variacao analogica ao longo da faixa de operacao.",
    chartData: analogChart(),
    tags: ["analogico", "4-20 mA", "0-10 V"],
    limitations: [
      "Nao ha conversao analogica real conectada a um CLP ou drive externo.",
      "O grafico mostra apenas a ideia de proporcionalidade da faixa.",
    ],
  }),
  component({
    id: "power-supply-24vdc",
    name: "Fonte 24Vcc",
    shortName: "Fonte 24Vcc",
    categoryId: "power-interface",
    kind: "power",
    description: "Fonte auxiliar para alimentar comandos, sensores e modulos de automacao.",
    functionDescription:
      "Converte a entrada de rede em uma tensao continua regulada para circuitos de controle.",
    operatingPrinciple:
      "Retifica e regula a tensao de entrada para manter uma saida CC estavel dentro da faixa do painel.",
    typicalApplications: [
      "Alimentacao de sensores, CLPs e reles.",
      "Circuitos de comando em 24 Vcc.",
    ],
    mainData: [
      data("Saida tipica", "24", "Vcc"),
      data("Uso", "Comando e instrumentacao", ""),
      data("Comportamento esperado", "Tensao estabilizada", ""),
    ],
    visualStates: [
      state("Sem rede", "Fonte sem entrada e sem tensao de saida."),
      state("Regulada", "Saida estabilizada em operacao normal."),
      state("Sobrecarga", "Saida limitada ou protegida por excesso de consumo."),
    ],
    chartTitle: "Estabilidade da saida CC",
    chartDescription:
      "Variacao conceitual da tensao de saida de uma fonte regulada de 24 Vcc.",
    chartData: voltageChart(),
    tags: ["24V", "controle", "fonte"],
    limitations: [
      "Ainda nao existe barramento de 24 Vcc compartilhado entre componentes.",
      "A visualizacao nao calcula ripple, eficiencia ou dissipacao.",
    ],
  }),
  component({
    id: "transformer",
    name: "Transformador",
    shortName: "Transformador",
    categoryId: "power-interface",
    kind: "power",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Elemento eletromagnetico para elevar, reduzir ou isolar tensoes em CA.",
    functionDescription:
      "Adequa niveis de tensao e fornece isolamento galvanico entre circuitos.",
    operatingPrinciple:
      "Um fluxo magnetico alternado no nucleo transfere energia entre enrolamentos por inducao eletromagnetica.",
    typicalApplications: [
      "Fontes de comando e isolamento de circuito.",
      "Adaptacao de tensao entre rede e carga.",
    ],
    mainData: [
      data("Entrada comum", "127/220", "Vca"),
      data("Saida comum", "24 ou 110", "Vca"),
      data("Principio", "Inducao magnetica", ""),
    ],
    visualStates: [
      state("Sem excitacao", "Primario sem tensao aplicada."),
      state("Magnetizado", "Nucleo com fluxo alternado em operacao."),
      state("Entregando tensao", "Secundario fornecendo tensao para a carga."),
    ],
    chartTitle: "Tensao primaria e secundaria",
    chartDescription:
      "Comparacao conceitual de tensao alternada transferida entre enrolamentos.",
    chartData: [
      point("0 ms", 0),
      point("5 ms", 100),
      point("10 ms", 0),
      point("15 ms", 50),
    ],
    tags: ["isolacao", "CA", "enrolamento"],
    limitations: [
      "Nao ha forma de onda CA real nem relacao de espiras calculada.",
      "Os dados servem apenas como apoio de entendimento do principio.",
    ],
  }),
  component({
    id: "signal-converter",
    name: "Conversor de sinal",
    shortName: "Conversor",
    categoryId: "power-interface",
    kind: "power",
    description: "Interface para converter um tipo de sinal eletrico em outro.",
    functionDescription:
      "Adequa sinais de campo para entradas de CLP, drives ou instrumentos de supervisao.",
    operatingPrinciple:
      "Um circuito de condicionamento ajusta amplitude, tipo ou padrao do sinal para a faixa requerida.",
    typicalApplications: [
      "Converter 4-20 mA em 0-10 V.",
      "Adaptar sensores a entradas de controladores.",
    ],
    mainData: [
      data("Conversoes comuns", "4-20 mA <-> 0-10 V", ""),
      data("Finalidade", "Compatibilizacao de sinais", ""),
      data("Faixa", "Analogica", ""),
    ],
    visualStates: [
      state("Entrada bruta", "Sinal recebido do campo."),
      state("Condicionando", "Circuito ajustando ganho ou offset."),
      state("Saida tratada", "Sinal pronto para o equipamento de destino."),
    ],
    chartTitle: "Conversao analogica",
    chartDescription:
      "Exemplo didatico de relacao proporcional entre um sinal de entrada e sua saida convertida.",
    chartData: analogChart(),
    tags: ["analogico", "interface", "condicionamento"],
    limitations: [
      "Nao ha ajuste interativo de escala, ganho ou offset.",
      "A biblioteca nao conecta o conversor a uma malha real do app.",
    ],
  }),
  component({
    id: "relay-interface",
    name: "Interface rele",
    shortName: "Interface rele",
    categoryId: "power-interface",
    kind: "power",
    description: "Modulo de interface para isolar e adaptar sinais entre logica e carga.",
    functionDescription:
      "Recebe um comando de baixo nivel e o replica em um rele de saida com isolamento.",
    operatingPrinciple:
      "Uma entrada aciona a bobina ou o transistor do modulo, que por sua vez comuta um rele interno.",
    typicalApplications: [
      "Isolar saídas de CLP.",
      "Comandar cargas pequenas ou circuitos auxiliares.",
    ],
    mainData: [
      data("Entrada comum", "24", "Vcc"),
      data("Saida", "Contato de rele", ""),
      data("Beneficio", "Isolacao e adaptacao", ""),
    ],
    visualStates: [
      state("Entrada em 0", "Modulo sem comando de acionamento."),
      state("Rele energizado", "Entrada ativa comutando o contato interno."),
      state("Saida comutada", "Carga ou circuito auxiliar recebe o novo estado."),
    ],
    chartTitle: "Entrada para comutacao",
    chartDescription:
      "Sinal logico didatico mostrando a relacao entre o comando e a saida de rele.",
    chartData: binaryChart(),
    tags: ["isolacao", "rele", "interface"],
    limitations: [
      "Nao ha conexao real com CLP nem com cargas externas.",
      "A representacao nao inclui desgaste de contato ou atraso mecanico detalhado.",
    ],
  }),
  component({
    id: "terminal-block",
    name: "Borne",
    shortName: "Borne",
    categoryId: "connection-mounting",
    kind: "connection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Ponto de conexao para distribuir e organizar condutores no painel.",
    functionDescription:
      "Recebe, fixa e identifica fios, facilitando manutencao e interligacao ordenada.",
    operatingPrinciple:
      "Um corpo isolante e um elemento metalico comprimem o condutor para garantir contato eletrico seguro.",
    typicalApplications: [
      "Distribuicao de sinais e alimentacao.",
      "Pontos de passagem entre campo e painel.",
    ],
    mainData: [
      data("Funcao", "Conexao e identificacao", ""),
      data("Montagem", "Trilho DIN", ""),
      data("Condutor tipico", "Rigido ou flexivel", ""),
    ],
    visualStates: [
      state("Livre", "Borne sem condutor instalado."),
      state("Conectado", "Condutor fixado corretamente."),
      state("Manutencao", "Borne acessado para teste ou reposicao."),
    ],
    chartTitle: "Continuidade de conexao",
    chartDescription:
      "Sinal simples ilustrando a presenca ou ausencia de continuidade eletrica no borne.",
    chartData: binaryChart(),
    tags: ["conexao", "painel", "distribuicao"],
    limitations: [
      "Nao ha interligacao fisica entre itens da biblioteca.",
      "A visualizacao nao substitui um esquema eletrico real de borneamento.",
    ],
  }),
  component({
    id: "din-rail",
    name: "Trilho DIN",
    shortName: "Trilho DIN",
    categoryId: "connection-mounting",
    kind: "connection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Perfil metalico padrao para fixacao de componentes modulares em paineis.",
    functionDescription:
      "Serve como base mecanica para organizar fontes, bornes, reles e modulos.",
    operatingPrinciple:
      "Componentes com encaixe apropriado sao travados mecanicamente no perfil do trilho.",
    typicalApplications: [
      "Montagem de paines de comando.",
      "Organizacao modular de componentes industriais.",
    ],
    mainData: [
      data("Funcao", "Fixacao mecanica", ""),
      data("Padrao comum", "35 mm", ""),
      data("Uso", "Montagem modular", ""),
    ],
    visualStates: [
      state("Vazio", "Trilho sem componentes acoplados."),
      state("Montado", "Componentes presos mecanicamente ao perfil."),
      state("Expansao", "Espaco reservado para novos modulos."),
    ],
    chartTitle: "Ocupacao do trilho",
    chartDescription:
      "Curva conceitual de ocupacao modular ao longo da montagem do painel.",
    chartData: [
      point("0 mod", 0),
      point("2 mod", 25),
      point("4 mod", 50),
      point("8 mod", 100),
    ],
    tags: ["mecanica", "montagem", "modular"],
    limitations: [
      "Nao existe montagem grafica de painel na biblioteca atual.",
      "O grafico representa apenas o conceito de ocupacao modular.",
    ],
  }),
  component({
    id: "wiring-duct",
    name: "Canaleta",
    shortName: "Canaleta",
    categoryId: "connection-mounting",
    kind: "connection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Elemento de organizacao para conduzir fios dentro do painel.",
    functionDescription:
      "Agrupa e separa cabos para manter o painel limpo, seguro e rastreavel.",
    operatingPrinciple:
      "Os condutores sao acomodados em um canal com abertura lateral para distribuicao ordenada.",
    typicalApplications: [
      "Organizacao de cabos de comando e potencia.",
      "Separacao de circuitos no interior do painel.",
    ],
    mainData: [
      data("Funcao", "Organizacao de cabos", ""),
      data("Instalacao", "Painel interno", ""),
      data("Beneficio", "Manutencao e limpeza visual", ""),
    ],
    visualStates: [
      state("Vazia", "Canaleta sem condutores."),
      state("Preenchida", "Cabos acomodados e roteados internamente."),
      state("Inspecao", "Tampa aberta para manutencao ou expansao."),
    ],
    chartTitle: "Ocupacao da canaleta",
    chartDescription:
      "Representacao conceitual do preenchimento da canaleta conforme novos cabos sao adicionados.",
    chartData: [
      point("0 cabos", 0),
      point("5 cabos", 30),
      point("10 cabos", 65),
      point("15 cabos", 100),
    ],
    tags: ["organizacao", "cabos", "painel"],
    limitations: [
      "Nao ha roteamento fisico de cabos na biblioteca.",
      "Os dados tem objetivo apenas visual e organizacional.",
    ],
  }),
  component({
    id: "control-cable",
    name: "Cabo de comando",
    shortName: "Cabo de comando",
    categoryId: "connection-mounting",
    kind: "connection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Condutor usado para sinais de comando, sensores e intertravamentos.",
    functionDescription:
      "Transporta sinais de baixa potencia entre botoeiras, sensores, reles e controladores.",
    operatingPrinciple:
      "O cabo oferece um caminho eletrico com isolacao adequada para sinais discretos ou analogicos.",
    typicalApplications: [
      "Interligacao de botoeiras, sensores e CLPs.",
      "Circuitos auxiliares em paines eletricos.",
    ],
    mainData: [
      data("Tipo de uso", "Sinais de comando", ""),
      data("Condutor", "Cobre flexivel", ""),
      data("Caracteristica importante", "Identificacao e organizacao", ""),
    ],
    visualStates: [
      state("Nao instalado", "Sem interligacao entre os pontos do circuito."),
      state("Conectado", "Sinal pode trafegar entre origem e destino."),
      state("Identificado", "Condutor marcado para manutencao e diagnostico."),
    ],
    chartTitle: "Presenca de sinal no cabo",
    chartDescription:
      "Exemplo binario do transporte de um sinal de comando entre dois pontos.",
    chartData: binaryChart(),
    tags: ["cabos", "sinal", "ligacao"],
    limitations: [
      "A biblioteca nao desenha caminhos fisicos ou numeracao real de fios.",
      "A representacao nao aborda comprimento, queda de tensao ou compatibilidade EMC.",
    ],
  }),
  component({
    id: "ferrule-terminal",
    name: "Terminal ilhos",
    shortName: "Terminal ilhos",
    categoryId: "connection-mounting",
    kind: "connection",
    status: "documentationOnly",
    simulationMode: "documentationOnly",
    description: "Acessorio para acabamento e conexao segura de condutores flexiveis.",
    functionDescription:
      "Melhora o contato mecanico e eletrico do fio em bornes e dispositivos de aperto.",
    operatingPrinciple:
      "Um tubo metalico prensado no fio concentra os filamentos e facilita o aperto consistente.",
    typicalApplications: [
      "Terminais de bornes e contatores.",
      "Acabamento de chicotes de comando.",
    ],
    mainData: [
      data("Uso principal", "Acabamento de cabo flexivel", ""),
      data("Processo", "Crimpagem", ""),
      data("Beneficio", "Contato mais estavel", ""),
    ],
    visualStates: [
      state("Sem terminal", "Filamentos expostos e conexao menos uniforme."),
      state("Crimpado", "Terminal prensado corretamente no condutor."),
      state("Instalado", "Conjunto pronto para fixacao em borne ou dispositivo."),
    ],
    chartTitle: "Qualidade de contato",
    chartDescription:
      "Comparacao conceitual da estabilidade de contato apos a aplicacao do terminal.",
    chartData: [
      point("Fio solto", 35),
      point("Aperto inicial", 55),
      point("Terminal crimpado", 80),
      point("Contato estabilizado", 100),
    ],
    tags: ["crimpagem", "acabamento", "conexao"],
    limitations: [
      "Nao ha verificacao real de aperto ou crimpagem na biblioteca.",
      "O grafico e apenas uma metafora visual de qualidade de contato.",
    ],
  }),
];
