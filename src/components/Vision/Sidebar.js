import React, { useState, useRef } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  Snackbar,
  ButtonGroup,
  Box,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Alert from "@mui/material/Alert";
import Papa from "papaparse";
import { CSVLink } from "react-csv";

const Sidebar = ({ labels, setLabels, showGenerateLabels, setShowGenerateLabels, onLabelsGenerated, rectangles, setRectangles }) => {
  const [newLabel, setNewLabel] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState(false);
  const [emptyInputAlert, setEmptyInputAlert] = useState(false);
  const [userGeneratedLabels, setUserGeneratedLabels] = useState([]);
  const [csvData, setCSVData] = useState([]);

  const newLabelInputRef = useRef(null);

  const handleCSVImport = (data) => {
    const labels = data.map((row) => row[0]);
    const labelsWithColors = labels.map((label) => ({
      label,
      color: getRandomColor(),
    }));

    setLabels(labelsWithColors);
    setUserGeneratedLabels(labelsWithColors);
    setShowGenerateLabels(true);
    setCSVData(labelsWithColors);

    // Update the generatedLabels in the parent component
    onLabelsGenerated(labelsWithColors);
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleNewLabelChange = (event) => {
    setNewLabel(event.target.value);
  };

  const handleNewLabelKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddNewLabel();
    } else if (event.key === "Tab") {
      event.preventDefault();
      newLabelInputRef.current.focus();
    }
  };

  const handleAddNewLabel = () => {
    if (newLabel.trim() === "") {
      // Show Snackbar warning for empty input
      setEmptyInputAlert(true);
    } else if (labels.some((label) => label.label === newLabel)) {
      // Show Snackbar warning for duplicate label
      setDuplicateAlert(true);
    } else {
      const randomColor = getRandomColor();
      const updatedLabels = [
        ...labels,
        { label: newLabel, color: randomColor },
      ];
      setLabels(updatedLabels);
      setUserGeneratedLabels([...userGeneratedLabels, newLabel]);
      setNewLabel("");
      setCSVData(updatedLabels);

      // Pass the updated labels to the parent component
      onLabelsGenerated(updatedLabels);
    }
  };


  const handleDeleteLabel = (labelToDelete) => {
    const updatedLabels = labels.filter(
      (label) => label.label !== labelToDelete.label
    );
  
    // Filter out rectangles associated with the deleted label
    const updatedRectangles = rectangles.filter(
      (rect) => rect.label !== labelToDelete.label
    );
  
    setLabels(updatedLabels);
    setUserGeneratedLabels(
      userGeneratedLabels.filter((label) => label !== labelToDelete.label)
    );
    
    // Update rectangles with the filtered rectangles
    setRectangles(updatedRectangles);
  
    // Update the CSV data with updated labels
    setCSVData(updatedLabels);
    onLabelsGenerated(updatedLabels);
  };
  

  const handleCloseDuplicateAlert = () => {
    setDuplicateAlert(false);
  };

  const handleBackButtonClick = () => {
    const confirmBack = window.confirm(
      "Going back will discard your current progress in label generation. Are you sure you want to proceed?"
    );

    if (confirmBack) {
      setShowGenerateLabels(false);
      setLabels([]);
      setUserGeneratedLabels([]);

      // Update the generatedLabels in the parent component with an empty array
      onLabelsGenerated([]);
    }
  };


  return (
    <>
      <List
        sx={{
          minHeight: "77vh",
          backgroundColor: "#333333",
          display: "flex",
          flexDirection: "column",
          justifyItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginLeft: 2,
              marginBottom: 2,
              fontWeight: "bold",
              color: "white",
            }}
          >
            LABELS
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: "#333333",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "flex-start",
          }}
        >
          {showGenerateLabels ? (
            <>
              <ListItem disablePadding>
                <Box p={1}>
                  <TextField
                    type="text"
                    value={newLabel}
                    onChange={handleNewLabelChange}
                    onKeyPress={handleNewLabelKeyPress}
                    placeholder="Enter label"
                    fullWidth
                    sx={{ "& input": { borderColor: "white", color: "white" } }}
                  />
                </Box>
                <Box p={1}>
                  <ButtonGroup fullWidth>
                    <Button
                      onClick={handleAddNewLabel}
                      variant="contained"
                      sx={{
                        backgroundColor: "white", fontWeight: "500", color: "#333333", "&:hover": {
                          backgroundColor: "#666666", // Change hover color to grey
                          color: "#fff"
                        },
                      }}
                    >
                      Add
                    </Button>
                    <Button variant="outlined" color="primary" size="small">
                      <IconButton
                        color="inherit"
                        onClick={handleBackButtonClick}
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                    </Button>
                  </ButtonGroup>
                </Box>
              </ListItem>
              {labels.map((label, index) => (
                <div key={index}>
                  <ListItem
                    disablePadding
                    sx={{ borderBottom: "1px solid grey" }}
                  >
                    <ListItemIcon>
                      <Paper
                        style={{
                          backgroundColor: "transparent",
                          border: `3px solid ${label.color}`,
                          borderRadius: "4px",
                          width: "16px",
                          height: "16px",
                          marginLeft: "1.5rem",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={label.label}
                      sx={{ color: "#fff" }}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteLabel(label)}
                      aria-label="delete"
                      sx={{ marginRight: 2, color: "red" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  <Divider sx={{ backgroundColor: "grey" }} />
                </div>
              ))}

            </>
          ) : (
            <ListItem
              disablePadding
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Paper
                sx={{
                  backgroundColor: "#28231D",
                  height: "200px",
                  width: "200px",
                  padding: "10px",
                }}
              >
                <Typography
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  GENERATE LABELS
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  sx={{
                    color: "grey",
                    textAlign: "justify",
                    marginTop: "0.25rem",
                  }}
                >
                  Create labels manually to add custom annotations to your
                  images. This option allows you to precisely define and apply
                  labels based on your requirements, providing full control over
                  the labeling process.
                </Typography>
                <IconButton
                  onClick={() => setShowGenerateLabels(true)}
                  sx={{ color: "white" }}
                >
                  <ArrowCircleRightIcon />
                </IconButton>
              </Paper>
            </ListItem>
          )}
          {!showGenerateLabels && (
            <ListItem
              disablePadding
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const text = e.target.result;
                      const parsedData = Papa.parse(text, { header: false });
                      handleCSVImport(parsedData.data);
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
                id="csvFileInput"
              />
              <label htmlFor="csvFileInput">
                <Paper
                  sx={{
                    backgroundColor: "#28231D",
                    height: "200px",
                    width: "200px",
                    padding: "10px",
                  }}
                >
                  <Typography
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    IMPORT CSV FILE
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    gutterBottom
                    sx={{
                      color: "grey",
                      textAlign: "justify",
                      marginTop: "0.25rem",
                    }}
                  >
                    Import labels from a CSV file to streamline your
                    annotation workflow. Easily load pre-existing label data
                    from a CSV file, making it convenient to reuse annotations
                    and collaborate with your team efficiently.
                  </Typography>
                  <Typography
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    CLICK HERE
                  </Typography>
                </Paper>
              </label>
            </ListItem>
          )}
        </Box>
      </List>
      {/* Separate container for the "Export Labels as CSV" button */}
      <div
        style={{
          marginTop: "auto",
          backgroundColor: "#333333",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {showGenerateLabels && (
          <CSVLink data={csvData} filename={"labels.csv"}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "white",
                color: "#333333",
                "&:hover": {
                  backgroundColor: "#666666",
                },
              }}
            >
              Export Labels as CSV
            </Button>
          </CSVLink>
        )}
      </div>
      <Snackbar
        open={duplicateAlert}
        autoHideDuration={6000}
        onClose={handleCloseDuplicateAlert}
      >
        <Alert severity="error" onClose={handleCloseDuplicateAlert}>
          Label already exists!
        </Alert>
      </Snackbar>
      <Snackbar
        open={emptyInputAlert}
        autoHideDuration={6000}
        onClose={() => setEmptyInputAlert(false)}
      >
        <Alert severity="error" onClose={() => setEmptyInputAlert(false)}>
          Label cannot be empty!
        </Alert>
      </Snackbar>

    </>
  );
};

export default Sidebar;
