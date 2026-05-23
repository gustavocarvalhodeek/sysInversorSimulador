import React from "react";

function Blink({ active, children }) {
  return active ? (
    <span style={{ animation: "cfw100-blink 1s steps(1, end) infinite" }}>
      {children}
    </span>
  ) : (
    children
  );
}

// Visor funcional da HMI: mostrador principal, unidade, estado, sentido e barra.
export default function Display({
  value,
  unit,
  status,
  direction,
  barPercent,
  blinkValue,
  blinkUnit,
}) {
  const hasUnit = Boolean(unit);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily: "'DSEG7 Classic Mini', 'Courier New', monospace",
        fontWeight: "normal",
        fontStyle: "italic", // LCD fonts are usually italic
        lineHeight: 1,
      }}
    >
      <style>
        {`
          @keyframes cfw100-blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}
      </style>

      <div
        style={{
          position: "absolute",
          inset: "4% 5% auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "clamp(7px, 0.9vw, 11px)",
          letterSpacing: "0.08em",
        }}
      >
        <span>{status}</span>
        <span>{direction}</span>
      </div>

      <div
        style={{
          position: "absolute",
          inset: "0 0 18%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: hasUnit ? "0.22em" : 0,
          fontSize: "clamp(24px, 4.4vw, 54px)",
          letterSpacing: hasUnit ? "0.14em" : "0.08em",
          transform: "translateY(4%)",
        }}
      >
        <Blink active={blinkValue}>
          <span>{value}</span>
        </Blink>
        {hasUnit ? (
          <Blink active={blinkUnit}>
            <span
              style={{
                fontSize: "clamp(10px, 1.2vw, 16px)",
                letterSpacing: "0.08em",
                alignSelf: "flex-start",
                marginTop: "2%",
              }}
            >
              {unit}
            </span>
          </Blink>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: "7%",
          right: "7%",
          bottom: "8%",
          height: "10%",
          border: "1px solid rgba(79, 87, 72, 0.42)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barPercent}%`,
            height: "100%",
            background: "rgba(79, 87, 72, 0.55)",
          }}
        />
      </div>
    </div>
  );
}
