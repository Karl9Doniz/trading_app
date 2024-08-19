import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getContract, getIncomingInvoices, getSupplier, getOperation } from '../services/api';
import { Box, Button} from '@mui/material';
import AuthErrorHandler from './auth/auth_error_handler';
import '../styles/incoming_invoices.css';

function IncomingInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getIncomingInvoices();
      const invoicesWithData = await Promise.all(
        data.map(async (invoice) => {
          const supplier = await getSupplier(invoice.counter_agent_id);
          const contract = await getContract(invoice.contract_id);
          const operation = await getOperation(invoice.operation_id);
          return { ...invoice, supplierName: supplier.name,
                              contractNumber: contract.contract_number,
                              operationType: operation.operation_type
          };
        })
      );
      setInvoices(invoicesWithData);
      setLoading(false);
    } catch (err) {
      if (err.name === 'ExpiredSignatureError') {
        setError('Your session has expired. Please sign in again.');
      } else {
        setError('Failed to fetch invoices');
      }
      setLoading(false);
    }
  };

  const handleInvoiceClick = (id) => {
    navigate(`/edit-incoming-invoice/${id}`);
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.total_price || 0), 0).toFixed(2);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <AuthErrorHandler message={error} />;

  return (
    <div className="incoming-invoices">
      <h2>Incoming Invoices</h2>
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/create-incoming-invoice" variant="contained" sx={{ mr: 2 }}>
          Create Incoming Invoice
        </Button>
        <Button component={Link} to="/products" variant="contained" sx={{ mr: 2 }}>
          View Products
        </Button>
        <Button component={Link} to="/dashboard" variant="contained">
          To Dashboard
        </Button>
      </Box>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Number</th>
            <th>Operation Type</th>
            <th>Supplier</th>
            <th>Contract Number</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.incoming_invoice_id} onClick={() => handleInvoiceClick(invoice.incoming_invoice_id)}>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td>{invoice.number}</td>
              <td>{invoice.operationType}</td>
              <td>{invoice.supplierName}</td>
              <td>{invoice.contractNumber}</td>
              <td>{calculateTotalPrice(invoice.items)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncomingInvoices;