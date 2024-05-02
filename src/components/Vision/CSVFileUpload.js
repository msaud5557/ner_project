import React, { useState } from "react";
import { Button } from "@mui/material";
import Papa from "papaparse"; // Import Papa for CSV parsing

const CSVFileUpload = ({ onCSVData }) => {
  const handleOnDrop = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          // Extract labels from CSV data
          const labels = result.data.map((row) => row[Object.keys(row)[0]]);

          // Pass the CSV data to the parent component
          onCSVData(labels);
        },
        error: (error) => {
          console.error("CSV parsing error:", error.message);
        },
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        name="file"
        accept=".csv"
        onChange={handleOnDrop}
        style={{ display: "block", margin: "10px auto" }}
      />
      <br />
    </div>
  );
};

export default CSVFileUpload;
