import React, { useEffect, useState } from "react";
import axios from "axios";

function HistoryViewer({ onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/history/");
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>🕘 Upload History (Last 5 Datasets)</h3>

      {history.length === 0 && <p>No history found.</p>}

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.summary)}
            style={{
              cursor: "pointer",
              padding: "15px",
              minWidth: "200px",
              background: "#f5f7fa",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
          >
            <strong>{item.file_name}</strong>
            <br />
            <small>
              {new Date(item.uploaded_at).toLocaleString()}
            </small>
            <br />
            <span style={{ color: "#1976d2" }}>Click to view</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HistoryViewer;
