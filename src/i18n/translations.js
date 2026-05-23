import { DEFAULT_LANGUAGE } from "./languages.js";

export const TRANSLATIONS = {
  "pt-BR": {
    app: {
      title: "Simulador do Inversor CFW100",
    },
    header: {
      menuButton: "Menu",
      componentsButton: "Componentes",
      languageLabel: "Idioma",
      languageSelectorAriaLabel: "Selecionar idioma",
      activePreset: "Preset ativo: {name}",
      documentaryNotes: "{count} nota(s) documental(is)",
      scenarioMode: {
        student: "Aluno",
        technical: "Tecnico",
        readOnly: "Somente leitura",
        freeEdit: "Edicao livre",
        default: "Padrao",
      },
    },
    menu: {
      ariaLabel: "Menu de configuracao e cenarios",
      saveConfiguration: "Salvar configuracao",
      loadConfiguration: "Carregar configuracao",
      realScenarios: "Situacoes reais",
      submenuAriaLabel: "Submenu de situacoes reais",
      savedFeedback: "Configuracao salva",
      loadedFeedback: "Configuracao carregada ({count} parametros)",
      loadError: "Erro ao carregar arquivo",
      scenarioLoaded: "{name} carregada",
    },
    common: {
      close: "Fechar",
      notInformed: "Nao informado",
      yes: "Sim",
      no: "Nao",
      unavailable: "Indisponivel",
      unitCelsius: "graus Celsius",
      unitPercent: "por cento",
    },
    commandSource: {
      alwaysLocal: "Sempre Local",
      alwaysRemote: "Sempre Remoto",
      dix: "DIx",
      serialUsbLoc: "Serial/USB (LOC)",
      serialUsbRem: "Serial/USB (REM)",
      codnLoc: "CO/DN (LOC)",
      codnRem: "CO/DN (REM)",
      softplc: "SoftPLC",
      hmiKeys: "Teclas HMI",
      ai1: "AI1",
      fi: "FI",
      electronicPot: "Potenciometro eletronico",
      multispeed: "Multispeed",
      serialUsb: "Serial/USB",
      codn: "CO/DN",
      ai1Positive: "AI1 > 0",
      fiPositive: "FI > 0",
      noFunction: "Sem funcao",
      inactive: "Inativo",
      clockwise: "Horario",
      counterClockwise: "Anti-horario",
      serialCW: "Serial/USB (H)",
      serialCCW: "Serial/USB (AH)",
      codnCW: "CO/DN (H)",
      codnCCW: "CO/DN (AH)",
      reserved: "Reservado",
    },
    rampSelector: {
      ramp1: "1a rampa",
      ramp2: "2a rampa",
      emergency: "Emergencia",
      notSimulated: "Selecao de rampa \"{label}\" nao simulada: usando 1a rampa.",
    },
    commandStatusNotes: {
      pwmBlocked: "PWM bloqueado por {reason}.",
      referenceUnavailable: "Referencia \"{label}\" indisponivel: usando 0 Hz.",
    },
    faultCatalog: {
      F003: { shortLabel: "Sobrecorrente", description: "Corrente acima do limite da etapa de potencia." },
      F004: { shortLabel: "Sobretensao CC", description: "Tensao do barramento CC acima do limite seguro." },
      F005: { shortLabel: "Subtensao CC", description: "Falha F005 simulada manualmente. Diferente do estado SUB tratado separadamente pela HMI." },
      F006: { shortLabel: "Falta de fase", description: "Ausencia de uma ou mais fases de alimentacao ou saida." },
      F007: { shortLabel: "Sequencia de fases", description: "Sequencia de fases inconsistente ou invertida." },
      F010: { shortLabel: "Falha termica generica", description: "Falha termica manual generica para treinamento. Nao substitui a F051 automatica do modulo." },
      F012: { shortLabel: "Falha de comunicacao", description: "Erro de comunicacao serial ou perda de link." },
      F014: { shortLabel: "Falha de encoder", description: "Problema de feedback de velocidade/posicao." },
      F016: { shortLabel: "Falha de freio", description: "Falha no circuito ou comando de freio." },
      F017: { shortLabel: "Falha de rampa", description: "Erro didatico associado a geracao de rampa/comando." },
      F020: { shortLabel: "Falha de firmware", description: "Erro interno de firmware ou memoria." },
      F051: { shortLabel: "Supertemperatura do modulo", description: "Temperatura do modulo de potencia acima do limite termico (P030 >= 85 C)." },
      F070: { shortLabel: "Falha generica simulada", description: "Codigo generico usado pelo simulador para testes de display, reset e regressao." },
      F072: { shortLabel: "Sobrecarga Ixt", description: "Protecao termica Ixt do motor atingiu 100% por sobrecarga prolongada." },
      F088: { shortLabel: "Falha de CLP externo", description: "Falha de comunicacao ou logica no CLP externo." },
      F098: { shortLabel: "Falha de porta", description: "Erro em porta ou interface de comunicacao." },
    },
    hmiA11y: {
      panelLabel: "Painel frontal do inversor CFW100",
      summary: "Display do inversor: {value}. {status}. {direction}. {event}.",
      liveSummary: "{status}. {direction}. {event}.",
      statusRun: "Estado RUN",
      statusReady: "Estado pronto",
      statusFault: "Estado de falha",
      statusSub: "Estado de subtensao",
      statusConfig: "Estado de configuracao invalida",
      directionForward: "Sentido horario",
      directionReverse: "Sentido anti-horario",
      noFault: "Sem falha ativa",
      activeFault: "Falha ativa {code}",
      activeAlarm: "Alarme ativo {code}",
      frequencyValue: "Frequencia atual {value} hertz",
      genericValue: "Valor {value}",
      valueWithUnit: "Valor {value} {unit}",
    },
    hmiControls: {
      openMenu: "Abrir menu de programacao",
      decreaseReference: "Diminuir referencia de frequencia",
      increaseReference: "Aumentar referencia de frequencia",
      run: "Ligar o inversor",
      stop: "Parar o inversor",
    },
    configurationFileErrors: {
      noFile: "Nenhum arquivo selecionado.",
      emptyFile: "O arquivo selecionado esta vazio.",
      fileTooLarge: "Arquivo muito grande para importacao. Limite de 1 MB.",
      invalidType: "Selecione um arquivo JSON de configuracao.",
      invalidJson: "O arquivo selecionado nao contem um JSON valido.",
      invalidConfiguration:
        "O arquivo nao e uma configuracao compativel do simulador.",
      unsupportedVersion:
        "A versao da configuracao nao e suportada por este simulador.",
      incompatibleModel:
        "A configuracao selecionada nao pertence ao modelo CFW100.",
      unreadable: "Nao foi possivel ler o arquivo selecionado.",
      unknown: "Nao foi possivel carregar o arquivo de configuracao.",
    },
    about: {
      title: "Sobre o simulador",
      description:
        "Visao geral institucional do simulador didatico do inversor WEG CFW100.",
      purposeTitle: "Finalidade",
      purposeItems: [
        "Explicar o funcionamento basico do inversor e de seus parametros.",
        "Apoiar aulas, estudos e demonstracoes controladas.",
      ],
      authorshipTitle: "Autoria",
      authorshipText:
        "Projeto didatico voltado ao estudo de acionamentos e automacao industrial.",
      technologiesTitle: "Tecnologias",
      technologiesItems: [
        "React para interface.",
        "Modelos locais de simulacao para HMI, motor e protecoes.",
      ],
      resourcesTitle: "Recursos",
      resourcesItems: [
        "Painel da HMI com navegacao por teclado.",
        "Biblioteca de componentes didaticos.",
        "Simulacao visual do motor e historico de eventos.",
      ],
      limitationsTitle: "Limitacoes",
      limitationsItems: [
        "Nao substitui o manual oficial da WEG.",
        "Nao deve ser usado para comissionamento real.",
        "Nem todos os componentes possuem simulacao interativa.",
      ],
      statusTitle: "Status",
      statusText: "Ferramenta didatica em evolucao controlada.",
      closeButton: "Fechar",
    },
    faultSimulator: {
      buttonLabel: "Falhas",
      dialogTitle: "Simulador de Falhas",
      closeAriaLabel: "Fechar simulador de falhas",
      manualUnavailable: "Falha automatica nao pode ser injetada manualmente.",
      validCode: "Codigo valido",
      triggeredFeedback: "Falha F{code} disparada: {label}",
      resetFeedback: "Falha resetada",
      activeFault: "Falha ativa: F{code}",
      resetButton: "Resetar falha",
      automaticNote:
        'Falhas marcadas como "Automatica + manual" tambem podem surgir sozinhas pelos modelos de sobrecarga Ixt e temperatura do modulo.',
      triggerType: {
        manual: "Manual",
        automatic: "Automatica",
        both: "Automatica + manual",
      },
    },
    componentLibrary: {
      triggerButton: "Componentes",
      loadingTitle: "Carregando biblioteca de componentes",
      loadingDescription:
        "Os detalhes da biblioteca estao sendo carregados sob demanda.",
      panelTitle: "Biblioteca de Componentes",
      intro:
        "Nem todos os itens possuem simulacao interativa. Verifique o status de cada componente.",
      cataloguedCount: "{count} itens catalogados",
      availableCount: "{count} disponivel agora",
      roadmapCount: "{count} em roadmap",
      closeAriaLabel: "Fechar biblioteca de componentes",
      studyTitle: "Biblioteca de estudo",
      studyDescription:
        "Selecione um componente para visualizar funcionamento, dados, estados e um grafico didatico simples.",
      overviewTitle: "Visao geral",
      commandFunctionTitle: "Funcao no comando",
      operatingPrincipleTitle: "Principio de funcionamento",
      applicationsTitle: "Aplicacoes tipicas",
      mainDataTitle: "Dados tecnicos principais",
      statesTitle: "Estados didaticos",
      chartTitle: "Grafico didatico",
      limitationsTitle: "Limitacoes atuais",
      dataHeader: "Dado",
      valueHeader: "Valor",
      unitHeader: "Unidade",
      chartNoPoints: "Sem pontos de grafico cadastrados.",
      chartSummary:
        "Inicio em {startLabel} com valor {startValue}. Final em {endLabel} com valor {endValue}.",
      status: {
        available: "Disponivel",
        partial: "Simulacao parcial",
        planned: "Planejado",
        experimental: "Experimental",
        documentationOnly: "Apenas documental",
        visualOnly: "Apenas visual",
        undefined: "Status indefinido",
      },
      simulationMode: {
        full: "Simulacao completa",
        partial: "Simulacao parcial",
        visualOnly: "Visual apenas",
        planned: "Planejado",
        documentationOnly: "Documental",
        undefined: "Modo nao catalogado",
      },
      action: {
        current: "Simulador atual",
        open: "Abrir",
        partial: "Parcial",
        planned: "Em breve",
        experimental: "Experimental",
        documental: "Documental",
        visual: "Visual",
        unavailable: "Indisponivel",
      },
      availabilityNote: {
        currentAvailable:
          "Este e o simulador atual do projeto, com interacao completa fora da biblioteca.",
        partial:
          "Este componente possui apenas visualizacao parcial ou conceitual nesta fase.",
        visualOnly:
          "Este componente apresenta apenas visualizacao didatica de estados e comportamento.",
        documentationOnly:
          "Este componente aparece como referencia documental e visual, sem simulacao interativa.",
        planned: "Este componente ainda nao possui simulacao interativa.",
        experimental:
          "Este componente esta em estado experimental e pode mudar nas proximas iteracoes.",
        undefined: "Estado de disponibilidade nao definido.",
      },
      itemNote: {
        current: "Modulo atual com simulacao completa.",
        available: "Disponivel para estudo no projeto atual.",
        unavailable: "Sem simulacao interativa; detalhes apenas didaticos.",
      },
      cta: {
        detailsOpen: "Detalhes abertos",
        viewDetails: "Visualizar detalhes",
      },
      categories: {
        drives: {
          name: "Acionamentos",
          description:
            "Dispositivos para partida, controle e variacao de velocidade.",
        },
        protection: {
          name: "Protecao",
          description:
            "Componentes de protecao eletrica e protecao de motores.",
        },
        "control-signaling": {
          name: "Comando e sinalizacao",
          description:
            "Elementos de comando, sinalizacao e logica de painel.",
        },
        sensors: {
          name: "Sensores",
          description:
            "Sensores e dispositivos de deteccao para automacao.",
        },
        automation: {
          name: "Automacao",
          description:
            "Controladores, interfaces e modulos de entrada e saida.",
        },
        "power-interface": {
          name: "Alimentacao e interface",
          description: "Fontes, transformadores e conversao de sinais.",
        },
        "connection-mounting": {
          name: "Conexao e montagem",
          description:
            "Itens de conexao fisica e organizacao de paines.",
        },
      },
    },
    motorPanel: {
      title: "Simulacao do motor",
      expandChart: "Expandir grafico",
      running: "Motor em funcionamento",
      stopped: "Motor parado",
      fanAlt: "Helice do motor",
      frequencyLabel: "Frequencia",
      rotationLabel: "Rotacao",
      chartTab: "Grafico",
      logTab: "Log de Eventos",
      chartTitle: "Grafico de Grandezas",
      pauseAria: "Pausar atualizacao do grafico",
      resumeAria: "Retomar atualizacao do grafico",
      pauseButton: "Pausar",
      resumeButton: "Retomar",
      seriesGroupAria: "Series exibidas no grafico",
      showSeries: "Exibir serie {label}",
      hideSeries: "Ocultar serie {label}",
      timeWindowAria: "Janela de tempo do grafico",
      showWindow: "Exibir janela de {label}",
      leftAxis: "Esquerda: rpm",
      rightAxis: "Direita: A",
      paused: "Pausado",
      live: "Ao vivo",
      now: "agora",
      chartAriaLabel: "Grafico historico das grandezas do motor",
      historySummary:
        "Historico das grandezas do motor no intervalo selecionado. Frequencia atual {frequency}. Corrente atual {current}. Temperatura atual {temperature}. Ixt atual {ixt}. {faultSummary}",
      unavailableValue: "{unit} indisponivel",
      noActiveFault: "Sem falha ativa.",
      activeFault: "Falha ativa F{code}.",
      eventLogTitle: "Historico de Alteracoes",
      noEvents: "Nenhum evento registrado ainda.",
      logParameterChanged: "Parametro {code} alterado para {value}",
      logMotorStarted: "Motor iniciado",
      logMotorStopped: "Motor parado",
      series: {
        rpm: "Rotacao",
        current: "Corrente",
        frequency: "Frequencia",
        temperature: "Temp.",
        ixtPercent: "Ixt",
        torquePercent: "Torque",
      },
    },
    motor: {
      controlMode: {
        vfLinear: "V/f linear",
        vfQuadratic: "V/f quadratico",
        vfLinearActiveCurrentComp:
          "V/f linear c/ compensacao de corrente ativa",
        vfQuadraticActiveCurrentComp:
          "V/f quadratico c/ compensacao de corrente ativa",
        noFunction: "Sem funcao",
        vvw: "VVW",
      },
      notes: {
        coastDown:
          "Saida eletrica desativada: motor em coast-down por inercia.",
        currentLimited:
          "Corrente ({current} A) acima de P135 ({limit} A): limitacao de corrente atuaria.",
      },
    },
    parameterInfo: {
      tabs: {
        parameter: "Parametro",
        status: "Status",
        technical: "Tecnico",
        simulation: "Simulacao",
      },
      tabsAriaLabel: "Abas de informacoes do parametro",
      loadingTab: "Carregando conteudo da aba...",
      loadingQuickList: "Carregando lista de parametros...",
      parameterListButton: "Lista de parametros",
      searchLabel: "Buscar parametro por codigo, nome ou categoria",
      searchHint:
        "Digite para localizar parametros e selecione um resultado da lista.",
      searchPlaceholder: "Buscar por codigo, nome, categoria...",
      searchResultsAria: "Resultados da busca de parametros",
      selectParameterAria:
        "Selecionar parametro {code} - {name}",
      noResults: "Nenhum parametro encontrado.",
      fileSave: "Salvar configuracao",
      fileLoad: "Carregar configuracao",
      fileSaved: "Arquivo de configuracao salvo.",
      fileLoaded: "Configuracao carregada ({count} parametros).",
      fileLoadError:
        "Nao foi possivel carregar o arquivo de configuracao.",
      selectedParameter: "Parametro selecionado",
      overviewDescription: "Descricao",
      range: "Faixa",
      unit: "Unidade",
      currentValue: "Valor atual",
      factoryDefault: "Padrao de fabrica",
      access: "Acesso",
      manualPage: "Pagina do manual",
      detailedDescription: "Descricao detalhada",
      category: "Categoria",
      readOnly: "Somente leitura",
      editable: "Editavel",
      requiresStoppedMotor: "Requer motor parado",
      requiresAccessory: "Requer acessorio",
      difficulty: "Dificuldade",
      editCondition: "Condicao de edicao",
      difficultyLevel: {
        basico: "Basico",
        intermediario: "Intermediario",
        avancado: "Avancado",
      },
      badges: {
        readOnly: "Somente leitura",
        editable: "Editavel",
        stoppedMotor: "Motor parado",
        requiresAccessory: "Requer acessorio",
        protected: "Protegido",
        unlocked: "Liberado",
        difficulty: {
          basico: "Basico",
          intermediario: "Intermediario",
          avancado: "Avancado",
        },
      },
      editReasons: {
        missingParameter: "Parametro inexistente.",
        readOnlyMode: "Modo somente leitura: alteracao bloqueada.",
        readOnlyParameter: "Este parametro e somente leitura.",
        lockedAdvanced: "Este parametro avancado esta bloqueado no modo atual.",
        requiresAccessory:
          "Este parametro depende de acessorio externo e nao esta disponivel nesta configuracao.",
        requiresStoppedMotor: "Este parametro so pode ser alterado com o motor parado.",
        motorControlStopped:
          "rUn: Parametro de controle/motor exige motor parado para edicao.",
        multispeedUnavailable:
          "ConF: Multispeed nao selecionado em P221 ou P222.",
        vvwIncompatible: "ConF: Incompativel com modo de controle VVW (P202=5).",
        passwordProtected: "Parametro protegido. Libere o acesso em P000.",
      },
      accessory: {
        expansao_io: "Modulo de expansao de I/O",
        can: "Interface CAN",
        bluetooth: "Modulo Bluetooth",
        expansao_io_ou_can: "Expansao de I/O ou interface CAN",
      },
      simulatorSupport: "Suporte no simulador",
      implementedEffects: "Efeitos implementados",
      currentSituation: "Situacao atual",
      generalDescription: "Descricao geral do parametro",
      practicalExample: "Exemplo pratico",
      relatedParameters: "Parametros relacionados",
      noImplementedEffects: "Nenhum efeito implementado",
      simulationPrimaryTitle: "O que acontece no simulador?",
      documentedBehaviorTitle: "Comportamento documentado",
      simulationStatusMessage: {
        full:
          "O efeito principal deste parametro ja esta implementado no simulador.",
        partial:
          "Suporte parcial: o simulador implementa apenas parte do comportamento deste parametro, entao algumas opcoes ou efeitos do inversor real ainda nao aparecem.",
        read_only_supported:
          "Somente leitura/telemetria: este parametro reflete estados calculados pelo simulador, mas nao comanda sozinho o nucleo fisico.",
        editable_without_effect:
          "Este parametro esta disponivel para consulta/edicao, mas ainda nao altera diretamente o nucleo de simulacao.",
        catalog_only:
          "Este parametro esta catalogado, mas ainda nao possui comportamento especifico implementado no simulador.",
        undefined:
          "Este parametro ainda nao possui uma classificacao clara de suporte no simulador.",
      },
      implementationStatus: {
        catalog_only: "Apenas catalogado",
        read_only_supported: "Leitura suportada",
        editable_without_effect: "Editavel sem efeito",
        partial: "Suporte parcial",
        full: "Suporte completo",
      },
      simulationEffect: {
        telemetry: "Telemetria",
        ramp_control: "Controle de rampa",
        multispeed_reference: "Referencias multispeed",
        motor_model: "Modelo do motor",
        digital_input_functions: "Funcoes de entradas digitais",
        password_access: "Acesso por senha",
        ramp_selection: "Selecao de rampa",
        reference_backup: "Backup de referencia",
        hmi_reference: "Referencia pela HMI",
        jog_reference: "Referencia JOG",
        frequency_limits: "Limites de frequencia",
        current_limit: "Limite de corrente",
        overload_protection: "Protecao de sobrecarga",
        motor_control_mode: "Modo de controle do motor",
        parameter_set_persistence: "Carga e salvamento de parametros",
        display_bar: "Barra grafica",
        locrem_selection: "Selecao LOC/REM",
        reference_source_selection: "Selecao da fonte de referencia",
        rotation_selection: "Selecao do sentido de giro",
        run_command_selection: "Selecao do comando Gira/Para",
        jog_source_selection: "Selecao da fonte JOG",
        stop_mode: "Modo de parada",
        analog_input_scaling: "Escala da entrada analogica",
        frequency_input_scaling: "Escala da entrada em frequencia",
      },
      quickListTitle: "Lista de parametros ({count})",
      quickListCloseAria: "Fechar lista de parametros",
      quickListClose: "Fechar",
      accessEditable: "Editavel",
      accessReadOnly: "Somente leitura",
      commandStatus: {
        mode: "Modo",
        modeLocal: "Local",
        modeRemote: "Remoto",
        reference: "Referencia",
        command: "Comando",
        jog: "JOG",
        jogActive: "{label} ativo",
        direction: "Sentido",
        ramp: "Rampa",
      },
      motorTitle: "Motor",
      control: "Controle",
      rotation: "Rotacao",
      frequency: "Frequencia",
      current: "Corrente",
      voltage: "Tensao",
      torque: "Torque",
      dcBus: "Barram. CC",
      loadLabel: "Carga (conjugado resistente): {value}%",
      loadDescription: "Ajusta a carga mecanica simulada aplicada ao motor.",
      loadValueText: "{value}% de carga do motor",
      externalSourcesTitle: "Fontes externas simuladas",
      analogFrequency: "Analogicas e frequencia",
      digitalInputs: "Entradas digitais",
      networksSoftplc: "Redes e SoftPLC",
      reference13Bit: "Referencia 13 bits",
      run: "Run",
      jog: "JOG",
      counterClockwise: "Anti-horario",
      remoteMode: "REM",
    },
  },
  "en-US": {
    app: {
      title: "CFW100 Inverter Simulator",
    },
    header: {
      menuButton: "Menu",
      componentsButton: "Components",
      languageLabel: "Language",
      languageSelectorAriaLabel: "Select language",
      activePreset: "Active preset: {name}",
      documentaryNotes: "{count} documentary note(s)",
      scenarioMode: {
        student: "Student",
        technical: "Technical",
        readOnly: "Read only",
        freeEdit: "Free edit",
        default: "Default",
      },
    },
    menu: {
      ariaLabel: "Configuration and scenario menu",
      saveConfiguration: "Save configuration",
      loadConfiguration: "Load configuration",
      realScenarios: "Real scenarios",
      submenuAriaLabel: "Real scenarios submenu",
      savedFeedback: "Configuration saved",
      loadedFeedback: "Configuration loaded ({count} parameters)",
      loadError: "Error loading file",
      scenarioLoaded: "{name} loaded",
    },
    common: {
      close: "Close",
      notInformed: "Not informed",
      yes: "Yes",
      no: "No",
      unavailable: "Unavailable",
      unitCelsius: "degrees Celsius",
      unitPercent: "percent",
    },
    commandSource: {
      alwaysLocal: "Always Local",
      alwaysRemote: "Always Remote",
      dix: "DIx",
      serialUsbLoc: "Serial/USB (LOC)",
      serialUsbRem: "Serial/USB (REM)",
      codnLoc: "CO/DN (LOC)",
      codnRem: "CO/DN (REM)",
      softplc: "SoftPLC",
      hmiKeys: "HMI keys",
      ai1: "AI1",
      fi: "FI",
      electronicPot: "Electronic potentiometer",
      multispeed: "Multispeed",
      serialUsb: "Serial/USB",
      codn: "CO/DN",
      ai1Positive: "AI1 > 0",
      fiPositive: "FI > 0",
      noFunction: "No function",
      inactive: "Inactive",
      clockwise: "Clockwise",
      counterClockwise: "Counterclockwise",
      serialCW: "Serial/USB (CW)",
      serialCCW: "Serial/USB (CCW)",
      codnCW: "CO/DN (CW)",
      codnCCW: "CO/DN (CCW)",
      reserved: "Reserved",
    },
    rampSelector: {
      ramp1: "1st ramp",
      ramp2: "2nd ramp",
      emergency: "Emergency",
      notSimulated: "Ramp selection \"{label}\" not simulated: using 1st ramp.",
    },
    commandStatusNotes: {
      pwmBlocked: "PWM blocked by {reason}.",
      referenceUnavailable: "Reference \"{label}\" unavailable: using 0 Hz.",
    },
    faultCatalog: {
      F003: { shortLabel: "Overcurrent", description: "Current above power stage limit." },
      F004: { shortLabel: "DC bus overvoltage", description: "DC bus voltage above safe limit." },
      F005: { shortLabel: "DC bus undervoltage", description: "Fault F005 manually simulated. Different from the SUB state handled separately by the HMI." },
      F006: { shortLabel: "Phase loss", description: "Absence of one or more supply or output phases." },
      F007: { shortLabel: "Phase sequence", description: "Inconsistent or reversed phase sequence." },
      F010: { shortLabel: "Generic thermal fault", description: "Generic manual thermal fault for training. Does not replace the automatic F051 module fault." },
      F012: { shortLabel: "Communication fault", description: "Serial communication error or link loss." },
      F014: { shortLabel: "Encoder fault", description: "Speed/position feedback problem." },
      F016: { shortLabel: "Brake fault", description: "Fault in the brake circuit or command." },
      F017: { shortLabel: "Ramp fault", description: "Didactic error associated with ramp generation/command." },
      F020: { shortLabel: "Firmware fault", description: "Internal firmware or memory error." },
      F051: { shortLabel: "Module overtemperature", description: "Power module temperature above thermal limit (P030 >= 85 C)." },
      F070: { shortLabel: "Generic simulated fault", description: "Generic code used by the simulator for display, reset, and regression tests." },
      F072: { shortLabel: "Ixt overload", description: "Motor Ixt thermal protection reached 100% due to prolonged overload." },
      F088: { shortLabel: "External PLC fault", description: "Communication or logic fault in the external PLC." },
      F098: { shortLabel: "Port fault", description: "Error on a communication port or interface." },
    },
    hmiA11y: {
      panelLabel: "CFW100 inverter front panel",
      summary: "Inverter display: {value}. {status}. {direction}. {event}.",
      liveSummary: "{status}. {direction}. {event}.",
      statusRun: "RUN state",
      statusReady: "Ready state",
      statusFault: "Fault state",
      statusSub: "Undervoltage state",
      statusConfig: "Invalid configuration state",
      directionForward: "Forward direction",
      directionReverse: "Reverse direction",
      noFault: "No active fault",
      activeFault: "Active fault {code}",
      activeAlarm: "Active alarm {code}",
      frequencyValue: "Current frequency {value} hertz",
      genericValue: "Value {value}",
      valueWithUnit: "Value {value} {unit}",
    },
    hmiControls: {
      openMenu: "Open programming menu",
      decreaseReference: "Decrease frequency reference",
      increaseReference: "Increase frequency reference",
      run: "Start the drive",
      stop: "Stop the drive",
    },
    configurationFileErrors: {
      noFile: "No file selected.",
      emptyFile: "The selected file is empty.",
      fileTooLarge: "File too large for import. Limit is 1 MB.",
      invalidType: "Select a JSON configuration file.",
      invalidJson: "The selected file does not contain valid JSON.",
      invalidConfiguration:
        "The file is not a compatible simulator configuration.",
      unsupportedVersion:
        "This configuration version is not supported by the simulator.",
      incompatibleModel:
        "The selected configuration does not belong to the CFW100 model.",
      unreadable: "The selected file could not be read.",
      unknown: "Could not load the configuration file.",
    },
    about: {
      title: "About the simulator",
      description:
        "Institutional overview of the didactic WEG CFW100 inverter simulator.",
      purposeTitle: "Purpose",
      purposeItems: [
        "Explain the basic operation of the inverter and its parameters.",
        "Support classes, study sessions, and controlled demonstrations.",
      ],
      authorshipTitle: "Authorship",
      authorshipText:
        "Didactic project focused on drives and industrial automation study.",
      technologiesTitle: "Technologies",
      technologiesItems: [
        "React for the interface.",
        "Local simulation models for HMI, motor, and protections.",
      ],
      resourcesTitle: "Resources",
      resourcesItems: [
        "HMI panel with keyboard navigation.",
        "Didactic component library.",
        "Motor visualization and event history.",
      ],
      limitationsTitle: "Limitations",
      limitationsItems: [
        "It does not replace the official WEG manual.",
        "It must not be used for real commissioning.",
        "Not every component has interactive simulation.",
      ],
      statusTitle: "Status",
      statusText: "Didactic tool under controlled evolution.",
      closeButton: "Close",
    },
    faultSimulator: {
      buttonLabel: "Faults",
      dialogTitle: "Fault Simulator",
      closeAriaLabel: "Close fault simulator",
      manualUnavailable:
        "An automatic fault cannot be injected manually.",
      validCode: "Valid code",
      triggeredFeedback: "Fault F{code} triggered: {label}",
      resetFeedback: "Fault reset",
      activeFault: "Active fault: F{code}",
      resetButton: "Reset fault",
      automaticNote:
        'Faults marked as "Automatic + manual" may also appear on their own due to the Ixt overload and module temperature models.',
      triggerType: {
        manual: "Manual",
        automatic: "Automatic",
        both: "Automatic + manual",
      },
    },
    componentLibrary: {
      triggerButton: "Components",
      loadingTitle: "Loading component library",
      loadingDescription:
        "The component library details are loading on demand.",
      panelTitle: "Component Library",
      intro:
        "Not every item has interactive simulation. Check the status of each component.",
      cataloguedCount: "{count} catalogued items",
      availableCount: "{count} available now",
      roadmapCount: "{count} on roadmap",
      closeAriaLabel: "Close component library",
      studyTitle: "Study library",
      studyDescription:
        "Select a component to review how it works, its data, states, and a simple didactic chart.",
      overviewTitle: "Overview",
      commandFunctionTitle: "Function in control circuits",
      operatingPrincipleTitle: "Operating principle",
      applicationsTitle: "Typical applications",
      mainDataTitle: "Main technical data",
      statesTitle: "Didactic states",
      chartTitle: "Didactic chart",
      limitationsTitle: "Current limitations",
      dataHeader: "Data",
      valueHeader: "Value",
      unitHeader: "Unit",
      chartNoPoints: "No chart points registered.",
      chartSummary:
        "Starts at {startLabel} with value {startValue}. Ends at {endLabel} with value {endValue}.",
      status: {
        available: "Available",
        partial: "Partial simulation",
        planned: "Planned",
        experimental: "Experimental",
        documentationOnly: "Documentation only",
        visualOnly: "Visual only",
        undefined: "Undefined status",
      },
      simulationMode: {
        full: "Full simulation",
        partial: "Partial simulation",
        visualOnly: "Visual only",
        planned: "Planned",
        documentationOnly: "Documentation only",
        undefined: "Unknown mode",
      },
      action: {
        current: "Current simulator",
        open: "Open",
        partial: "Partial",
        planned: "Soon",
        experimental: "Experimental",
        documental: "Documental",
        visual: "Visual",
        unavailable: "Unavailable",
      },
      availabilityNote: {
        currentAvailable:
          "This is the project's current simulator, with full interaction outside the library.",
        partial:
          "This component currently offers only partial or conceptual visualization.",
        visualOnly:
          "This component currently offers visual-only didactic state and behavior.",
        documentationOnly:
          "This component appears only as a documentary and visual reference, without interactive simulation.",
        planned: "This component does not have interactive simulation yet.",
        experimental:
          "This component is experimental and may change in upcoming iterations.",
        undefined: "Availability state not defined.",
      },
      itemNote: {
        current: "Current module with full simulation.",
        available: "Available for study in the current project.",
        unavailable: "No interactive simulation; didactic details only.",
      },
      cta: {
        detailsOpen: "Details open",
        viewDetails: "View details",
      },
      categories: {
        drives: {
          name: "Drives",
          description:
            "Devices for starting, control, and speed variation.",
        },
        protection: {
          name: "Protection",
          description:
            "Electrical protection and motor protection components.",
        },
        "control-signaling": {
          name: "Control and signaling",
          description:
            "Control, signaling, and panel logic elements.",
        },
        sensors: {
          name: "Sensors",
          description:
            "Detection sensors and devices for automation.",
        },
        automation: {
          name: "Automation",
          description:
            "Controllers, interfaces, and input/output modules.",
        },
        "power-interface": {
          name: "Power and interface",
          description: "Supplies, transformers, and signal conversion.",
        },
        "connection-mounting": {
          name: "Connection and mounting",
          description:
            "Physical connection and panel organization items.",
        },
      },
    },
    motorPanel: {
      title: "Motor simulation",
      expandChart: "Expand chart",
      running: "Motor running",
      stopped: "Motor stopped",
      fanAlt: "Motor fan",
      frequencyLabel: "Frequency",
      rotationLabel: "Rotation",
      chartTab: "Chart",
      logTab: "Event log",
      chartTitle: "Signal chart",
      pauseAria: "Pause chart updates",
      resumeAria: "Resume chart updates",
      pauseButton: "Pause",
      resumeButton: "Resume",
      seriesGroupAria: "Displayed chart series",
      showSeries: "Show {label} series",
      hideSeries: "Hide {label} series",
      timeWindowAria: "Chart time window",
      showWindow: "Show {label} window",
      leftAxis: "Left: rpm",
      rightAxis: "Right: A",
      paused: "Paused",
      live: "Live",
      now: "now",
      chartAriaLabel: "Motor historical signal chart",
      historySummary:
        "Motor signal history for the selected interval. Current frequency {frequency}. Current current {current}. Current temperature {temperature}. Current Ixt {ixt}. {faultSummary}",
      unavailableValue: "{unit} unavailable",
      noActiveFault: "No active fault.",
      activeFault: "Active fault F{code}.",
      eventLogTitle: "Change history",
      noEvents: "No events recorded yet.",
      logParameterChanged: "Parameter {code} changed to {value}",
      logMotorStarted: "Motor started",
      logMotorStopped: "Motor stopped",
      series: {
        rpm: "Rotation",
        current: "Current",
        frequency: "Frequency",
        temperature: "Temp.",
        ixtPercent: "Ixt",
        torquePercent: "Torque",
      },
    },
    motor: {
      controlMode: {
        vfLinear: "Linear V/f",
        vfQuadratic: "Quadratic V/f",
        vfLinearActiveCurrentComp:
          "Linear V/f with active current compensation",
        vfQuadraticActiveCurrentComp:
          "Quadratic V/f with active current compensation",
        noFunction: "No function",
        vvw: "VVW",
      },
      notes: {
        coastDown:
          "Electrical output disabled: motor is coasting down by inertia.",
        currentLimited:
          "Current ({current} A) above P135 ({limit} A): current limiting would act.",
      },
    },
    parameterInfo: {
      tabs: {
        parameter: "Parameter",
        status: "Status",
        technical: "Technical",
        simulation: "Simulation",
      },
      tabsAriaLabel: "Parameter information tabs",
      loadingTab: "Loading tab content...",
      loadingQuickList: "Loading parameter list...",
      parameterListButton: "Parameter list",
      searchLabel: "Search parameter by code, name, or category",
      searchHint:
        "Type to locate parameters and choose a result from the list.",
      searchPlaceholder: "Search by code, name, category...",
      searchResultsAria: "Parameter search results",
      selectParameterAria: "Select parameter {code} - {name}",
      noResults: "No parameter found.",
      fileSave: "Save configuration",
      fileLoad: "Load configuration",
      fileSaved: "Configuration file saved.",
      fileLoaded: "Configuration loaded ({count} parameters).",
      fileLoadError: "Could not load the configuration file.",
      selectedParameter: "Selected parameter",
      overviewDescription: "Description",
      range: "Range",
      unit: "Unit",
      currentValue: "Current value",
      factoryDefault: "Factory default",
      access: "Access",
      manualPage: "Manual page",
      detailedDescription: "Detailed description",
      category: "Category",
      readOnly: "Read only",
      editable: "Editable",
      requiresStoppedMotor: "Requires stopped motor",
      requiresAccessory: "Requires accessory",
      difficulty: "Difficulty",
      editCondition: "Edit condition",
      difficultyLevel: {
        basico: "Basic",
        intermediario: "Intermediate",
        avancado: "Advanced",
      },
      badges: {
        readOnly: "Read only",
        editable: "Editable",
        stoppedMotor: "Stopped motor",
        requiresAccessory: "Requires accessory",
        protected: "Protected",
        unlocked: "Unlocked",
        difficulty: {
          basico: "Basic",
          intermediario: "Intermediate",
          avancado: "Advanced",
        },
      },
      editReasons: {
        missingParameter: "Parameter not found.",
        readOnlyMode: "Read-only mode: change blocked.",
        readOnlyParameter: "This parameter is read only.",
        lockedAdvanced: "This advanced parameter is locked in the current mode.",
        requiresAccessory:
          "This parameter depends on an external accessory and is not available in this configuration.",
        requiresStoppedMotor: "This parameter can only be changed with the motor stopped.",
        motorControlStopped:
          "rUn: Motor/control parameter requires the motor to be stopped for editing.",
        multispeedUnavailable:
          "ConF: Multispeed is not selected in P221 or P222.",
        vvwIncompatible: "ConF: Incompatible with VVW control mode (P202=5).",
        passwordProtected: "Protected parameter. Unlock access in P000.",
      },
      accessory: {
        expansao_io: "I/O expansion module",
        can: "CAN interface",
        bluetooth: "Bluetooth module",
        expansao_io_ou_can: "I/O expansion or CAN interface",
      },
      simulatorSupport: "Simulator support",
      implementedEffects: "Implemented effects",
      currentSituation: "Current situation",
      generalDescription: "General parameter description",
      practicalExample: "Practical example",
      relatedParameters: "Related parameters",
      noImplementedEffects: "No implemented effect",
      simulationPrimaryTitle: "What happens in the simulator?",
      documentedBehaviorTitle: "Documented behavior",
      simulationStatusMessage: {
        full:
          "The main effect of this parameter is already implemented in the simulator.",
        partial:
          "Partial support: the simulator implements only part of this parameter's behavior, so some options or effects from the real drive are still not shown.",
        read_only_supported:
          "Read-only/telemetry: this parameter reflects states calculated by the simulator, but does not directly command the physical core on its own.",
        editable_without_effect:
          "This parameter is available for consultation or editing, but still does not directly change the simulation core.",
        catalog_only:
          "This parameter is catalogued, but does not yet have specific behavior implemented in the simulator.",
        undefined:
          "This parameter does not yet have a clear simulator support classification.",
      },
      implementationStatus: {
        catalog_only: "Catalogued only",
        read_only_supported: "Read-only supported",
        editable_without_effect: "Editable without effect",
        partial: "Partial support",
        full: "Full support",
      },
      simulationEffect: {
        telemetry: "Telemetry",
        ramp_control: "Ramp control",
        multispeed_reference: "Multispeed references",
        motor_model: "Motor model",
        digital_input_functions: "Digital input functions",
        password_access: "Password access",
        ramp_selection: "Ramp selection",
        reference_backup: "Reference backup",
        hmi_reference: "HMI reference",
        jog_reference: "JOG reference",
        frequency_limits: "Frequency limits",
        current_limit: "Current limit",
        overload_protection: "Overload protection",
        motor_control_mode: "Motor control mode",
        parameter_set_persistence: "Parameter load and save",
        display_bar: "Graphic bar",
        locrem_selection: "LOC/REM selection",
        reference_source_selection: "Reference source selection",
        rotation_selection: "Rotation direction selection",
        run_command_selection: "Run/Stop command selection",
        jog_source_selection: "JOG source selection",
        stop_mode: "Stop mode",
        analog_input_scaling: "Analog input scaling",
        frequency_input_scaling: "Frequency input scaling",
      },
      quickListTitle: "Parameter list ({count})",
      quickListCloseAria: "Close parameter list",
      quickListClose: "Close",
      accessEditable: "Editable",
      accessReadOnly: "Read only",
      commandStatus: {
        mode: "Mode",
        modeLocal: "Local",
        modeRemote: "Remote",
        reference: "Reference",
        command: "Command",
        jog: "JOG",
        jogActive: "{label} active",
        direction: "Direction",
        ramp: "Ramp",
      },
      motorTitle: "Motor",
      control: "Control",
      rotation: "Rotation",
      frequency: "Frequency",
      current: "Current",
      voltage: "Voltage",
      torque: "Torque",
      dcBus: "DC bus",
      loadLabel: "Load (resistant torque): {value}%",
      loadDescription: "Adjusts the simulated mechanical load applied to the motor.",
      loadValueText: "{value}% motor load",
      externalSourcesTitle: "Simulated external sources",
      analogFrequency: "Analog and frequency",
      digitalInputs: "Digital inputs",
      networksSoftplc: "Networks and SoftPLC",
      reference13Bit: "13-bit reference",
      run: "Run",
      jog: "JOG",
      counterClockwise: "Counterclockwise",
      remoteMode: "REM",
    },
  },
};

function getValueByPath(source, key) {
  return key.split(".").reduce((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return current[part];
    }

    return undefined;
  }, source);
}

function interpolateString(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (match, paramName) => {
    if (!(paramName in params)) {
      return match;
    }

    return String(params[paramName]);
  });
}

function interpolateValue(value, params) {
  if (typeof value === "string") {
    return interpolateString(value, params);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, params));
  }

  return value;
}

export function getTranslationValue(language, key) {
  return getValueByPath(TRANSLATIONS[language], key);
}

export function hasTranslation(language, key) {
  return getTranslationValue(language, key) !== undefined;
}

export function translate(language, key, params) {
  const value =
    getTranslationValue(language, key) ??
    getTranslationValue(DEFAULT_LANGUAGE, key);

  if (value === undefined) {
    return key;
  }

  return interpolateValue(value, params);
}
