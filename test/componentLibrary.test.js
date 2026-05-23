import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { COMPONENT_CATEGORIES } from "../src/data/componentCategories.js";
import { SIMULATABLE_COMPONENTS } from "../src/data/simulatableComponents.js";
import {
  COMPONENT_LIBRARY_TRANSLATIONS,
  localizeComponent,
  localizeComponentList,
} from "../src/data/componentLibraryTranslations.js";
import {
  COMPONENT_SIMULATION_MODE_LABELS,
  COMPONENT_STATUS_LABELS,
} from "../src/components/component-library/componentLibraryLabels.js";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("catalogo declara categorias de componentes individuais e um unico simulador disponivel", () => {
  assert.equal(COMPONENT_CATEGORIES.length, 7);
  assert.equal(SIMULATABLE_COMPONENTS.length >= 30, true);

  const availableComponents = SIMULATABLE_COMPONENTS.filter(
    (component) => component.status === "available",
  );

  assert.equal(availableComponents.length, 1);
  assert.equal(availableComponents[0].id, "cfw100");
  assert.equal(availableComponents[0].simulationMode, "full");

  const forbiddenKinds = new Set(["system", "process", "scenario"]);
  assert.equal(
    SIMULATABLE_COMPONENTS.every((component) => !forbiddenKinds.has(component.kind)),
    true,
  );
});

test("todos os componentes possuem campos didaticos minimos preenchidos", () => {
  for (const component of SIMULATABLE_COMPONENTS) {
    assert.equal(typeof component.description, "string", component.id);
    assert.equal(component.description.length > 0, true, component.id);
    assert.equal(typeof component.functionDescription, "string", component.id);
    assert.equal(component.functionDescription.length > 0, true, component.id);
    assert.equal(typeof component.operatingPrinciple, "string", component.id);
    assert.equal(component.operatingPrinciple.length > 0, true, component.id);
    assert.equal(Array.isArray(component.typicalApplications), true, component.id);
    assert.equal(component.typicalApplications.length > 0, true, component.id);
    assert.equal(Array.isArray(component.mainData), true, component.id);
    assert.equal(component.mainData.length > 0, true, component.id);
    assert.equal(Array.isArray(component.visualStates), true, component.id);
    assert.equal(component.visualStates.length > 0, true, component.id);
    assert.equal(Array.isArray(component.chartData), true, component.id);
    assert.equal(component.chartData.length > 0, true, component.id);
    assert.equal(Array.isArray(component.limitations), true, component.id);
    assert.equal(component.limitations.length > 0, true, component.id);
  }
});

test("catalogo possui entrada de traducao en-US para todos os componentes da biblioteca", () => {
  const translatedIds = Object.keys(COMPONENT_LIBRARY_TRANSLATIONS["en-US"] ?? {});
  const catalogIds = SIMULATABLE_COMPONENTS.map((component) => component.id);

  assert.deepEqual([...translatedIds].sort(), [...catalogIds].sort());
});

test("labels didaticos da biblioteca cobrem status e modos de simulacao", () => {
  assert.equal(COMPONENT_STATUS_LABELS.available, "Disponivel");
  assert.equal(COMPONENT_STATUS_LABELS.documentationOnly, "Apenas documental");
  assert.equal(COMPONENT_STATUS_LABELS.visualOnly, "Apenas visual");

  assert.equal(COMPONENT_SIMULATION_MODE_LABELS.full, "Simulacao completa");
  assert.equal(
    COMPONENT_SIMULATION_MODE_LABELS.documentationOnly,
    "Documental",
  );
  assert.equal(COMPONENT_SIMULATION_MODE_LABELS.planned, "Planejado");
});

