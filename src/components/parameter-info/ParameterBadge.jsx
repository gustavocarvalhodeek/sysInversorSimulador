import React from "react";

const TONES = {
  success: { bg: "#e7f6ee", fg: "#1f7a4d", border: "#bfe6d0" },
  neutral: { bg: "#eef1f6", fg: "#5b6473", border: "#d8dee9" },
  warning: { bg: "#fdf0d8", fg: "#8a5a00", border: "#f0d9a8" },
  danger: { bg: "#fbe7e7", fg: "#9b2c2c", border: "#f0c4c4" },
  info: { bg: "#e8eef9", fg: "#27406b", border: "#c9d6ef" },
};

export default function ParameterBadge({ label, tone = "neutral" }) {
  const palette = TONES[tone] ?? TONES.neutral;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: "999px",
        color: palette.fg,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
