import React from "react";

export default function ComponentStateViewer({ states }) {
  if (!states?.length) {
    return null;
  }

  return (
    <div className="component-library-state-viewer">
      {states.map((componentState) => (
        <article
          key={componentState.name}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #dbe4f1",
            background: "#f8fbff",
            display: "grid",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#26324a",
            }}
          >
            {componentState.name}
          </span>
          <span
            style={{
              fontSize: "12px",
              lineHeight: 1.5,
              color: "#53627e",
            }}
          >
            {componentState.description}
          </span>
        </article>
      ))}
    </div>
  );
}
