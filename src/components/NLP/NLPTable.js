import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import "./NLPTable.css"; // Add a CSS file for custom styling

const NLPTable = ({ data, updateTag }) => {
  const [customTags, setCustomTags] = React.useState({});

  const handleAddCustomTag = (fileName, token, customTag) => {
    updateTag(fileName, token, customTag);
    setCustomTags({ ...customTags, [`${fileName}-${token}`]: "" }); // Clear the custom tag field after adding the tag
  };

  const handleCustomTagChange = (fileName, token, customTag) => {
    setCustomTags({ ...customTags, [`${fileName}-${token}`]: customTag });
  };

  return (
    <TableContainer
      component={Paper}
      style={{
        marginBottom: 20,
        backgroundColor: "#1e1e1e",
        width: "50vw",
        height: "76vh",
      }}
    >
      <Typography
        variant="h6"
        align="center"
        style={{ padding: "10px", backgroundColor: "white" }}
      >
        NLP Data Table
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ backgroundColor: "#121212", color: "white" }}>
              PDF File Name
            </TableCell>
            <TableCell style={{ backgroundColor: "#121212", color: "white" }}>
              Token
            </TableCell>
            <TableCell style={{ backgroundColor: "#121212", color: "white" }}>
              Tag
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell style={{ color: "white" }}>
                {row.fileName.Name}
              </TableCell>
              <TableCell style={{ color: "white" }}>{row.token}</TableCell>
              <TableCell style={{ color: "white" }}>
                <Select
                  label="Tag"
                  variant="outlined"
                  style={{ width: "7.5vw", color: "white" }}
                  renderValue={(selected) => selected}
                  value={row.tag || "O"}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    updateTag(row.fileName.Name, row.token, selectedValue);
                  }}
                >
                  <MenuItem value="B - Product">B - Product</MenuItem>
                  <MenuItem value="I - Product">I - Product</MenuItem>
                  <MenuItem value="O">O</MenuItem>
                </Select>
                <TextField
                  placeholder="Custom Tag"
                  value={customTags[`${row.fileName.Name}-${row.token}`] || ""}
                  onChange={(e) =>
                    handleCustomTagChange(
                      row.fileName.Name,
                      row.token,
                      e.target.value
                    )
                  }
                  InputProps={{
                    style: {
                      width: "7.5vw",
                      marginLeft: "10px",
                      color: "white",
                    },
                    placeholderstyle: {
                      color: "grey",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: "grey",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() =>
                    handleAddCustomTag(
                      row.fileName.Name,
                      row.token,
                      customTags[`${row.fileName.Name}-${row.token}`]
                    )
                  }
                  style={{ marginLeft: "10px" }}
                >
                  Add
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NLPTable;