test("helper de localizacao traduz os principais campos da biblioteca para en-US", () => {
  const drive = localizeComponent(
    SIMULATABLE_COMPONENTS.find((component) => component.id === "generic-vfd"),
    "en-US",
  );
  const pushButton = localizeComponent(
    SIMULATABLE_COMPONENTS.find(
      (component) => component.id === "push-button-na-nf",
    ),
    "en-US",
  );

  assert.equal(drive.name, "Generic frequency drive");
  assert.equal(drive.shortName, "Generic VFD");
  assert.equal(
    drive.description,
    "Conceptual representation of a frequency drive outside the CFW100 model.",
  );
  assert.equal(
    drive.functionDescription,
    "Allows study of the VFD role in torque, speed, and acceleration ramp control.",
  );
  assert.equal(
    drive.operatingPrinciple,
    "Uses power electronics to convert fixed energy into output controlled by frequency and voltage.",
  );
  assert.equal(
    drive.typicalApplications[0],
    "Didactic comparison between drive families.",
  );
  assert.deepEqual(drive.mainData[0], {
    label: "Control variable",
    value: "Output frequency",
    unit: "Hz",
  });
  assert.deepEqual(drive.visualStates[2], {
    name: "Operating",
    description: "Motor receiving controlled frequency.",
  });
  assert.equal(drive.chartTitle, "Conceptual speed profile");
  assert.equal(
    drive.chartDescription,
    "Didactic speed reference curve applied by a VFD.",
  );
  assert.deepEqual(drive.tags, ["VFD", "control", "speed"]);
  assert.equal(
    drive.limitations[1],
    "There are no interactive parameters or dedicated screen for other drives.",
  );

  assert.equal(pushButton.shortName, "Push button");
  assert.equal(pushButton.tags[0], "pushbutton");
});

test("helper preserva PT-BR como base segura e faz fallback quando nao existe traducao", () => {
  const baseComponent = SIMULATABLE_COMPONENTS.find(
    (component) => component.id === "contactor",
  );
  const ptComponent = localizeComponent(baseComponent, "pt-BR");
  const unknownComponent = {
    id: "custom-component",
    name: "Nome base",
    shortName: "Curto",
    description: "Descricao base",
    functionDescription: "Funcao base",
    operatingPrinciple: "Principio base",
    typicalApplications: ["Aplicacao base"],
    mainData: [{ label: "Campo", value: "Valor", unit: "" }],
    visualStates: [{ name: "Estado", description: "Descricao" }],
    chartTitle: "Grafico base",
    chartDescription: "Descricao do grafico",
    chartData: [{ label: "0 s", value: 0 }],
    tags: ["tag-base"],
    limitations: ["Limitacao base"],
  };

  assert.equal(ptComponent.description, baseComponent.description);
  assert.deepEqual(localizeComponent(unknownComponent, "en-US"), unknownComponent);
});

test("helper localizado nao deixa campos exibidos como objeto bruto", () => {
  const [localized] = localizeComponentList(
    [SIMULATABLE_COMPONENTS.find((component) => component.id === "cfw100")],
    "en-US",
  );

  assert.equal(typeof localized.name, "string");
  assert.equal(typeof localized.description, "string");
  assert.equal(typeof localized.mainData[0].label, "string");
  assert.equal(typeof localized.mainData[2].value, "string");
  assert.equal(typeof localized.visualStates[0].name, "string");
  assert.equal(typeof localized.visualStates[0].description, "string");
  assert.equal(String(localized.mainData[0].label), "Typical input voltage");
});

test("gatilho e painel da biblioteca expoem semantica acessivel de dialogo", () => {
  const triggerSource = readSource(
    "src/components/component-library/ComponentLibraryTrigger.jsx",
  );
  const panelSource = readSource(
    "src/components/component-library/ComponentLibraryPanel.jsx",
  );

  assert.match(triggerSource, /aria-haspopup="dialog"/);
  assert.match(triggerSource, /aria-expanded=\{open\}/);
  assert.match(triggerSource, /aria-controls=\{dialogId\}/);

  assert.match(panelSource, /role="dialog"/);
  assert.match(panelSource, /aria-modal="true"/);
  assert.match(panelSource, /aria-labelledby=\{titleId\}/);
  assert.match(panelSource, /aria-describedby=\{descriptionId\}/);
  assert.match(panelSource, /isEscapeDismissKey/);
  assert.match(panelSource, /trapFocusWithin/);
  assert.match(panelSource, /scheduleFocus\(closeButtonRef\)/);
  assert.match(panelSource, /getWrappedFocusIndex/);
  assert.match(panelSource, /getResponsivePanelWidth\(960\)/);
  assert.match(panelSource, /getResponsivePanelMaxHeight\(720\)/);
  assert.match(triggerSource, /role="status"/);
  assert.match(triggerSource, /aria-live="polite"/);
  assert.match(triggerSource, /aria-busy="true"/);
});

