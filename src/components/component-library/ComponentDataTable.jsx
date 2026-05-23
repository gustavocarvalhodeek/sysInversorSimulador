import React from "react";
import { useI18n } from "../../i18n/useI18n.js";

export default function ComponentDataTable({ rows }) {
  const { t } = useI18n();
  if (!rows?.length) {
    return null;
  }

  return (
    <div className="component-library-data-table">
      <table>
        <thead>
          <tr>
            <th scope="col">{t("componentLibrary.dataHeader")}</th>
            <th scope="col">{t("componentLibrary.valueHeader")}</th>
            <th scope="col">{t("componentLibrary.unitHeader")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.label}-${row.value}-${row.unit ?? ""}`}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
              <td>{row.unit || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
