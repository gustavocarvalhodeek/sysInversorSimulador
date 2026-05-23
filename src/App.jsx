import React, { useReducer } from "react";
import {
  createInitialHmiState,
  getDisplayModel,
  getSelectedParameterInfo,
  hmiReducer,
} from "./hmi/cfw100Hmi.js";
import InverterBody from "./components/InverterBody.jsx";
import ParameterInfoPanel from "./components/ParameterInfoPanel.jsx";
import MotorSimulationPanel from "./components/MotorSimulationPanel.jsx";
import HeaderMenu from "./components/HeaderMenu.jsx";
import LanguageSelector from "./components/LanguageSelector.jsx";
import ComponentLibraryTrigger from "./components/component-library/ComponentLibraryTrigger.jsx";
import { useDriveSimulationRuntime } from "./hooks/useDriveSimulationRuntime.js";
import { useAutomationCycle } from "./hooks/useAutomationCycle.js";

export default function App() {
  const [hmiState, dispatch] = useReducer(
    hmiReducer,
    undefined,
    createInitialHmiState,
  );

  const display = getDisplayModel(hmiState);
  const selectedParameter = getSelectedParameterInfo(hmiState);

  useDriveSimulationRuntime(hmiState, dispatch);
  useAutomationCycle(hmiState, dispatch);

  const handleSelectParameter = (code) => {
    dispatch({ type: "SELECT_PARAMETER", code });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        isolation: "isolate",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <img
        src="/white-background.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          width: "100vw",
          height: "100vh",
          objectFit: "fill",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      <HeaderMenu hmiState={hmiState} dispatch={dispatch}>
        <>
          <ComponentLibraryTrigger activeComponentId="cfw100" />
          <LanguageSelector />
        </>
      </HeaderMenu>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "clamp(24px, 5vw, 56px)",
          width: "100%",
          flexWrap: "wrap",
          padding: "28px 18px",
          boxSizing: "border-box",
          flex: 1,
        }}
      >
        <InverterBody display={display} hmiState={hmiState} dispatch={dispatch} />
        <ParameterInfoPanel
          parameter={selectedParameter}
          hmiState={hmiState}
          onSelectParameter={handleSelectParameter}
          dispatch={dispatch}
        />
        <MotorSimulationPanel hmiState={hmiState} />
      </div>
    </div>
  );
}
