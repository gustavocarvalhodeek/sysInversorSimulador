import React from "react";
import { useI18n } from "../../i18n/useI18n.js";

export default function MotorEventLog({ logs }) {
  const { t } = useI18n();

  const formatLogMessage = (log) => {
    switch (log.type) {
      case "parameterChanged":
        return t("motorPanel.logParameterChanged", {
          code: log.parameterCode,
          value: log.nextValue,
        });
      case "motorStarted":
        return t("motorPanel.logMotorStarted");
      case "motorStopped":
        return t("motorPanel.logMotorStopped");
      default:
        return log.msg ?? "";
    }
  };

  return (
    <div
      style={{
        padding: "14px 12px 10px",
        flex: 1,
        minHeight: 200,
        maxHeight: 350,
        overflowY: "auto",
        borderRadius: 16,
        background: "#f7f9fc",
        border: "1px solid #e3e9f3",
      }}
    >
      <strong
        style={{
          fontSize: 13,
          color: "#1b2740",
          display: "block",
          marginBottom: 12,
        }}
      >
        {t("motorPanel.eventLogTitle")}
      </strong>
      {logs.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {t("motorPanel.noEvents")}
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {logs.map((log, index) => (
            <li
              key={index}
              style={{
                fontSize: 12,
                color: "#475569",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 6,
              }}
            >
              <span style={{ color: "#94a3b8", marginRight: 8 }}>
                {log.time.toLocaleTimeString()}
              </span>
              {formatLogMessage(log)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
