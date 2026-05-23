import React from "react";

export default function MotorMetric({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6b7487", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#26324a" }}>
        {value}
        {unit ? <span style={{ fontSize: 12 }}> {unit}</span> : null}
      </div>
    </div>
  );
}
