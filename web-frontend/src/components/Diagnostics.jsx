function Diagnostics({ rows }) {
  if (!rows || rows.length === 0) return null;

  const insights = [];

  const detectTrend = (arr) => {
    if (arr.every((v, i) => i === 0 || v >= arr[i - 1])) return "rising";
    if (arr.every((v, i) => i === 0 || v <= arr[i - 1])) return "falling";
    return "oscillating";
  };

  const byType = {};
  rows.forEach(r => {
    byType[r.Type] = byType[r.Type] || [];
    byType[r.Type].push(r);
  });

  Object.entries(byType).forEach(([type, items]) => {
    const flow = items.map(i => Number(i.Flowrate));
    const pressure = items.map(i => Number(i.Pressure));
    const temp = items.map(i => Number(i.Temperature));

    if (type === "Pump" && detectTrend(flow) === "falling") {
      insights.push("Pump shows declining flowrate → possible impeller wear or blockage");
    }

    if (type === "Reactor" && detectTrend(temp) === "rising") {
      insights.push("Reactor temperature rising → possible cooling inefficiency");
    }

    if (type === "Valve" && detectTrend(pressure) === "oscillating") {
      insights.push("Valve pressure oscillating → unstable flow control");
    }

    if (type === "HeatExchanger" && temp.reduce((a,b)=>a+b)/temp.length > 125) {
      insights.push("Heat exchanger temperature high → fouling or scaling suspected");
    }
  });

  return (
  <div
    style={{
      marginTop: "30px",
      padding: "20px",
      background: "#ffffff",
      borderRadius: "14px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    }}
  >
    <h3>📈 Trend Insights & Root Cause Analysis</h3>

    <ul style={{ marginTop: "10px" }}>
      {insights.map((i, idx) => (
        <li key={idx} style={{ marginBottom: "8px" }}>
          {i}
        </li>
      ))}
    </ul>
  </div>
);

}

export default Diagnostics;
