import React from "react";
import {
  Paper,
  ImageList,
  ImageListItem,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../styles/custom-scrollbar.css";

const FilePreviews = ({ uploadedFiles, onDeleteImage, onSelectImage, selectedImageIndex }) => {

  const imageStyle = {
    width: "100%",
    height: "220px", // Adjust the height as per your preference
    objectFit: "cover", // Ensure the image maintains its aspect ratio and covers the container
  };

  const selectedTextStyle = {
    position: "absolute",
    top: "50%", // Center vertically
    left: "50%", // Center horizontally
    transform: "translate(-50%, -50%)", // Center both horizontally and vertically
    maxWidth: "100%", // Ensure it doesn't exceed the image width
    padding: "6px 10px",
    // borderRadius: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the background color and opacity
    color: "#fff",
    textAlign: "center",
    objectFit: "cover",
    fontWeight: "600",
    backdropFilter: "blur(1px)", // Add this for the blur effect
  };

  return (
    <Paper sx={{ backgroundColor: "#28231D" }}>
      <ImageList cols={2} gap={10}>
        {uploadedFiles.map((file, index) => (
          <ImageListItem
            key={index}
            onClick={() => onSelectImage(index)}
            style={{
              cursor: "pointer",
              position: "relative",
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              style={{
                borderRadius: "4px",
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
            {index === selectedImageIndex && (
              <Typography sx={{
                ...selectedTextStyle,
                width: "80%", // Ensure the text box covers the entire image width
              }}>SELECTED</Typography>
            )}
            <IconButton
              aria-label="Delete"
              onClick={() => onDeleteImage(index)}
              sx={{ position: "absolute", top: 0, right: 0 }}
            >
              <DeleteIcon />
            </IconButton>
          </ImageListItem>
        ))}
      </ImageList>
    </Paper>
  );
};

export default FilePreviews;
