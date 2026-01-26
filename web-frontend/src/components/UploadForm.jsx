import Charts from "./Charts";
import React, { useState } from "react";
import axios from "axios";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSummary(response.data);
    } catch (error) {
      console.error(error);
      alert("Upload failed! Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "auto", padding: "30px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        ⚗️ Chemical Equipment Parameter Visualizer
      </h1>

      {/* Upload Card */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <br />
        <br />
        <button
          onClick={handleUpload}
          style={{
            padding: "10px 25px",
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Upload CSV
        </button>

        {loading && <p style={{ marginTop: "10px" }}>Uploading...</p>}
      </div>

      {/* SUMMARY + CHARTS */}
      {summary && (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <SummaryCard label="Total Equipment" value={summary.total_count} />
            <SummaryCard
              label="Avg Flowrate"
              value={summary.avg_flowrate.toFixed(2)}
            />
            <SummaryCard
              label="Avg Pressure"
              value={summary.avg_pressure.toFixed(2)}
            />
            <SummaryCard
              label="Avg Temperature"
              value={summary.avg_temperature.toFixed(2)}
            />
          </div>

          {/* Charts */}
          <Charts summary={summary} />

          {/* PDF Button */}
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a
              href="http://127.0.0.1:8000/api/report/"
              target="_blank"
              rel="noreferrer"
            >
              <button
                style={{
                  padding: "12px 30px",
                  background: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                📄 Download PDF Report
              </button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

/* Small Reusable Card */
function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "15px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h4 style={{ marginBottom: "8px", color: "#555" }}>{label}</h4>
      <h2 style={{ margin: 0, color: "#1976d2" }}>{value}</h2>
    </div>
  );
}

export default UploadForm;
