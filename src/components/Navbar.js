import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import nerImage from "../assets/NER.png";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const Navbar = ({ authToken, setAuthToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  // const [authToken, setAuthToken] = useState("");
  const [openSignupModal, setOpenSignupModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedAuthToken = sessionStorage.getItem("authToken");

    if (storedUsername && storedAuthToken) {
      setUsername(storedUsername);
      setAuthToken(storedAuthToken);
    }
  }, []);

  const handleSignup = () => {
    setIsLoading(true);
    fetch("http://135.181.6.243:9000/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } else if (response.status === 400) {
          throw new Error("Invalid registration request. Please check your input.");
        } else if (response.status === 409) {
          throw new Error("Username or email already exists. Please choose another.");
        } else {
          throw new Error("Unexpected error during registration.");
        }
      })
      .then((data) => {
        sessionStorage.setItem("authToken", data.token);
        sessionStorage.setItem("username", data.user.username);
        setAuthToken(data.token);
        setOpenSignupModal(false);
        setIsLoading(false);
        setSnackbarMessage("Signup successful!");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error during signup:", error);
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      });
  };
  
  const handleLogin = () => {
    setIsLoading(true);
    fetch("http://135.181.6.243:9000/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 200) {
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("username", data.user.username);
          setAuthToken(data.token);
          setOpenLoginModal(false);
          setIsLoading(false);
          setSnackbarMessage("Login successful!");
          setSnackbarOpen(true);
        } else if (response.status === 401) {
          setIsLoading(false);
          setSnackbarMessage("Incorrect username or password.");
          setSnackbarOpen(true);
        } else {
          throw new Error("Unexpected error during login.");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error during login:", error);
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      });
  };  
  
  

  const handleLogout = () => {
    fetch("http://135.181.6.243:9000/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("username");
          setAuthToken("");
        } else {
          throw new Error("Invalid logout request");
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <Container
      maxWidth="100%"
      sx={{
        backgroundColor: "#333333",
        transition: "transform 0.2s ease",
        borderBottom: "2px solid black",
        display: "flex",
        justifyContent: "space-between", // Align buttons to the right
        alignItems: "center",
      }}
    >
      <Box
        maxWidth="xl"
        sx={{
          backgroundColor: "#333333",
          padding: "8px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img src={nerImage} alt="NER Logo" />
      </Box>
      <Box>
        {authToken ? (
          <Box>
            <span style={{ color: "white", marginRight: "16px" }}>
              {`Hello, ${username}!`}
            </span>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              sx={{ backgroundColor: "white", color: "#333333" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddAltIcon />}
              sx={{ marginRight: 1, color: "white" }}
              onClick={() => setOpenSignupModal(true)}
            >
              Signup
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              sx={{ backgroundColor: "white", color: "#333333" }}
              onClick={() => setOpenLoginModal(true)}
            >
              Login
            </Button>
          </>
        )}
      </Box>

      {/* Signup Modal */}
      <Modal
        open={openSignupModal}
        onClose={() => setOpenSignupModal(false)}
        aria-labelledby="signup-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#333333", // Set background color to black
            borderRadius: "8px",
            border: "2px solid #fff", // Set border color to white
            boxShadow: 24,
            p: 4,
            width: 400,
            height: 420,
          }}
        >
          <Typography
            variant="h4"
            component="h4"
            sx={{ color: "white", fontWeight: "500", textAlign: "center" }}
          >
            Sign Up
          </Typography>
          <Box sx={{ marginBottom: 2 }} />
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              style: {
                color: "#fff", // Set text color to white
              },
            }}
          />
          <Box sx={{ marginBottom: 2 }} />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: {
                color: "#fff", // Set text color to white
              },
            }}
          />
          <Box sx={{ marginBottom: 2 }} />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              style: {
                color: "#fff", // Set text color to white
              },
            }}
          />
          <Box sx={{ marginBottom: 4 }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignup}
          >
            {isLoading ? (
              <CircularProgress color="primary" size={24} />
            ) : (
              "Signup"
            )}
          </Button>
        </Box>
      </Modal>

      {/* Login Modal */}
      <Modal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        aria-labelledby="login-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#333333", // Set background color to black
            borderRadius: "8px",
            border: "2px solid #fff", // Set border color to white
            boxShadow: 24,
            p: 4,
            maxWidth: 400,
            height: 300,
          }}
        >
          <Typography
            variant="h4"
            component="h4"
            sx={{ color: "white", fontWeight: "500", textAlign: "center" }}
          >
            Log In
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              style: {
                color: "#fff", // Set text color to white
              },
            }}
          />
          <Box sx={{ marginBottom: 2 }} />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              style: {
                color: "#fff", // Set text color to white
              },
            }}
          />
          <Box sx={{ marginBottom: 4 }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
          >
            {isLoading ? (
              <CircularProgress color="primary" size={24} />
            ) : (
              "Login"
            )}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Snackbar will close after 6 seconds
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Navbar;
