import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import ComponentLibraryItem from "./ComponentLibraryItem.jsx";

export default function ComponentLibraryCategory({
  category,
  items,
  selectedComponentId,
  currentComponentId,
  onSelect,
  onItemKeyDown,
}) {
  const { t } = useI18n();
  if (!items?.length) {
    return null;
  }

  const nameKey = `componentLibrary.categories.${category.id}.name`;
  const descriptionKey = `componentLibrary.categories.${category.id}.description`;
  const translatedName = t(nameKey);
  const translatedDescription = t(descriptionKey);
  const displayName = translatedName === nameKey ? category.name : translatedName;
  const displayDescription =
    translatedDescription === descriptionKey
      ? category.description
      : translatedDescription;

  return (
    <section
      className="component-library-category"
      aria-labelledby={`${category.id}-title`}
      style={{
        display: "grid",
        gap: "14px",
        alignContent: "start",
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #dbe4f1",
        background: "linear-gradient(180deg, #fbfdff 0%, #f6f9fd 100%)",
      }}
    >
      <div style={{ display: "grid", gap: "6px" }}>
        <h2
          id={`${category.id}-title`}
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 700,
            color: "#26324a",
          }}
        >
          {displayName}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#54657f",
          }}
        >
          {displayDescription}
        </p>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {items.map((item) => (
          <ComponentLibraryItem
            key={item.id}
            item={item}
            selected={item.id === selectedComponentId}
            isCurrent={item.id === currentComponentId}
            onSelect={onSelect}
            onKeyDown={onItemKeyDown}
          />
        ))}
      </div>
    </section>
  );
}
