import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/useI18n.js";
import MotorChartPanel from "./motor-simulation/MotorChartPanel.jsx";
import MotorEventLog from "./motor-simulation/MotorEventLog.jsx";
import {
  applyMotorHistoryReset,
  shouldResetMotorHistory,
} from "./motor-simulation/motorHistoryState.js";
import MotorVisualPanel from "./motor-simulation/MotorVisualPanel.jsx";
import { SAMPLE_INTERVAL_MS } from "./motor-simulation/motorSimulationConstants.js";

export default function MotorSimulationPanel({ hmiState }) {
  const { t } = useI18n();
  const motor = hmiState.motorState;
  const isRunning = Math.abs(hmiState.outputFrequency) > 0.05;

  const latestRef = useRef({ hmiState, motor });
  const resetContextRef = useRef({ hmiState, motor, isRunning });
  const prevFaultRef = useRef(hmiState.faultCode);
  const prevParamsRef = useRef(hmiState.parameters);
  const prevRunningRef = useRef(isRunning);
  const historySeedRef = useRef(hmiState.runtimeSeedVersion ?? 0);

  const [samples, setSamples] = useState([]);
  const [faultEvents, setFaultEvents] = useState([]);
  const [activeSeries, setActiveSeries] = useState(new Set(["rpm", "current"]));
  const [windowMs, setWindowMs] = useState(15_000);
  const [paused, setPaused] = useState(false);
  const [frozenSamples, setFrozenSamples] = useState(null);
  const [activeTab, setActiveTab] = useState("chart");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    resetContextRef.current = { hmiState, motor, isRunning };
  }, [hmiState, isRunning, motor]);

  useEffect(() => {
    const nextRuntimeSeedVersion = hmiState.runtimeSeedVersion ?? 0;
    if (!shouldResetMotorHistory(historySeedRef.current, nextRuntimeSeedVersion)) {
      return;
    }

    historySeedRef.current = nextRuntimeSeedVersion;

    const resetState = applyMotorHistoryReset({}, resetContextRef.current);

    setSamples(resetState.samples);
    setFaultEvents(resetState.faultEvents);
    setLogs(resetState.logs);
    setFrozenSamples(resetState.frozenSamples);
    latestRef.current = resetState.latestRefValue;
    prevFaultRef.current = resetState.prevFaultCode;
    prevParamsRef.current = resetState.prevParameters;
    prevRunningRef.current = resetState.prevRunning;
  }, [hmiState.runtimeSeedVersion]);

  useEffect(() => {
    const currentParams = hmiState.parameters;
    const previousParams = prevParamsRef.current;
    const newLogs = [];

    if (currentParams && previousParams) {
      Object.keys(currentParams).forEach((key) => {
        if (currentParams[key].value !== previousParams[key].value) {
          newLogs.push({
            time: new Date(),
            type: "parameterChanged",
            parameterCode: key,
            nextValue: currentParams[key].value,
          });
        }
      });
    }
    prevParamsRef.current = currentParams;

    if (isRunning !== prevRunningRef.current) {
      newLogs.push({
        time: new Date(),
        type: isRunning ? "motorStarted" : "motorStopped",
      });
    }
    prevRunningRef.current = isRunning;

    if (newLogs.length > 0) {
      setLogs((currentLogs) => [...newLogs.reverse(), ...currentLogs].slice(0, 200));
    }
  }, [hmiState.parameters, isRunning]);

  useEffect(() => {
    latestRef.current = { hmiState, motor };
  }, [hmiState, motor]);

  useEffect(() => {
    const previousFault = prevFaultRef.current;
    if (hmiState.faultCode !== null && previousFault !== hmiState.faultCode) {
      setFaultEvents((events) => [
        ...events.slice(-50),
        { time: Date.now(), code: hmiState.faultCode },
      ]);
    }
    prevFaultRef.current = hmiState.faultCode;
  }, [hmiState.faultCode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (paused) {
        return;
      }

      const { hmiState: latestState, motor: latestMotor } = latestRef.current;
      const time = Date.now();
      setSamples((currentSamples) => [
        ...currentSamples.filter((sample) => time - sample.time <= 300_000),
        {
          time,
          rpm: Math.abs(latestMotor.rpm),
          current: latestMotor.current,
          frequency: Math.abs(latestState.outputFrequency),
          temperature: latestState.moduleTemperature ?? 40,
          ixtPercent: latestState.ixtPercent ?? 0,
          torquePercent: Math.abs(latestMotor.torquePercent ?? 0),
        },
      ]);
    }, SAMPLE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  const toggleSeries = (key) => {
    setActiveSeries((previousSeries) => {
      const nextSeries = new Set(previousSeries);
      if (nextSeries.has(key)) {
        nextSeries.delete(key);
      } else {
        nextSeries.add(key);
      }
      return nextSeries;
    });
  };

  const togglePause = () => {
    if (!paused) {
      setFrozenSamples([...samples]);
      setPaused(true);
      return;
    }

    setFrozenSamples(null);
    setPaused(false);
  };

  const displaySamples = paused ? (frozenSamples ?? samples) : samples;

  return (
    <aside
      style={{
        width: "min(92vw, 340px)",
        borderRadius: "18px",
        padding: "24px",
        boxSizing: "border-box",
        border: "1px solid #d7ddea",
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 18px 42px rgba(56, 70, 110, 0.12)",
        color: "#26324a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MotorVisualPanel
        isRunning={isRunning}
        motor={motor}
        outputFrequency={hmiState.outputFrequency}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveTab("chart")}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: 8,
            background: activeTab === "chart" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "chart" ? "#fff" : "#475569",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t("motorPanel.chartTab")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("log")}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: 8,
            background: activeTab === "log" ? "#2563eb" : "#f1f5f9",
            color: activeTab === "log" ? "#fff" : "#475569",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t("motorPanel.logTab")}
        </button>
      </div>

      {activeTab === "chart" ? (
        <MotorChartPanel
          activeSeries={activeSeries}
          displaySamples={displaySamples}
          faultEvents={faultEvents}
          hmiState={hmiState}
          paused={paused}
          windowMs={windowMs}
          onTogglePause={togglePause}
          onToggleSeries={toggleSeries}
          onSelectWindow={setWindowMs}
        />
      ) : (
        <MotorEventLog logs={logs} />
      )}
    </aside>
  );
}
