import Charts from "./Charts";
import React, { useState, useRef } from "react";
import axios from "axios";
import DataTable from "./DataTable";
import HistoryViewer from "./HistoryViewer";
import Suggestions from "./Suggestions";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFromHistory, setSelectedFromHistory] = useState(null);

  const dashboardRef = useRef(null);

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
        "https://chemical-backend-qxf2.onrender.com/api/upload/",
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

  // ✅ EXPORT FULL DASHBOARD AS PDF
  const downloadFullDashboardPDF = async () => {
    const element = dashboardRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save("Chemical_Equipment_Dashboard.pdf");
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "auto", padding: "30px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
         Chemical Equipment Parameter Visualizer
      </h1>

      {/* Upload Card */}
      <div
        style={{
          background: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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

      {/* DASHBOARD */}
      {summary && (
        <div ref={dashboardRef}>
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

          {/* Table */}
          <DataTable rows={summary.rows} />

          {/* Smart Suggestions */}
          <Suggestions rows={summary.rows} />

          {/* History */}
          <HistoryViewer onSelect={(s) => setSelectedFromHistory(s)} />
        </div>
      )}

      {/* EXPORT PDF */}
      {summary && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={downloadFullDashboardPDF}
            style={{
              padding: "12px 35px",
              background: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            📄 Export Full Dashboard as PDF
          </button>
        </div>
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
