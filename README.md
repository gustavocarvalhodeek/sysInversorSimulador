# Simulador Web WEG CFW100

Simulador web didático do inversor de frequência WEG CFW100, desenvolvido em React + Vite para estudo, treinamento e demonstração de conceitos de automação industrial.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?logo=javascript&logoColor=black)
![i18n](https://img.shields.io/badge/i18n-PT--BR%20%7C%20EN--US-FF8A00)
![Frontend Only](https://img.shields.io/badge/Architecture-Frontend_Only-2D9C5A)
![License](https://img.shields.io/badge/License-ISC-blue)

## 📌 Sobre o projeto

O **Simulador Web WEG CFW100** reproduz, de forma visual e didática, partes importantes da operação de um inversor de frequência voltado ao ensino de acionamentos elétricos e automação industrial.

O sistema foi construído como uma aplicação **frontend-only**, sem backend e sem banco de dados, com persistência local via `localStorage`. O foco está em permitir exploração segura de conceitos como:

- operação da HMI frontal;
- navegação e edição de parâmetros;
- estados do inversor;
- fontes de comando e referência;
- rampas de aceleração e desaceleração;
- resposta do motor;
- falhas e alarmes;
- cenários/presets de estudo;
- biblioteca didática de componentes industriais.

## 🎯 Objetivo

Este projeto foi criado para apoiar:

- aulas e laboratórios de automação industrial;
- treinamento introdutório sobre inversores de frequência;
- demonstrações controladas de lógica de comando;
- estudo de parâmetros, rampas, falhas e comportamento do motor;
- documentação e comunicação técnica em ambientes educacionais.

## 🧠 Contexto didático

Este sistema é um **simulador educacional**. Ele foi modelado para estudo, treinamento e demonstração, e **não** para operação industrial real.

> **Aviso importante**
>
> Este projeto **não deve ser usado para comandar, configurar, validar ou comissionar equipamentos industriais reais** sem análise técnica, consulta ao manual oficial do fabricante e responsabilidade profissional.
>
> O comportamento do sistema foi simplificado e adaptado para fins didáticos.

## ✨ Funcionalidades

- **Simulação do inversor**
  - HMI frontal inspirada no WEG CFW100
  - display simulado
  - botões RUN, STOP, RESET, MENU, UP e DOWN
  - estados `RUN`, `STOP`, `READY`, `FAULT`, `CFG` e `SUB`
  - comando local e remoto

- **Parâmetros**
  - catálogo técnico de parâmetros
  - busca por código, nome e categoria
  - edição com regras de bloqueio
  - parâmetros somente leitura
  - parâmetros dependentes de contexto
  - conteúdo técnico e didático contextual

- **Comando, referência e rampas**
  - referência por HMI, AI1, FI, Serial/USB, CO/DN, SoftPLC e multispeed
  - resolução de comando local/remoto
  - primeira rampa, segunda rampa e emergência
  - mensagens estruturadas de status e fallback PT-BR

- **Simulação do motor**
  - frequência de saída
  - rotação em rpm
  - corrente
  - torque
  - tensão de saída
  - barramento CC
  - temperatura do módulo
  - sobrecarga Ixt
  - carga aplicada
  - gráficos históricos e log de eventos

- **Falhas e alarmes**
  - injeção manual de falhas suportadas
  - falhas automáticas por temperatura e sobrecarga
  - reset de falhas
  - histórico da última falha
  - catálogo de falhas traduzido

- **Biblioteca de componentes**
  - catálogo didático de componentes elétricos e de automação
  - dados técnicos
  - princípio de funcionamento
  - aplicações típicas
  - limitações
  - estados didáticos
  - carregamento sob demanda

- **Internacionalização**
  - PT-BR
  - EN-US
  - fallback seguro em PT-BR
  - conteúdo acessível traduzido
  - mensagens estruturadas com `key + fallback + params`

- **Acessibilidade**
  - `label` associado a controles
  - `aria-label`, `aria-describedby` e `aria-valuetext`
  - `aria-live` para feedback relevante
  - diálogos com semântica acessível
  - foco em navegação por teclado e leitura assistiva

- **Performance**
  - lazy loading
  - code splitting
  - chunk separado para React vendor
  - biblioteca de componentes carregada sob demanda
  - abas secundárias carregadas sob demanda

- **Importação e exportação**
  - exportação de configuração em JSON
  - importação validada
  - proteção contra arquivo vazio, inválido, incompatível ou excessivamente grande

## 🖼️ Demonstração

Adicione aqui screenshots, GIFs ou vídeos do simulador em uso.

![](https://i.ibb.co/Lhs59wHQ/Captura-de-tela-2026-05-23-142708.png)

![](https://i.ibb.co/8gwyHxsJ/Captura-de-tela-2026-05-23-142809.png)

![](https://i.ibb.co/8gwyHxsJ/Captura-de-tela-2026-05-23-142809.png)

Se desejar, também é possível incluir:

- link para vídeo de demonstração;
- link para deploy de preview;
- GIF curto mostrando navegação na HMI.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| React | Interface da aplicação |
| Vite | Build, dev server e empacotamento |
| JavaScript ES Modules | Lógica da aplicação |
| CSS | Estilização |
| Node.js | Ambiente de desenvolvimento e execução de scripts |
| npm | Gerenciamento de dependências |
| ESLint | Qualidade estática de código |
| Node Test Runner | Testes automatizados |
| LocalStorage | Persistência local de idioma e configurações |

## 📋 Requisitos

Antes de iniciar, tenha instalado:

- **Node.js** compatível com a versão do Vite usada no projeto
- **npm**
- terminal compatível com comandos Node/npm

Também é recomendado:

- navegador moderno com suporte a ES Modules
- ambiente de desenvolvimento com lint e formatação habilitados

## 🚀 Como instalar

```bash
git clone https://github.com/USUARIO/NOME-DO-REPOSITORIO.git
cd NOME-DO-REPOSITORIO
npm install
```

## ▶️ Como executar em desenvolvimento

```bash
npm run dev
```

Depois, abra a URL exibida pelo Vite no terminal, normalmente algo como:

```bash
http://localhost:5173
```

## 🏗️ Como gerar build

```bash
npm run build
```

Para visualizar localmente a versão de produção:

```bash
npm run preview
```

## 🔍 Como testar

### Testes automatizados

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Verificações adicionais úteis

```bash
npm audit
npm ls --depth=0
```

## 📁 Estrutura do projeto

```text
/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── component-library/
│   │   ├── motor-simulation/
│   │   └── parameter-info/
│   ├── configurations/
│   ├── data/
│   ├── hmi/
│   │   ├── display/
│   │   ├── helpers/
│   │   ├── parameter-editing/
│   │   ├── parameter-effects/
│   │   └── parameters/
│   ├── hooks/
│   ├── i18n/
│   ├── logic/
│   ├── simulation/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── test/
├── examples/
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

### Visão geral das pastas

| Pasta / arquivo | Finalidade |
|---|---|
| `public/` | Arquivos públicos servidos diretamente |
| `src/assets/` | Recursos visuais da aplicação |
| `src/components/` | Componentes de UI |
| `src/components/component-library/` | Biblioteca didática de componentes |
| `src/components/motor-simulation/` | Gráficos, visualização e log do motor |
| `src/components/parameter-info/` | Abas e painéis auxiliares de parâmetros |
| `src/configurations/` | Presets, cenários e normalização de configurações |
| `src/data/` | Datasets, catálogos e conteúdos estruturados |
| `src/hmi/` | Núcleo da HMI, parâmetros e sincronização de estado |
| `src/hooks/` | Hooks de runtime e automação |
| `src/i18n/` | Idiomas, traduções e helpers de internacionalização |
| `src/logic/` | Regras auxiliares de domínio, falhas e status |
| `src/simulation/` | Física e lógica de simulação do inversor e motor |
| `src/utils/` | Persistência, importação/exportação e utilitários |
| `src/App.jsx` | Composição principal da aplicação |
| `src/main.jsx` | Ponto de entrada do React |
| `test/` | Testes automatizados do projeto |
| `examples/` | Materiais de apoio e exemplos complementares |

## 🕹️ Como usar o simulador

1. Execute o projeto em modo desenvolvimento ou abra o build em preview.
2. Observe a tela principal com a HMI, o painel de parâmetros e o painel do motor.
3. Use os botões da HMI para:
   - navegar;
   - iniciar e parar o inversor;
   - alterar a referência;
   - acessar o menu de parâmetros.
4. Explore os parâmetros pelo painel lateral:
   - pesquise pelo código;
   - verifique o suporte do simulador;
   - altere valores permitidos.
5. Teste presets e cenários para reproduzir condições típicas de estudo.
6. Acompanhe a resposta do motor pelo painel visual, pelo gráfico e pelo log.
7. Use o simulador de falhas para estudar reset, alarmes e comportamento da HMI.
8. Abra a biblioteca de componentes para revisar conceitos de automação industrial.
9. Salve ou carregue configurações em JSON para reutilizar setups didáticos.
10. Alterne entre PT-BR e EN-US para validar a experiência bilíngue.

## ⚙️ Principais módulos

### HMI frontal

Responsável por representar a experiência de operação do inversor:

- display;
- teclas;
- navegação de parâmetros;
- bloqueios de edição;
- estados operacionais;
- leitura de falhas e alarmes.

Arquivos centrais:

- `src/hmi/cfw100Hmi.js`
- `src/hmi/display/`
- `src/components/InverterBody.jsx`

### Catálogo e edição de parâmetros

Concentra a lógica didática e operacional dos parâmetros do simulador:

- catálogo técnico;
- enriquecimento didático;
- regras de leitura e escrita;
- bloqueios por estado;
- efeitos implementados na simulação.

Arquivos centrais:

- `src/hmi/parameters/cfw100ParameterCatalog.js`
- `src/hmi/parameters/cfw100ParameterEnrichment.js`
- `src/hmi/parameter-editing/hmiParameterEditing.js`
- `src/components/ParameterInfoPanel.jsx`

### Simulação física e lógica do motor

Executa a parte principal do comportamento dinâmico do sistema:

- rampas;
- referência resolvida;
- frequência de saída;
- corrente;
- torque;
- rotação;
- barramento CC;
- sobrecarga Ixt;
- temperatura.

Arquivos centrais:

- `src/simulation/cfw100DriveSimulation.js`
- `src/simulation/cfw100SimulationStep.js`
- `src/simulation/motorModel.js`
- `src/simulation/overloadModel.js`

### Falhas e alarmes

Gerencia o catálogo de falhas e a interação didática com o sistema:

- injeção manual de falhas suportadas;
- falhas automáticas;
- reset;
- exibição na HMI;
- histórico da última falha.

Arquivos centrais:

- `src/logic/faultCatalog.js`
- `src/logic/faultManager.js`
- `src/components/FaultSimulator.jsx`

### Presets e cenários

Facilitam a criação de condições de estudo reproduzíveis:

- configurações de fábrica;
- modos didáticos;
- cenários prontos para aulas;
- presets com sementes de simulação;
- importação de estado controlado.

Arquivos centrais:

- `src/configurations/`
- `src/data/`

### Biblioteca de componentes

Catálogo didático que complementa o simulador principal com conteúdo de estudo:

- acionamentos;
- proteção;
- sensores;
- comando e sinalização;
- automação;
- alimentação e interface;
- conexão e montagem.

Arquivos centrais:

- `src/components/component-library/`
- `src/data/simulatableComponents.js`
- `src/data/componentLibraryTranslations.js`

## 🌎 Internacionalização

O projeto possui suporte bilíngue:

- **PT-BR**
- **EN-US**

Características da implementação:

- fallback seguro em PT-BR;
- textos de interface e conteúdo técnico localizados;
- mensagens dinâmicas estruturadas com `key`, `fallback` e `params`;
- conteúdo acessível traduzido;
- persistência do idioma selecionado em `localStorage`.

Arquivos centrais:

- `src/i18n/translations.js`
- `src/i18n/I18nContext.jsx`
- `src/i18n/localizedContent.js`

## ♿ Acessibilidade

O projeto inclui recursos importantes de acessibilidade, com foco em navegação por teclado e leitura assistiva:

- labels explícitos para controles;
- `aria-label` em elementos interativos;
- `aria-valuetext` no slider de carga;
- `aria-live` em partes relevantes da interface;
- equivalentes textuais para elementos visuais importantes;
- semântica de diálogo em modais principais;
- foco visível para navegação por teclado.

O projeto continua aberto a refinamentos adicionais de acessibilidade, especialmente em interações mais complexas de gráficos e modais.

## 🚀 Performance

O projeto já adota otimizações importantes:

- **lazy loading** da biblioteca de componentes;
- **code splitting** em áreas secundárias;
- separação de **React/ReactDOM** em chunk de vendor;
- carregamento sob demanda de abas menos frequentes;
- redução do bundle inicial;
- uso de datasets pesados fora do caminho inicial sempre que possível.

Isso ajuda a manter o carregamento inicial mais rápido e a aplicação mais responsiva em cenários didáticos.

## 💾 Importação e exportação

O simulador permite salvar e restaurar configurações por JSON.

### Exportação

- salva parâmetros operacionais relevantes;
- preserva a proposta didática do setup atual;
- evita expor dados sensíveis desnecessários.

### Importação

O fluxo de importação possui validações defensivas, incluindo:

- arquivo ausente;
- arquivo vazio;
- tipo/extensão inválidos;
- JSON inválido;
- estrutura incompatível;
- versão não suportada;
- modelo incompatível;
- limite de tamanho antes da leitura do conteúdo.

Persistência local adicional:

- idioma;
- parâmetros editáveis;
- parte do contexto de configuração;
- dados de segurança persistidos localmente quando aplicável.

## 🧪 Testes

O projeto possui suíte automatizada com foco em:

- HMI;
- acessibilidade;
- motor e física didática;
- rampas;
- resolução de comando;
- falhas;
- i18n;
- importação/exportação;
- persistência;
- lazy loading e bundle;
- presets e cenários.

Arquivos de teste ficam em `test/` e utilizam o **Node Test Runner**.

Exemplos de comandos:

```bash
npm test
npm run lint
npm run build
npm audit
npm ls --depth=0
```

## ⚠️ Limitações conhecidas

- Este projeto é **didático**, não um firmware real.
- O sistema é **frontend-only** e não possui backend.
- Não há banco de dados.
- A persistência é local, baseada em `localStorage`.
- O comportamento do motor é uma aproximação educacional, não um modelo industrial de alta fidelidade.
- Nem todas as falhas possíveis do equipamento real estão simuladas.
- Nem todos os componentes da biblioteca possuem simulação interativa.
- Parte do conteúdo da biblioteca é documental ou visual, não operacional.
- O simulador **não substitui** o manual oficial do fabricante.
- O projeto **não deve ser usado** como ferramenta de validação de instalação industrial real.

## 🗺️ Roadmap

- ampliar a cobertura de falhas e alarmes;
- expandir a biblioteca de componentes didáticos;
- refinar o modelo físico do motor;
- melhorar a cobertura de testes E2E;
- evoluir a acessibilidade de modais, foco e gráficos;
- ampliar traduções técnicas e conteúdo bilíngue;
- enriquecer a documentação didática dos parâmetros;
- adicionar mais cenários prontos para treinamento;
- criar materiais visuais de apoio para aulas e laboratório.

## 🤝 Contribuição

Contribuições são bem-vindas, especialmente em:

- correções de lógica didática;
- acessibilidade;
- internacionalização;
- cobertura de testes;
- documentação técnica;
- melhoria de cenários e conteúdo educacional.

Fluxo sugerido:

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração.
3. Implemente a mudança com foco em segurança incremental.
4. Rode os comandos de qualidade:

```bash
npm run lint
npm test
npm run build
```

5. Abra um Pull Request com contexto técnico claro.

## 📄 Licença

Este projeto utiliza a licença **ISC**, conforme `package.json`.

Se o repositório for redistribuído em outro contexto, revise esta seção para refletir a licença oficial desejada pela equipe mantenedora.

## 👨‍💻 Autor

Projeto didático voltado ao estudo de inversores de frequência e automação industrial.

Preencha esta seção com os créditos finais do repositório, por exemplo:

- nome do autor;
- instituição;
- disciplina ou laboratório;
- equipe mantenedora;
- links profissionais ou acadêmicos.

Exemplo:

```md
Desenvolvido por Nome do Autor
Instituição / Curso / Laboratório
LinkedIn: https://www.linkedin.com/in/usuario
```

---

Se este projeto for usado em material didático, apresentações ou treinamentos, recomenda-se incluir junto ao repositório:

- screenshots do simulador;
- exemplos de configuração;
- roteiros de aula;
- exercícios práticos baseados em presets e falhas.
