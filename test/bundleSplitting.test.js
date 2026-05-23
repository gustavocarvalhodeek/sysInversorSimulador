import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("abas opcionais do painel de parametros usam lazy loading", () => {
  const panelSource = readSource("src/components/ParameterInfoPanel.jsx");
  const statusTabSource = readSource(
    "src/components/parameter-info/ParameterStatusTab.jsx",
  );

  assert.match(panelSource, /import React, \{ Suspense, lazy,/);
  assert.match(
    panelSource,
    /lazy\(\(\) =>\s*import\("\.\/parameter-info\/ParameterStatusTab\.jsx"\)/,
  );
  assert.match(
    panelSource,
    /lazy\(\(\) =>\s*import\("\.\/parameter-info\/ParameterTechnicalTab\.jsx"\)/,
  );
  assert.match(
    panelSource,
    /lazy\(\(\) =>\s*import\("\.\/parameter-info\/ParameterSimulationTab\.jsx"\)/,
  );
  assert.doesNotMatch(panelSource, /import CommandStatusBar from/);
  assert.doesNotMatch(panelSource, /import ExternalSourcesPanel from/);
  assert.doesNotMatch(panelSource, /import ParameterTechnicalTab from/);
  assert.doesNotMatch(panelSource, /import ParameterSimulationTab from/);
  assert.match(statusTabSource, /import CommandStatusBar from/);
  assert.match(statusTabSource, /import ExternalSourcesPanel from/);
});

test("quick list de parametros e carregada sob demanda com fallback acessivel", () => {
  const panelSource = readSource("src/components/ParameterInfoPanel.jsx");

  assert.match(
    panelSource,
    /lazy\(\(\) =>\s*import\("\.\/parameter-info\/ParameterQuickList\.jsx"\)/,
  );
  assert.doesNotMatch(panelSource, /import ParameterQuickList from/);
  assert.match(panelSource, /quickListOpen \? \(/);
  assert.match(panelSource, /<Suspense/);
  assert.match(panelSource, /role="status"/);
  assert.match(panelSource, /aria-live="polite"/);
  assert.match(panelSource, /aria-busy="true"/);
});

test("vite separa React em chunk de vendor cacheavel", () => {
  const viteConfigSource = readSource("vite.config.js");

  assert.match(viteConfigSource, /rolldownOptions/);
  assert.match(viteConfigSource, /codeSplitting/);
  assert.match(viteConfigSource, /react-vendor/);
  assert.match(viteConfigSource, /react\|react-dom/);
  assert.doesNotMatch(viteConfigSource, /advancedChunks/);
});
