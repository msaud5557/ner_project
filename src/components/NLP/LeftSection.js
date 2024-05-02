import React, { useRef, useState } from 'react';
import { Paper, Typography, Snackbar } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const LeftSection = ({ setPdfFile, setPdfFilePreview }) => {
  const fileInputRef = useRef(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFilePreview(URL.createObjectURL(file));
        setPdfFile(file);
      } else {
        // Invalid file format, show Snackbar message
        setSnackbarOpen(true);
      }
    }
  };

  const handlePaperClick = () => {
    fileInputRef.current.click();
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
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
        onClick={handlePaperClick}
      >
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          id="fileInput"
        />
        <CloudUploadIcon sx={{ color: "black", fontSize: 30 }} />
        <Typography
          variant="subtitle2"
          component="p"
          sx={{ color: "black", fontWeight: "500" }}
        >
          Drop PDF file here or click to select
        </Typography>
      </Paper>
      {/* Snackbar to display error message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Only PDF files are allowed."
      />
    </div>
  );
};

export default LeftSection;
