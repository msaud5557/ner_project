import React from "react";
import { MenuItem, Select, } from "@mui/material";

const FloatingToolbar = ({ isLocked, generatedLabels, onLabelsGenerated, selectedLabel, setSelectedLabel, }) => {
  // const [selectedLabel, setSelectedLabel] = useState("");

  const handleLabelSelect = (event) => {
    // Handle label selection and pass the selected label to the parent component
    const selectedLabel = event.target.value;
    setSelectedLabel(selectedLabel);
  };

  return (
    <>
      <Select
        value={selectedLabel}
        onChange={handleLabelSelect}
        displayEmpty
        inputProps={{ "aria-label": "Select Label" }}
        style={{ marginLeft: "10px", color: "white", padding: 0, height: "35px", width: "100px", border: "none", }}
      >
        <MenuItem value="" disabled style={{ fontSize: "15px" }}>
          Select Label
        </MenuItem>
        {generatedLabels.map((labelObj) => (
          <MenuItem key={labelObj.label} value={labelObj.label} style={{ color: labelObj.color }}>
            {labelObj.label}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default FloatingToolbar;
