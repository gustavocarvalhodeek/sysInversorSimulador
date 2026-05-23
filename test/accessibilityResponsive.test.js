import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getResponsivePanelMaxHeight,
  getResponsivePanelWidth,
  getWrappedFocusIndex,
  isEscapeDismissKey,
} from "../src/components/accessibilityHelpers.js";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("helpers de acessibilidade tratam Escape e larguras responsivas", () => {
  assert.equal(isEscapeDismissKey("Escape"), true);
  assert.equal(isEscapeDismissKey("Enter"), false);
  assert.equal(getResponsivePanelWidth(520), "min(520px, calc(100vw - 32px))");
  assert.equal(getResponsivePanelMaxHeight(480), "min(480px, calc(100vh - 48px))");
  assert.equal(getWrappedFocusIndex(0, 1, 3), 1);
  assert.equal(getWrappedFocusIndex(2, 1, 3), 0);
  assert.equal(getWrappedFocusIndex(0, -1, 3), 2);
  assert.equal(getWrappedFocusIndex(-1, 1, 3), 0);
});

test("InverterBody expoe botoes da HMI com button, rotulos e foco visivel", () => {
  const source = readSource("src/components/InverterBody.jsx");

  assert.match(source, /role="group"/);
  assert.match(source, /useI18n/);
  assert.match(source, /getHmiControlAriaLabel/);
  assert.match(source, /className="app-focus-ring hmi-button"/);
  assert.match(source, /aria-label=\{getHmiControlAriaLabel\("menu", t\)\}/);
  assert.match(source, /aria-label=\{getHmiControlAriaLabel\("down", t\)\}/);
  assert.match(source, /aria-label=\{getHmiControlAriaLabel\("up", t\)\}/);
  assert.match(source, /aria-label=\{getHmiControlAriaLabel\("run", t\)\}/);
  assert.match(source, /aria-label=\{getHmiControlAriaLabel\("stop", t\)\}/);
  assert.equal((source.match(/type="button"/g) ?? []).length >= 5, true);
});

test("HeaderMenu combina hover com clique e preserva menu acessivel com submenu lateral", () => {
  const source = readSource("src/components/HeaderMenu.jsx");

  assert.match(source, /useI18n/);
  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /aria-expanded=\{menuOpen\}/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitem"/);
  assert.match(source, /onMouseEnter=\{handleMenuAreaMouseEnter\}/);
  assert.match(source, /onMouseLeave=\{handleMenuAreaMouseLeave\}/);
  assert.match(source, /aria-expanded=\{configMenuOpen\}/);
  assert.match(source, /aria-controls=\{scenarioGroupId\}/);
  assert.match(source, /menu\.submenuAriaLabel/);
  assert.match(source, /submenuLayout\.placement === "side"/);
  assert.match(source, /marginTop: submenuLayout\.placement === "side"/);
  assert.match(source, /ArrowDown/);
  assert.match(source, /ArrowUp/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /Home/);
  assert.match(source, /End/);
  assert.match(source, /isEscapeDismissKey/);
  assert.match(source, /getWrappedFocusIndex/);
  assert.match(source, /pointerdown/);
});

test("FaultSimulator usa dialogo responsivo com Escape e sem minWidth fixo", () => {
  const source = readSource("src/components/FaultSimulator.jsx");

  assert.match(source, /useI18n/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=\{dialogTitleId\}/);
  assert.match(source, /faultSimulator\.closeAriaLabel/);
  assert.match(source, /getResponsivePanelWidth\(520\)/);
  assert.match(source, /getResponsivePanelMaxHeight\(480\)/);
  assert.match(source, /isEscapeDismissKey/);
  assert.match(source, /trapFocusWithin/);
  assert.doesNotMatch(source, /minWidth:\s*"5(00|20)px"/);
});

test("CSS global define foco visivel e previne overflow horizontal evidente", () => {
  const css = readSource("src/index.css");

  assert.match(css, /button:focus-visible/);
  assert.match(css, /\.app-focus-ring:focus-visible/);
  assert.match(css, /\.hmi-button:focus-visible/);
  assert.match(css, /overflow-x:\s*hidden/);
});

test("ParameterQuickList usa dialogo nomeado com Escape, foco inicial e retorno ao gatilho", () => {
  const source = readSource("src/components/parameter-info/ParameterQuickList.jsx");

  assert.match(source, /useI18n/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-labelledby=\{dialogTitleId\}/);
  assert.match(source, /triggerRef/);
  assert.match(source, /isEscapeDismissKey/);
  assert.match(source, /trapFocusWithin/);
  assert.match(source, /scheduleFocus\(closeButtonRef\)/);
  assert.match(source, /scheduleFocus\(returnFocusRef\)/);
  assert.match(source, /parameterInfo\.quickListTitle/);
});

test("ParameterTabs e ParameterInfoPanel completam a semantica basica de tabs", () => {
  const tabsSource = readSource("src/components/parameter-info/ParameterTabs.jsx");
  const panelSource = readSource("src/components/ParameterInfoPanel.jsx");

  assert.match(tabsSource, /role="tablist"/);
  assert.match(tabsSource, /aria-controls=\{getPanelId\(tab.id\)\}/);
  assert.match(tabsSource, /tabIndex=\{isActive \? 0 : -1\}/);
  assert.match(tabsSource, /ArrowRight/);
  assert.match(tabsSource, /ArrowLeft/);
  assert.match(tabsSource, /Home/);
  assert.match(tabsSource, /End/);
  assert.match(panelSource, /useI18n/);
  assert.match(panelSource, /role="tabpanel"/);
  assert.match(panelSource, /aria-labelledby=\{getTabId\(activeTab\)\}/);
  assert.match(panelSource, /parameterInfo\.tabsAriaLabel/);
});

test("ParameterSearch expoe label persistente e resultados com semantica de lista", () => {
  const source = readSource("src/components/parameter-info/ParameterSearch.jsx");

  assert.match(source, /useI18n/);
  assert.match(source, /label htmlFor=\{searchInputId\}/);
  assert.match(source, /aria-describedby=\{searchHintId\}/);
  assert.match(source, /role="list"/);
  assert.match(source, /parameterInfo\.searchResultsAria/);
  assert.match(source, /parameterInfo\.selectParameterAria/);
  assert.doesNotMatch(source, /role="combobox"/);
});

test("MotorChart e MotorChartPanel expoem descricao textual e estado dos toggles", () => {
  const chartSource = readSource("src/components/motor-simulation/MotorChart.jsx");
  const panelSource = readSource("src/components/motor-simulation/MotorChartPanel.jsx");

  assert.match(chartSource, /useI18n/);
  assert.match(chartSource, /role="img"/);
  assert.match(chartSource, /aria-describedby=\{chartSummaryId\}/);
  assert.match(chartSource, /motorPanel\.historySummary/);
  assert.match(panelSource, /aria-pressed=\{paused\}/);
  assert.match(panelSource, /aria-pressed=\{enabled\}/);
});
