import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Footer = () => {
  return (
    <Container
      maxWidth="100%"
      sx={{
        backgroundColor: "#333333",
        transition: "transform 0.2s ease",
        display: "flex",
        justifyContent: "center",
        borderTop: "2px solid black",
      }}
    >
      <Box
        maxWidth="xl"
        sx={{
          backgroundColor: "#333333",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          component="h1"
          sx={{ fontWeight: "bold", color: "#fff" }}
        >
          ANNOTATION APP COPYRIGHTS © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default Footer;
