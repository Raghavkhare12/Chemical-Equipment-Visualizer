import React, { useRef } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

function Charts({ summary }) {
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const lineRef = useRef(null);

  if (!summary || !summary.rows) return null;

  /* ---------- PIE DATA ---------- */
  const pieData = {
    labels: Object.keys(summary.type_distribution),
    datasets: [
      {
        data: Object.values(summary.type_distribution),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffce56",
          "#8bc34a",
          "#9c27b0",
          "#ff9800",
        ],
        borderWidth: 1,
      },
    ],
  };

  /* ---------- BAR DATA (OPTIONAL SUMMARY) ---------- */
  const barData = {
    labels: ["Avg Flowrate", "Avg Pressure", "Avg Temperature"],
    datasets: [
      {
        data: [
          summary.avg_flowrate,
          summary.avg_pressure,
          summary.avg_temperature,
        ],
        backgroundColor: ["#42a5f5", "#66bb6a", "#ffa726"],
        borderRadius: 8,
      },
    ],
  };

  /* ---------- LINE TREND DATA (IMPORTANT) ---------- */
  const labels = summary.rows.map((r) => r["Equipment Name"]);

  const lineData = {
    labels,
    datasets: [
      {
        label: "Flowrate",
        data: summary.rows.map((r) => r.Flowrate),
        borderColor: "#42a5f5",
        backgroundColor: "rgba(66,165,245,0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Pressure",
        data: summary.rows.map((r) => r.Pressure),
        borderColor: "#66bb6a",
        backgroundColor: "rgba(102,187,106,0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: "Temperature",
        data: summary.rows.map((r) => r.Temperature),
        borderColor: "#ffa726",
        backgroundColor: "rgba(255,167,38,0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  /* ---------- DOWNLOAD ---------- */
  const downloadChart = (ref, name) => {
    if (!ref.current) return;
    const url = ref.current.toBase64Image();
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <div style={{ marginTop: "40px" }}>
      {/* ===== PIE + BAR ===== */}
      <div style={gridStyle}>
        <div style={cardStyle}>
          <h3>Equipment Type Distribution</h3>
          <Pie ref={pieRef} data={pieData} />
          <button
            style={btnBlue}
            onClick={() => downloadChart(pieRef, "equipment_type.png")}
          >
            📥 Download Pie Chart
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Average Parameters (Summary)</h3>
          <Bar
            ref={barRef}
            data={barData}
            options={{ plugins: { legend: { display: false } } }}
          />
          <button
            style={btnGreen}
            onClick={() => downloadChart(barRef, "average_parameters.png")}
          >
            📥 Download Bar Chart
          </button>
        </div>
      </div>

      {/* ===== LINE TREND (MAIN CHART) ===== */}
      <div style={{ ...cardStyle, marginTop: "30px" }}>
        <h3>📈 Equipment Parameter Trend</h3>
        <Line
          ref={lineRef}
          data={lineData}
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            plugins: { legend: { position: "top" } },
            scales: {
              x: { title: { display: true, text: "Equipment" } },
              y: { title: { display: true, text: "Parameter Value" } },
            },
          }}
        />
        <button
          style={btnPurple}
          onClick={() => downloadChart(lineRef, "parameter_trend.png")}
        >
          📥 Download Trend Chart
        </button>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
};

const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const btnBlue = {
  marginTop: "12px",
  padding: "8px 15px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnGreen = { ...btnBlue, background: "#2e7d32" };
const btnPurple = { ...btnBlue, background: "#7b1fa2" };

export default Charts;
