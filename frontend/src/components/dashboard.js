// src/components/Dashboard.js

import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/dashboard.module.css';

function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Invoice Management System</h1>
      <div className={styles.buttonContainer}>
        <Link to="/signin" className={styles.button}>
          Back to Sign In
        </Link>
        <Link to="/incoming-invoices" className={styles.button}>
          Incoming Invoices
        </Link>
        <Link to="/outgoing-invoices" className={styles.button}>
          Outgoing Invoices
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;