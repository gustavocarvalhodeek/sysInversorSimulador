import React from "react";
import {
  getStatusMessageListKey,
  translateStatusMessage,
} from "./commandStatusMessages.js";
import { useI18n } from "../i18n/useI18n.js";
import { resolveCommand } from "../simulation/commandResolver.js";
import { selectRamp } from "../simulation/rampSelector.js";

function Cell({ label, value, simulated }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6b7487", marginBottom: "2px" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: simulated ? "#26324a" : "#9b6a00",
        }}
      >
        {value}
        {simulated ? "" : " *"}
      </div>
    </div>
  );
}

function translateLabel(source, t) {
  return source?.labelKey ? t(source.labelKey) : source?.label ?? "";
}

export default function CommandStatusBar({ hmiState }) {
  const { t } = useI18n();
  const command = resolveCommand(hmiState);
  const ramp = selectRamp(hmiState);
  const notes = [...command.status, ...ramp.notes];
  const rampBaseLabel = ramp.labelKey ? t(ramp.labelKey) : ramp.label;
  const rampLabel = `${rampBaseLabel}${ramp.sShape ? " + S" : ""}`;
  const modeLabel = command.mode === "LOCAL"
    ? t("parameterInfo.commandStatus.modeLocal")
    : t("parameterInfo.commandStatus.modeRemote");

  return (
    <div
      style={{
        border: "1px solid #dce3ef",
        borderRadius: "12px",
        background: "#f6f8fc",
        padding: "12px 14px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "10px",
        }}
      >
        <Cell label={t("parameterInfo.commandStatus.mode")} value={modeLabel} simulated />
        <Cell
          label={t("parameterInfo.commandStatus.reference")}
          value={translateLabel(command.referenceSource, t)}
          simulated={command.referenceSource.simulated}
        />
        <Cell
          label={t("parameterInfo.commandStatus.command")}
          value={translateLabel(command.commandSource, t)}
          simulated={command.commandSource.simulated}
        />
        <Cell
          label={t("parameterInfo.commandStatus.jog")}
          value={
            command.jogActive
              ? t("parameterInfo.commandStatus.jogActive", {
                  label: translateLabel(command.jogSource, t),
                })
              : translateLabel(command.jogSource, t)
          }
          simulated={command.jogSource.simulated}
        />
        <Cell
          label={t("parameterInfo.commandStatus.direction")}
          value={translateLabel(command.rotation, t)}
          simulated={command.rotation.simulated}
        />
        <Cell label={t("parameterInfo.commandStatus.ramp")} value={rampLabel} simulated />
      </div>
      {notes.length > 0 ? (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: "18px",
            color: "#9b6a00",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {notes.map((note, index) => {
            const translatedNote = translateStatusMessage(note, t);

            return translatedNote ? (
              <li key={getStatusMessageListKey(note, index)}>{translatedNote}</li>
            ) : null;
          })}
        </ul>
      ) : null}
    </div>
  );
}
