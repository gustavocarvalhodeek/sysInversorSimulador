export const COMPONENT_STATUS_LABELS = {
  available: "Disponivel",
  partial: "Simulacao parcial",
  planned: "Planejado",
  experimental: "Experimental",
  documentationOnly: "Apenas documental",
  visualOnly: "Apenas visual",
  undefined: "Status indefinido",
};

export const COMPONENT_SIMULATION_MODE_LABELS = {
  full: "Simulacao completa",
  partial: "Simulacao parcial",
  visualOnly: "Visual apenas",
  planned: "Planejado",
  documentationOnly: "Documental",
  undefined: "Modo nao catalogado",
};

function translateOrFallback(t, key, fallback) {
  if (typeof t !== "function") {
    return fallback;
  }

  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function getComponentStatusLabel(status, t = null) {
  const fallback = COMPONENT_STATUS_LABELS[status] ?? COMPONENT_STATUS_LABELS.undefined;
  return translateOrFallback(t, `componentLibrary.status.${status ?? "undefined"}`, fallback);
}

export function getComponentSimulationModeLabel(simulationMode, t = null) {
  const fallback =
    COMPONENT_SIMULATION_MODE_LABELS[simulationMode] ??
    COMPONENT_SIMULATION_MODE_LABELS.undefined;
  return translateOrFallback(
    t,
    `componentLibrary.simulationMode.${simulationMode ?? "undefined"}`,
    fallback,
  );
}

export function getComponentActionLabel(component, { isCurrent = false, t = null } = {}) {
  if (component?.status === "available") {
    return translateOrFallback(
      t,
      `componentLibrary.action.${isCurrent ? "current" : "open"}`,
      isCurrent ? "Simulador atual" : "Abrir",
    );
  }

  switch (component?.status) {
    case "partial":
      return translateOrFallback(t, "componentLibrary.action.partial", "Parcial");
    case "planned":
      return translateOrFallback(t, "componentLibrary.action.planned", "Em breve");
    case "experimental":
      return translateOrFallback(
        t,
        "componentLibrary.action.experimental",
        "Experimental",
      );
    case "documentationOnly":
      return translateOrFallback(
        t,
        "componentLibrary.action.documental",
        "Documental",
      );
    case "visualOnly":
      return translateOrFallback(t, "componentLibrary.action.visual", "Visual");
    default:
      return translateOrFallback(
        t,
        "componentLibrary.action.unavailable",
        "Indisponivel",
      );
  }
}

export function getComponentAvailabilityNote(component, { isCurrent = false, t = null } = {}) {
  if (component?.status === "available" && isCurrent) {
    return translateOrFallback(
      t,
      "componentLibrary.availabilityNote.currentAvailable",
      "Este e o simulador atual do projeto, com interacao completa fora da biblioteca.",
    );
  }

  switch (component?.status) {
    case "partial":
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.partial",
        "Este componente possui apenas visualizacao parcial ou conceitual nesta fase.",
      );
    case "visualOnly":
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.visualOnly",
        "Este componente apresenta apenas visualizacao didatica de estados e comportamento.",
      );
    case "documentationOnly":
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.documentationOnly",
        "Este componente aparece como referencia documental e visual, sem simulacao interativa.",
      );
    case "planned":
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.planned",
        "Este componente ainda nao possui simulacao interativa.",
      );
    case "experimental":
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.experimental",
        "Este componente esta em estado experimental e pode mudar nas proximas iteracoes.",
      );
    default:
      return translateOrFallback(
        t,
        "componentLibrary.availabilityNote.undefined",
        "Estado de disponibilidade nao definido.",
      );
  }
}
