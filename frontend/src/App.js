import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './components/auth/signin';
import Register from './components/auth/register';
import IncomingInvoices from './components/incoming_invoices';
import CreateIncomingInvoice from './components/create_incoming_invoice';
import ProductList from './components/product_list';
import EditIncomingInvoice from './components/edit_incoming_invoice';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/incoming-invoices"
            element={
              localStorage.getItem('token')
                ? <IncomingInvoices />
                : <Navigate to="/signin" replace />
            }
          />
          <Route
            path="/create-incoming-invoice"
            element={
              localStorage.getItem('token')
                ? <CreateIncomingInvoice />
                : <Navigate to="/signin" replace />
            }
          />
          <Route
            path="/products"
            element={
              localStorage.getItem('token')
                ? <ProductList />
                : <Navigate to="/signin" replace />
            }
          />
          <Route
            path="/edit-incoming-invoice/:id"
            element={
              localStorage.getItem('token')
                ? <EditIncomingInvoice />
                : <Navigate to="/signin" replace />
            }
          />
          <Route path="/" element={<Navigate to="/signin" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;