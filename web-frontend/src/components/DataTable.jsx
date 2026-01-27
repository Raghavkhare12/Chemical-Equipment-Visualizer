import React, { useState } from "react";

function DataTable({ rows }) {
  const [sortKey, setSortKey] = useState(null);
  const [asc, setAsc] = useState(true);

  const sortData = (key) => {
    const newAsc = sortKey === key ? !asc : true;
    setSortKey(key);
    setAsc(newAsc);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    if (a[sortKey] < b[sortKey]) return asc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return asc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>📋 Equipment Data Table (Click headers to sort)</h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {Object.keys(rows[0]).map((key) => (
                <th
                  key={key}
                  onClick={() => sortData(key)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    background: "#1976d2",
                    color: "white",
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