test("item selecionavel usa estado atual e painel de detalhes deixa clara a indisponibilidade", () => {
  const itemSource = readSource(
    "src/components/component-library/ComponentLibraryItem.jsx",
  );
  const detailsSource = readSource(
    "src/components/component-library/ComponentDetailsPanel.jsx",
  );
  const labelsSource = readSource(
    "src/components/component-library/componentLibraryLabels.js",
  );

  assert.match(itemSource, /className="component-library-item"/);
  assert.match(itemSource, /className="component-library-status"/);
  assert.match(itemSource, /data-component-select="true"/);
  assert.match(itemSource, /aria-current=\{selected \? "true" : undefined\}/);
  assert.match(detailsSource, /getComponentAvailabilityNote/);
  assert.match(labelsSource, /Este componente ainda nao possui simulacao interativa/);
  assert.match(detailsSource, /aria-disabled="true"/);
});

test("mini grafico didatico expoe role img com descricao acessivel", () => {
  const chartSource = readSource(
    "src/components/component-library/ComponentMiniChart.jsx",
  );

  assert.match(chartSource, /role="img"/);
  assert.match(chartSource, /aria-label=\{`\$\{title\}\. \$\{description\}`\}/);
  assert.match(chartSource, /<svg/);
});

test("integracao no topo reaproveita HeaderMenu sem embutir o catalogo nele", () => {
  const appSource = readSource("src/App.jsx");
  const headerSource = readSource("src/components/HeaderMenu.jsx");
  const triggerSource = readSource(
    "src/components/component-library/ComponentLibraryTrigger.jsx",
  );
  const panelSource = readSource(
    "src/components/component-library/ComponentLibraryPanel.jsx",
  );
  const localizationSource = readSource(
    "src/data/componentLibraryTranslations.js",
  );

  assert.match(appSource, /ComponentLibraryTrigger/);
  assert.match(appSource, /activeComponentId="cfw100"/);
  assert.doesNotMatch(appSource, /ComponentLibraryPanel/);
  assert.doesNotMatch(appSource, /SIMULATABLE_COMPONENTS/);
  assert.doesNotMatch(appSource, /componentLibraryTranslations/);
  assert.match(headerSource, /\{children\}/);
  assert.doesNotMatch(headerSource, /SIMULATABLE_COMPONENTS/);
  assert.doesNotMatch(headerSource, /ComponentLibraryPanel/);
  assert.doesNotMatch(headerSource, /componentLibraryTranslations/);
  assert.match(
    triggerSource,
    /lazy\(\(\) =>\s*import\("\.\/ComponentLibraryPanel\.jsx"\)/,
  );
  assert.match(triggerSource, /<Suspense/);
  assert.doesNotMatch(triggerSource, /import ComponentLibraryPanel from/);
  assert.doesNotMatch(triggerSource, /SIMULATABLE_COMPONENTS/);
  assert.doesNotMatch(triggerSource, /componentLibraryTranslations/);
  assert.match(panelSource, /SIMULATABLE_COMPONENTS/);
  assert.match(panelSource, /localizeComponentList/);
  assert.match(localizationSource, /COMPONENT_LIBRARY_TRANSLATIONS =/);
});

test("componentes planejados, documentais e visuais nao sao tratados como disponiveis", () => {
  const unavailable = SIMULATABLE_COMPONENTS.filter(
    (component) => component.status !== "available",
  );

  assert.equal(unavailable.length > 0, true);
  assert.equal(
    unavailable.every((component) => component.simulationMode !== "full"),
    true,
  );
});
