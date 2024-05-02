import React, { useState, useEffect } from "react";
import LeftSection from "./LeftSection";
import RightSection from "./RightSection";
import NLPTable from "./NLPTable";
import { Paper, Typography } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { CSVLink } from "react-csv";

const NLPMainSection = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFilePreview, setPdfFilePreview] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (pdfFile) {
          const formData = new FormData();
          formData.append("files", pdfFile);
          const response = await fetch("http://ai.clevercost.com:8080/tokens", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const jsonData = await response.json();
          console.log("Token Response:", jsonData);

          // Transform the API response to match the expected data structure
          const transformedData = jsonData.tokenlist.map((token, index) => ({
            fileName: { Name: pdfFile.name },
            token: token[1], // Assuming token is at index 1 in the array
            tag: "", // You can set a default tag here if needed
            id: index, // Add a unique identifier for each token
          }));

          setData(transformedData);
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pdfFile]);

  const headers = [
    { label: "PDF File Name", key: "fileName" },
    { label: "Token", key: "token" },
    { label: "Tag", key: "tag" },
  ];

  const updateTag = (fileName, token, selectedOption) => {
    setData((prevData) =>
      prevData.map((row) => {
        if (row.fileName.Name === fileName && row.token === token) {
          return { ...row, tag: selectedOption };
        }
        return row;
      })
    );
  };

  const csvFileName = pdfFile ? `${pdfFile.name.replace(/\.[^/.]+$/, "")}_NLPData.csv` : "NLPData.csv";

  const csvData = data.map((row) => ({
    fileName: row.fileName.Name,
    token: row.token,
    tag: row.tag || "O", // Use selected option here
  }));

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "92vh",
          maxHeight: "92vh",
        }}
      >
        <div
          className="table"
          style={{ width: "50vw", height: "76vh", maxHeight: "76vh" }}
        >
          <NLPTable data={data} updateTag={updateTag} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "16vh",
            justifyContent: "center",
            borderRight: "4px solid #ffffff",
          }}
        >
          <div
            style={{
              width: "25vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#525659",
            }}
          >
            <LeftSection setPdfFile={setPdfFile} setPdfFilePreview={setPdfFilePreview} />
          </div>
          <div
            style={{
              width: "25vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#525659",
            }}
          >
            <Paper
              elevation={9}
              sx={{
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "white",
                color: "black",
                transition: "background-color 0.3s ease",
                maxHeight: "8vh",
                width: "16vw",
              }}
            >
              <CSVLink
                data={csvData}
                headers={headers}
                filename={csvFileName}
                className="csv-link"
              >
                <CloudDownloadIcon sx={{ color: "black", fontSize: 30 }} />
                <Typography
                  variant="subtitle2"
                  component="p"
                  sx={{ color: "black", fontWeight: "500" }}
                >
                  Download File
                </Typography>
              </CSVLink>
            </Paper>
          </div>
        </div>
      </div>
      <RightSection pdfFilePreview={pdfFilePreview} />
    </div>
  );
};

export default NLPMainSection;
