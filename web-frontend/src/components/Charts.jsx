import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Charts({ summary }) {
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
      },
    ],
  };

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
      },
    ],
  };

  return (
  <div style={{ marginTop: "30px" }}>

    <div style={{ maxWidth: "450px", margin: "auto" }}>
      <Pie
        data={pieData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            title: {
              display: true,
              text: "Equipment Type Distribution",
              font: { size: 16 }
            },
          },
        }}
      />
    </div>

    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <Bar
        data={barData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Average Equipment Parameters",
              font: { size: 16 }
            },
          },
          scales: {
            y: { beginAtZero: true }
          }
        }}
      />
    </div>

  </div>
);

}

export default Charts;
