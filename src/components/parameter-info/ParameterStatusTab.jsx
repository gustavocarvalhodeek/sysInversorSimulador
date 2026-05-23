import React from "react";
import CommandStatusBar from "../CommandStatusBar.jsx";
import ExternalSourcesPanel from "../ExternalSourcesPanel.jsx";

export default function ParameterStatusTab({ hmiState, dispatch }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <CommandStatusBar hmiState={hmiState} />
      <ExternalSourcesPanel hmiState={hmiState} dispatch={dispatch} />
    </div>
  );
}
