import React, { useId, useRef, useState } from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { SERIES } from "./motorSimulationConstants.js";

const VISUALLY_HIDDEN_STYLE = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function formatAccessibleValue(value, digits, unit, t) {
  if (!Number.isFinite(value)) {
    return t("motorPanel.unavailableValue", { unit });
  }
  return `${value.toFixed(digits)} ${unit}`;
}

function xTickIntervalMs(windowMs) {
  if (windowMs <= 15_000) return 5_000;
  if (windowMs <= 30_000) return 10_000;
  if (windowMs <= 60_000) return 20_000;
  return 60_000;
}

export default function MotorChart({
  displaySamples,
  faultEvents,
  windowMs,
  activeSeries,
  hmiState,
}) {
  const { t } = useI18n();
  const W = 292;
  const H = 210;
  const pad = { top: 22, right: 42, bottom: 38, left: 48 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const svgRef = useRef(null);
  const [cursorX, setCursorX] = useState(null);
  const chartSummaryId = useId();

  const getSeriesLabel = (key, fallbackLabel) =>
    t(`motorPanel.series.${key}`) === `motorPanel.series.${key}`
      ? fallbackLabel
      : t(`motorPanel.series.${key}`);

  const lastSample = displaySamples.at(-1);
  const now = lastSample?.time ?? Date.now();
  const startTime = now - windowMs;
  const visible = displaySamples.filter((sample) => sample.time >= startTime);

  const ranges = {};
  SERIES.forEach(({ key, floor }) => {
    const values = visible.map((sample) => sample[key]).filter(Number.isFinite);
    ranges[key] = Math.max(values.length ? Math.max(...values) : 0, floor);
  });

  const xFor = (time) => pad.left + ((time - startTime) / windowMs) * plotW;
  const yFor = (value, key) => {
    const ratio = Math.min(Math.abs(value ?? 0) / Math.max(ranges[key], 0.001), 1);
    return pad.top + plotH * (1 - ratio);
  };

  const handleMouseMove = (event) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaledX = (event.clientX - rect.left) * (W / rect.width);
    setCursorX(scaledX >= pad.left && scaledX <= W - pad.right ? scaledX : null);
  };

  let closest = null;
  if (cursorX !== null && visible.length > 0) {
    const time = startTime + ((cursorX - pad.left) / plotW) * windowMs;
    closest = visible.reduce((best, sample) =>
      Math.abs(sample.time - time) < Math.abs(best.time - time) ? sample : best,
    );
  }

  const p135 = hmiState?.parameters?.P135?.value;
  const TRIP_TEMP = 85;

  const buildPath = (key) => {
    const pts = visible
      .filter((sample) => Number.isFinite(sample[key]))
      .map((sample) => [xFor(sample.time), yFor(sample[key], key)]);

    if (pts.length < 2) return null;
    if (pts.length === 2) {
      return `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} L ${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
    }

    // Catmull-Rom → cubic Bézier: cada segmento usa os dois pontos vizinhos
    // como âncoras das tangentes, produzindo curvas C1 contínuas sem overshoot.
    const T = 0.35;
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[Math.max(0, i - 1)];
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const [x3, y3] = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = x1 + (x2 - x0) * T;
      const cp1y = y1 + (y2 - y0) * T;
      const cp2x = x2 - (x3 - x1) * T;
      const cp2y = y2 - (y3 - y1) * T;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
    }
    return d;
  };

  const buildAreaPath = (key) => {
    const pts = visible
      .filter((sample) => Number.isFinite(sample[key]))
      .map((sample) => [xFor(sample.time), yFor(sample[key], key)]);
    if (pts.length < 2) return null;
    const linePath = buildPath(key);
    if (!linePath) return null;
    const bottom = (pad.top + plotH).toFixed(1);
    return `${linePath} L ${pts[pts.length - 1][0].toFixed(1)},${bottom} L ${pts[0][0].toFixed(1)},${bottom} Z`;
  };

  const rpmActive = activeSeries.has("rpm");
  const currentActive = activeSeries.has("current");

  // Rótulos do eixo Y: 5 níveis (100%, 75%, 50%, 25%, 0%)
  const yRatios = [0, 0.25, 0.5, 0.75, 1];

  // Ticks intermediários no eixo X
  const intervalMs = xTickIntervalMs(windowMs);
  const xTicks = [];
  for (let offset = intervalMs; offset < windowMs; offset += intervalMs) {
    const label =
      offset >= 60_000 ? `-${offset / 60_000}min` : `-${offset / 1_000}s`;
    xTicks.push({ x: xFor(now - offset), label });
  }

  // Linhas de grade: 0%, 25%, 50%, 75%, 100%
  const gridRatios = [0, 0.25, 0.5, 0.75, 1];

  const currentFrequency = Math.abs(hmiState?.outputFrequency ?? lastSample?.frequency ?? 0);
  const currentCurrent = lastSample?.current ?? hmiState?.motorState?.current;
  const currentTemperature = hmiState?.moduleTemperature ?? lastSample?.temperature;
  const currentIxt = hmiState?.ixtPercent ?? lastSample?.ixtPercent;
  const faultSummary =
    hmiState?.faultCode !== null && hmiState?.faultCode !== undefined
      ? t("motorPanel.activeFault", { code: String(hmiState.faultCode).padStart(3, "0") })
      : t("motorPanel.noActiveFault");
  const accessibleSummary = t("motorPanel.historySummary", {
    frequency: formatAccessibleValue(currentFrequency, 1, "Hz", t),
    current: formatAccessibleValue(currentCurrent, 1, "A", t),
    temperature: formatAccessibleValue(currentTemperature, 1, t("common.unitCelsius"), t),
    ixt: formatAccessibleValue(currentIxt, 0, t("common.unitPercent"), t),
    faultSummary,
  });

  return (
    <div style={{ position: "relative", marginTop: 16 }}>
      <p id={chartSummaryId} style={VISUALLY_HIDDEN_STYLE}>
        {accessibleSummary}
      </p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", height: "auto", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorX(null)}
        role="img"
        aria-label={t("motorPanel.chartAriaLabel")}
        aria-describedby={chartSummaryId}
      >
        <defs>
          {SERIES.filter((s) => activeSeries.has(s.key)).map(({ key, color }) => (
            <linearGradient key={key} id={`${chartSummaryId}-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        <rect x={0} y={0} width={W} height={H} rx={10} fill="#ffffff" />

        {/* Linhas de grade horizontais */}
        {gridRatios.map((ratio) => {
          const y = pad.top + plotH * ratio;
          const isBorder = ratio === 0 || ratio === 1;
          const isMid = ratio === 0.5;
          return (
            <line
              key={ratio}
              x1={pad.left}
              x2={W - pad.right}
              y1={y}
              y2={y}
              stroke={isBorder ? "#b8c4d8" : isMid ? "#d4dae8" : "#ecf0f7"}
              strokeWidth={isBorder || isMid ? 1 : 0.6}
              strokeDasharray={!isBorder ? "4,3" : ""}
            />
          );
        })}

        {/* Borda esquerda */}
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={H - pad.bottom} stroke="#b8c4d8" />
        {/* Borda direita */}
        <line x1={W - pad.right} x2={W - pad.right} y1={pad.top} y2={H - pad.bottom} stroke="#b8c4d8" />
        {/* Eixo X */}
        <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="#b8c4d8" />

        {/* Ticks do eixo Y (esquerdo e direito) */}
        {gridRatios.map((ratio) => {
          const y = pad.top + plotH * ratio;
          return (
            <g key={ratio}>
              <line x1={pad.left - 4} x2={pad.left} y1={y} y2={y} stroke="#b8c4d8" strokeWidth={1} />
              <line x1={W - pad.right} x2={W - pad.right + 4} y1={y} y2={y} stroke="#b8c4d8" strokeWidth={1} />
            </g>
          );
        })}

        {/* Ticks intermediários no eixo X */}
        {xTicks.map(({ x, label }) => (
          <g key={label}>
            <line x1={x} x2={x} y1={H - pad.bottom} y2={H - pad.bottom + 4} stroke="#b8c4d8" strokeWidth={1} />
            <text x={x} y={H - 7} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {label}
            </text>
          </g>
        ))}

        {/* Linha de limite de corrente (P135) */}
        {currentActive && p135 > 0 && (
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={yFor(p135, "current")}
            y2={yFor(p135, "current")}
            stroke="#ea580c"
            strokeWidth={1}
            strokeDasharray="6,3"
            opacity={0.55}
          />
        )}

        {/* Linha de trip de temperatura */}
        {activeSeries.has("temperature") && (
          <line
            x1={pad.left}
            x2={W - pad.right}
            y1={yFor(TRIP_TEMP, "temperature")}
            y2={yFor(TRIP_TEMP, "temperature")}
            stroke="#dc2626"
            strokeWidth={1}
            strokeDasharray="6,3"
            opacity={0.55}
          />
        )}

        {/* Marcadores de falha */}
        {faultEvents
          .filter((event) => event.time >= startTime && event.time <= now)
          .map((event, index) => (
            <g key={index}>
              <line
                x1={xFor(event.time)}
                x2={xFor(event.time)}
                y1={pad.top}
                y2={H - pad.bottom}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4,2"
                opacity={0.7}
              />
              <text x={xFor(event.time) + 2} y={pad.top + 9} fontSize={8} fill="#ef4444">
                F{String(event.code).padStart(3, "0")}
              </text>
            </g>
          ))}

        {/* Áreas de preenchimento */}
        {SERIES.filter((s) => activeSeries.has(s.key)).map(({ key }) => {
          const areaPath = buildAreaPath(key);
          return areaPath ? (
            <path key={`area-${key}`} d={areaPath} fill={`url(#${chartSummaryId}-grad-${key})`} stroke="none" />
          ) : null;
        })}

        {/* Linhas das séries */}
        {SERIES.filter((s) => activeSeries.has(s.key)).map(({ key, color }) => {
          const path = buildPath(key);
          return path ? (
            <path key={key} d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          ) : null;
        })}

        {/* Pontos ao vivo na última amostra de cada série */}
        {SERIES.filter((s) => activeSeries.has(s.key)).map(({ key, color }) => {
          const last = [...visible].reverse().find((s) => Number.isFinite(s[key]));
          if (!last) return null;
          return (
            <circle
              key={`dot-${key}`}
              cx={xFor(last.time)}
              cy={yFor(last[key], key)}
              r={3.5}
              fill={color}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Linha de cursor */}
        {cursorX !== null && (
          <line
            x1={cursorX}
            x2={cursorX}
            y1={pad.top}
            y2={H - pad.bottom}
            stroke="#64748b"
            strokeWidth={1}
            strokeDasharray="3,2"
            opacity={0.6}
          />
        )}

        {/* Rótulos eixo Y esquerdo (rpm) — 5 níveis */}
        {rpmActive &&
          yRatios.map((ratio) => (
            <text
              key={ratio}
              x={pad.left - 6}
              y={pad.top + plotH * ratio + 3.5}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={8.5}
              fill="#2563eb"
              opacity={ratio === 0.25 || ratio === 0.75 ? 0.7 : 1}
            >
              {Math.round(ranges.rpm * (1 - ratio))}
            </text>
          ))}

        {/* Rótulos eixo Y direito (corrente) — 5 níveis */}
        {currentActive &&
          yRatios.map((ratio) => (
            <text
              key={ratio}
              x={W - pad.right + 6}
              y={pad.top + plotH * ratio + 3.5}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={8.5}
              fill="#ea580c"
              opacity={ratio === 0.25 || ratio === 0.75 ? 0.7 : 1}
            >
              {(ranges.current * (1 - ratio)).toFixed(1)}
            </text>
          ))}

        {/* Rótulos eixo X */}
        <text x={pad.left} y={H - 7} textAnchor="start" fontSize={8.5} fill="#94a3b8">
          -{windowMs >= 60_000 ? `${windowMs / 60_000}min` : `${windowMs / 1_000}s`}
        </text>
        <text x={W - pad.right} y={H - 7} textAnchor="end" fontSize={8.5} fill="#94a3b8">
          {t("motorPanel.now")}
        </text>
      </svg>

      {/* Tooltip de cursor */}
      {closest !== null && cursorX !== null && (
        <div
          style={{
            position: "absolute",
            top: 4,
            left: `${Math.min(Math.max((cursorX / W) * 100, 18), 68)}%`,
            background: "rgba(15,23,42,0.88)",
            color: "#f1f5f9",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 11,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: 110,
            zIndex: 10,
            backdropFilter: "blur(4px)",
          }}
        >
          {SERIES.filter((series) => activeSeries.has(series.key)).map(
            ({ key, label, unit, color }) => (
              <div
                key={key}
                style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}
              >
                <span style={{ color, fontWeight: 600 }}>
                  {getSeriesLabel(key, label)}
                </span>
                <span>
                  {Number.isFinite(closest[key])
                    ? key === "rpm" || key === "ixtPercent" || key === "torquePercent"
                      ? Math.round(closest[key])
                      : closest[key].toFixed(1)
                    : "—"}
                  <span style={{ opacity: 0.65 }}> {unit}</span>
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
