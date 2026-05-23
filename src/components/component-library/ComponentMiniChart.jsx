import React from "react";
import { useI18n } from "../../i18n/useI18n.js";

function getChartPoints(data, width, height, paddingX, paddingY) {
  if (!data?.length) {
    return "";
  }

  const values = data.map((point) => Number(point.value) || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const stepX = data.length === 1
    ? 0
    : (width - paddingX * 2) / (data.length - 1);

  return data.map((point, index) => {
    const normalized = ((Number(point.value) || 0) - minValue) / range;
    const x = paddingX + stepX * index;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(" ");
}

function getSummaryText(data, t) {
  if (!data?.length) {
    return t("componentLibrary.chartNoPoints");
  }

  const first = data[0];
  const last = data[data.length - 1];
  return t("componentLibrary.chartSummary", {
    startLabel: first.label,
    startValue: first.value,
    endLabel: last.label,
    endValue: last.value,
  });
}

export default function ComponentMiniChart({
  title,
  description,
  data,
}) {
  const { t } = useI18n();
  const width = 320;
  const height = 180;
  const paddingX = 22;
  const paddingY = 20;
  const chartPoints = getChartPoints(data, width, height, paddingX, paddingY);
  const summaryText = getSummaryText(data, t);

  return (
    <div className="component-library-chart">
      <div
        style={{
          display: "grid",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#26324a",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#53627e",
          }}
        >
          {description}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title}. ${description}`}
        style={{
          width: "100%",
          height: "180px",
          display: "block",
        }}
      >
        <rect x="0" y="0" width={width} height={height} rx="14" fill="#ffffff" />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#dbe4f1"
          strokeWidth="2"
        />
        <line
          x1={paddingX}
          y1={paddingY}
          x2={paddingX}
          y2={height - paddingY}
          stroke="#dbe4f1"
          strokeWidth="2"
        />
        <polyline
          points={chartPoints}
          fill="none"
          stroke="#2f6fd6"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data?.map((point, index) => {
          const values = data.map((item) => Number(item.value) || 0);
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const range = maxValue - minValue || 1;
          const stepX = data.length === 1
            ? 0
            : (width - paddingX * 2) / (data.length - 1);
          const normalized = ((Number(point.value) || 0) - minValue) / range;
          const x = paddingX + stepX * index;
          const y = height - paddingY - normalized * (height - paddingY * 2);

          return (
            <g key={`${point.label}-${point.value}`}>
              <circle cx={x} cy={y} r="4.5" fill="#2f6fd6" />
              <text
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#60728d"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p
        style={{
          margin: 0,
          fontSize: "11px",
          lineHeight: 1.5,
          color: "#60728d",
        }}
      >
        {summaryText}
      </p>
    </div>
  );
}
