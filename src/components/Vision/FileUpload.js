import React, { useCallback, useState } from "react";
import { Paper, Typography, Snackbar } from "@mui/material";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const allowedImageFormats = ["image/jpeg", "image/png", "image/gif"];

const FileUpload = ({ onFilesSelect, setOriginalImageWidth, setOriginalImageHeight }) => {
  const [showWarning, setShowWarning] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const nonImageFiles = acceptedFiles.filter(
        (file) => !allowedImageFormats.includes(file.type)
      );
      if (nonImageFiles.length > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
        // Accessing original image dimensions here
        acceptedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              // Access the original image dimensions
              setOriginalImageWidth(img.width);
              setOriginalImageHeight(img.height);
              // Call the callback function with original files and original image dimensions
              onFilesSelect(acceptedFiles);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
    },
    [onFilesSelect, setOriginalImageWidth, setOriginalImageHeight]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: allowedImageFormats.join(","),
    multiple: true,
  });

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <>
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
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ color: "black", fontSize: 30 }} />
        <Typography
          variant="subtitle2"
          component="p"
          sx={{ color: "black", fontWeight: "500" }}
        >
          Drop Image files here or click to select
        </Typography>
      </Paper>
      <Snackbar
        open={showWarning}
        autoHideDuration={5000}
        onClose={handleCloseWarning}
        message="Only image files (jpeg, png, gif) are allowed."
      />
    </>
  );
};

export default FileUpload;
