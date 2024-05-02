import React from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ButtonGroup, Typography } from "@mui/material";
import bg from "../assets/bg.jpg";

const Popup = ({ onSelectDashboard }) => {
  const popupStyle = {
    background: `url(${bg}) no-repeat center center/cover`,
    minHeight: "92vh",
    minWidth: "99vw",
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    alignItems: "center",
  };

  const paperStyle = {
    minHeight: "40vh",
    minWidth: "20vw",
    maxWidth: "20vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "transparent",
    border: "1px groove #333333",
    backdropFilter: "blur(3px)", // Glassy effect (transparent and shiny)
    borderRadius: "30px", // Optional: Add border radius for rounded corners
  };

  const typographyStyle = {
    color: "white", // Text color
    fontWeight: "bold", // Make text bold
    marginBottom: "1.5rem", // Add margin below Typography
  };

  const buttonStyle = {
    // width: "100%", // Make both buttons the same width
    padding: "10px 20px", // Increase button padding
    color: "black", //
    // fontWeight: "bold", // Make button text bold
    margin: "1rem 0", // Add margin above and below each button
    backgroundColor: "#fff", //
    borderRadius: "25px", // Optional: Add border radius for rounded corners
    marginTop: "2rem", //
  };

  return (
    <div style={popupStyle}>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5" gutterBottom style={typographyStyle}>
          OBJECT DETECTION
        </Typography>
        <div
          style={{
            display: "flex",
            minWidth: "30%",
            padding: "3px",
            marginBottom: "2rem",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "grey", textAlign: "center" }}
          >
            YOLO is an advanced real-time object detection system that can identify and locate multiple objects within an image or video frame in a single pass.
          </Typography>
        </div>
        <Button
          onClick={() => onSelectDashboard("Dashboard1")}
          endIcon={<ArrowForwardIcon />}
          style={buttonStyle}
        >
          GET STARTED
        </Button>
        {/* <Button onClick={() => onSelectDashboard("Dashboard2")} endIcon={<ArrowForwardIcon />} style={buttonStyle}>NLP: Text Analysis and Processing</Button> */}
      </Paper>
      <Paper elevation={3} style={paperStyle}>
        <Typography variant="h5" gutterBottom style={typographyStyle}>
          IMAGE RECOGNITION
        </Typography>
        <div
          style={{
            display: "flex",
            minWidth: "30%",
            padding: "3px",
            marginBottom: "2rem",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "grey", textAlign: "center" }}
          >
            NLP enables machines to understand, interpret, and generate human language, allowing for seamless communication between humans and computers.
          </Typography>
        </div>
        {/* <Button onClick={() => onSelectDashboard("Dashboard1")} endIcon={<ArrowForwardIcon />} style={buttonStyle}>VISION: Annotations and YOLO Files</Button> */}
        <Button
          onClick={() => onSelectDashboard("Dashboard2")}
          endIcon={<ArrowForwardIcon />}
          style={buttonStyle}
        >
          GET STARTED
        </Button>
      </Paper>
    </div>
  );
};

export default Popup;
