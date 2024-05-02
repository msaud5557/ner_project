import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Popup from './components/Popup';
import AnoMainSection from './components/Vision/AnoMainSection';
import NLPMainSection from './components/NLP/NLPMainSection';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Button from '@mui/material/Button';
import './App.css';

const App = () => {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [authToken, setAuthToken] = useState("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const handleDashboardSelect = (dashboard) => {
    setSelectedDashboard(dashboard);
    setShowPopup(false);
  };

  const handleReturn = () => {
    if (selectedDashboard) {
      // Show the confirmation dialog
      setShowConfirmationDialog(true);
    } else {
      // If no dashboard selected, go back directly
      setSelectedDashboard(null);
      setShowPopup(true);
    }
  };

  const handleConfirm = () => {
    // User confirmed to go back
    setShowConfirmationDialog(false);
    setSelectedDashboard(null);
    setShowPopup(true);
  };

  const handleCancel = () => {
    // User canceled the action
    setShowConfirmationDialog(false);
  };

  return (
    <div className="app-container">
      <Navbar authToken={authToken} setAuthToken={setAuthToken} />
      {showPopup && <Popup onSelectDashboard={handleDashboardSelect} />}
      {selectedDashboard === 'Dashboard1' && <AnoMainSection authToken={authToken} />}
      {selectedDashboard === 'Dashboard2' && <NLPMainSection authToken={authToken} />}
      {!showPopup && (
        <>
          <div className="floating-icon" onClick={handleReturn}>
            <KeyboardBackspaceIcon fontSize="large" sx={{ color: "white" }} />
          </div>
          <Dialog
            open={showConfirmationDialog}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Confirm Action</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Going back will discard your progress. Are you sure?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancel} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirm} color="primary" autoFocus>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <Footer />
    </div>
  );
};

export default App;
