// src/components/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/dashboard.module.css';
import { Box, Button} from '@mui/material';

function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Invoice Management System</h1>
      <div className={styles.buttonContainer}>
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/signin" variant="contained" sx={{ mr: 2 }}>
          Back to SignIn
        </Button>
        <Button component={Link} to="/incoming-invoices" variant="contained" sx={{ mr: 2 }}>
          Incoming Invocies
        </Button>
        <Button component={Link} to="/outgoing-invoices" variant="contained">
          Outgoing Invoices
        </Button>
        </Box>
      </div>
    </div>
  );
}

export default Dashboard;