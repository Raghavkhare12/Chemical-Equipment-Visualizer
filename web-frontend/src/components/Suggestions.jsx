import React from "react";

function Suggestions({ rows }) {
  if (!rows || rows.length === 0) return null;

  const suggestions = [];

  rows.forEach((eq) => {
    const name =
      eq["Equipment Name"] ||
      eq.EquipmentName ||
      eq.name ||
      "Unknown Equipment";

    const type = eq.Type || eq.type;

    const flow = Number(eq.Flowrate || eq.flowrate || 0);
    const pressure = Number(eq.Pressure || eq.pressure || 0);
    const temp = Number(eq.Temperature || eq.temperature || 0);

    // ---- Pump Rules ----
    if (type === "Pump") {
      if (pressure < 5) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Pump "${name}": Low pressure — increase inlet pressure.`,
        });
      }
      if (flow < 115) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Pump "${name}": Low flowrate — check impeller or blockage.`,
        });
      }
    }

    // ---- Reactor Rules ----
    if (type === "Reactor") {
      if (temp > 140) {
        suggestions.push({
          level: "danger",
          msg: `🔥 Reactor "${name}": High temperature — check cooling system.`,
        });
      }
      if (pressure > 7.0) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Reactor "${name}": High pressure — inspect safety valves.`,
        });
      }
    }

    // ---- Compressor Rules ----
    if (type === "Compressor") {
      if (pressure < 7) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Compressor "${name}": Low compression — possible leakage.`,
        });
      }
    }

    // ---- Valve Rules ----
    if (type === "Valve") {
      if (pressure < 4) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Valve "${name}": Pressure drop detected — possible clogging.`,
        });
      }
    }

    // ---- Heat Exchanger ----
    if (type === "HeatExchanger") {
      if (temp > 125) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Heat Exchanger "${name}": High outlet temp — poor heat transfer.`,
        });
      }
    }

    // ---- Condenser ----
    if (type === "Condenser") {
      if (temp > 140) {
        suggestions.push({
          level: "warning",
          msg: `⚠ Condenser "${name}": Inefficient cooling — inspect coolant flow.`,
        });
      }
    }

    // ---- Global Safety ----
    if (temp > 140) {
      suggestions.push({
        level: "danger",
        msg: `🚨 ${type} "${name}": CRITICAL temperature — immediate shutdown recommended.`,
      });
    }
  });

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginBottom: "15px" }}>🧠 Smart System Suggestions</h3>

      {suggestions.length === 0 ? (
        <p style={{ color: "#2e7d32", fontWeight: "600" }}>
          ✅ All systems operating within safe operating limits.
        </p>
      ) : (
        <ul style={{ paddingLeft: "20px" }}>
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: "10px",
                color:
                  s.level === "danger"
                    ? "#d32f2f"
                    : s.level === "warning"
                    ? "#f57c00"
                    : "#2e7d32",
                fontWeight: "500",
              }}
            >
              {s.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Suggestions;
