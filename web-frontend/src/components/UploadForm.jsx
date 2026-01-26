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
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>Upload CSV</button>

      {loading && <p>Uploading...</p>}

      {summary && (
    <div style={{ marginTop: "20px" }}>
      <h3>Summary</h3>
      <p>Total Equipment: {summary.total_count}</p>
      <p>Average Flowrate: {summary.avg_flowrate}</p>
      <p>Average Pressure: {summary.avg_pressure}</p>
      <p>Average Temperature: {summary.avg_temperature}</p>

      <Charts summary={summary} />

      <a
        href="http://127.0.0.1:8000/api/report/"
        target="_blank"
        rel="noreferrer"
      >
        <button style={{ marginTop: "20px" }}>
          Download PDF Report
        </button>
      </a>
    </div>
  )}


    </div>
  );
}

export default UploadForm;
