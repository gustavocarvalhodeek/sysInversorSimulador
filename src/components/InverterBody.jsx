import React from "react";
import Display from "./Display.jsx";
import { useI18n } from "../i18n/useI18n.js";
import { getHmiControlAriaLabel } from "../i18n/localizedContent.js";
import {
  buildHmiDisplayAccessibleSummary,
  buildHmiDisplayLiveSummary,
  VISUALLY_HIDDEN_STYLES,
} from "./hmiAccessibility.js";

const REFERENCE_IMAGE = "/cfw100-reference.png";

const DISPLAY_BOX = { left: 14.1, top: 23.32, width: 71.47, height: 11.03 };

const BUTTON_BOXES = {
  menu: { left: 10.9, top: 41.82, width: 18.27, height: 9.58 },
  down: { left: 30.77, top: 41.82, width: 17.95, height: 9.58 },
  up: { left: 50.32, top: 41.82, width: 18.11, height: 9.58 },
  runStop: { left: 70.19, top: 41.82, width: 18.27, height: 9.58 },
};

const toPct = (value) => `${value}%`;

function circleStyle(box) {
  return {
    position: "absolute",
    left: toPct(box.left),
    top: toPct(box.top),
    width: toPct(box.width),
    height: toPct(box.height),
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    padding: 0,
    touchAction: "manipulation",
  };
}

function splitButtonStyle() {
  return {
    flex: 1,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    padding: 0,
    touchAction: "manipulation",
  };
}

export default function InverterBody({ display, hmiState, dispatch }) {
  const { t } = useI18n();
  const accessibleDisplaySummary = buildHmiDisplayAccessibleSummary(display, hmiState, t);
  const accessibleLiveSummary = buildHmiDisplayLiveSummary(display, hmiState, t);

  return (
    <div
      role="group"
      aria-label={t("hmiA11y.panelLabel")}
      style={{
        width: "min(94vw, 430px)",
        maxWidth: "100%",
        aspectRatio: "624 / 1179",
        position: "relative",
        backgroundImage: `url(${REFERENCE_IMAGE})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "drop-shadow(0 28px 34px rgba(45, 60, 106, 0.22))",
      }}
    >
      <div style={VISUALLY_HIDDEN_STYLES}>{accessibleDisplaySummary}</div>
      <div aria-live="polite" aria-atomic="true" style={VISUALLY_HIDDEN_STYLES}>
        {accessibleLiveSummary}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: toPct(DISPLAY_BOX.left),
          top: toPct(DISPLAY_BOX.top),
          width: toPct(DISPLAY_BOX.width),
          height: toPct(DISPLAY_BOX.height),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 7%",
          boxSizing: "border-box",
          color: "#4f5748",
          textShadow: "0 1px 0 rgba(255,255,255,0.12)",
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      >
        <Display {...display} />
      </div>

      <button
        className="app-focus-ring hmi-button"
        type="button"
        aria-label={getHmiControlAriaLabel("menu", t)}
        onClick={() => dispatch({ type: "PRESS_P" })}
        style={circleStyle(BUTTON_BOXES.menu)}
      />

      <button
        className="app-focus-ring hmi-button"
        type="button"
        aria-label={getHmiControlAriaLabel("down", t)}
        onClick={() => dispatch({ type: "PRESS_DOWN" })}
        style={circleStyle(BUTTON_BOXES.down)}
      />

      <button
        className="app-focus-ring hmi-button"
        type="button"
        aria-label={getHmiControlAriaLabel("up", t)}
        onClick={() => dispatch({ type: "PRESS_UP" })}
        style={circleStyle(BUTTON_BOXES.up)}
      />

      <div
        style={{
          ...circleStyle(BUTTON_BOXES.runStop),
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          className="app-focus-ring hmi-button"
          type="button"
          aria-label={getHmiControlAriaLabel("run", t)}
          onClick={() => dispatch({ type: "PRESS_RUN" })}
          style={splitButtonStyle()}
        />
        <button
          className="app-focus-ring hmi-button"
          type="button"
          aria-label={getHmiControlAriaLabel("stop", t)}
          onClick={() => dispatch({ type: "PRESS_STOP" })}
          style={splitButtonStyle()}
        />
      </div>
    </div>
  );
}
