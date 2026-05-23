import React from "react";
import fanBladesImg from "../../assets/fan_blades.png";
import { useI18n } from "../../i18n/useI18n.js";
import MotorMetric from "./MotorMetric.jsx";
import { MOTOR_IDLE_IMAGE } from "./motorSimulationConstants.js";

export default function MotorVisualPanel({ isRunning, motor, outputFrequency }) {
  const { t } = useI18n();
  return (
    <>
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#6b7487",
          marginBottom: 8,
        }}
      >
        {t("motorPanel.title")}
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>
        {isRunning ? t("motorPanel.running") : t("motorPanel.stopped")}
      </div>

      <style>
        {`
          @keyframes cfw100-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          minHeight: 280,
          display: "grid",
          placeItems: "center",
          position: "relative",
          marginBottom: 18,
          borderRadius: 16,
          background: "#f7f9fc",
          overflow: "hidden",
        }}
      >
        <img
          src={MOTOR_IDLE_IMAGE}
          alt={t("parameterInfo.motorTitle")}
          style={{
            display: "block",
            width: "100%",
            maxWidth: 280,
            height: "auto",
            objectFit: "contain",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "56%",
            left: "47%",
            transform: "translate(-50%, -50%)",
            width: 112,
            height: 112,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={fanBladesImg}
            alt={t("motorPanel.fanAlt")}
            style={{
              width: 110,
              height: 110,
              objectFit: "contain",
              mixBlendMode: "multiply",
              animation:
                Math.abs(motor.rpm) > 1
                  ? `cfw100-spin ${Math.max(0.05, 60 / Math.abs(motor.rpm))}s linear infinite`
                  : "none",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        <MotorMetric
          label={t("motorPanel.frequencyLabel")}
          value={Number(outputFrequency).toFixed(1)}
          unit="Hz"
        />
        <MotorMetric
          label={t("motorPanel.rotationLabel")}
          value={Number(motor.rpm).toFixed(0)}
          unit="rpm"
        />
      </div>
    </>
  );
}
