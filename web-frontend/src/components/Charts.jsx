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

  /* ---------- PIE DATA ---------- */
  const typeLabels = Object.keys(summary.type_distribution);
  const typeValues = Object.values(summary.type_distribution);

  const pieData = {
    labels: typeLabels,
    datasets: [
      {
        label: "Equipment Types",
        data: typeValues,
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

  /* ---------- BAR DATA ---------- */
  const barData = {
    labels: ["Flowrate", "Pressure", "Temperature"],
    datasets: [
      {
        label: "Average Values",
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

  /* ---------- LINE TREND DATA ---------- */
  const trendLabels = summary.rows.map((r) => r.equipment_name);

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Flowrate",
        data: summary.rows.map((r) => r.flowrate),
        borderColor: "#42a5f5",
        tension: 0.3,
      },
      {
        label: "Pressure",
        data: summary.rows.map((r) => r.pressure),
        borderColor: "#66bb6a",
        tension: 0.3,
      },
      {
        label: "Temperature",
        data: summary.rows.map((r) => r.temperature),
        borderColor: "#ffa726",
        tension: 0.3,
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
      {/* ===== PIE + BAR GRID ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
        }}
      >
        {/* PIE CARD */}
        <div style={cardStyle}>
          <h3>Equipment Type Distribution</h3>

          <Pie
            ref={pieRef}
            data={pieData}
            options={{
              responsive: true,
              animation: { animateRotate: true, duration: 1500 },
              plugins: { legend: { position: "bottom" } },
            }}
          />

          <button
            style={btnBlue}
            onClick={() => downloadChart(pieRef, "equipment_type_chart.png")}
          >
            📥 Download Pie Chart
          </button>
        </div>

        {/* BAR CARD */}
        <div style={cardStyle}>
          <h3>Average Parameters</h3>

          <Bar
            ref={barRef}
            data={barData}
            options={{
              responsive: true,
              animation: { duration: 1500, easing: "easeOutBounce" },
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />

          <button
            style={btnGreen}
            onClick={() => downloadChart(barRef, "average_parameters_chart.png")}
          >
            📥 Download Bar Chart
          </button>
        </div>
      </div>

      
    </div>
  );
}

/* ---------- STYLES ---------- */
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

const btnGreen = {
  ...btnBlue,
  background: "#2e7d32",
};

const btnPurple = {
  ...btnBlue,
  background: "#7b1fa2",
};

export default Charts;
