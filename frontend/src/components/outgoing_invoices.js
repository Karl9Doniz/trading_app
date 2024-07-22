import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOutgoingInvoices } from '../services/api';
import AuthErrorHandler from './auth/auth_error_handler';
import '../styles/incoming_invoices.css';

function OutgoingInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getOutgoingInvoices();
      setInvoices(data);
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
    navigate(`/edit-outgoing-invoice/${id}`);
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.total_price || 0), 0).toFixed(2);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <AuthErrorHandler message={error} />;

  return (
    <div className="incoming-invoices">
      <h2>Outgoing Invoices</h2>
      <div className="button-container">
        <Link to="/create-outgoing-invoice" className="nav-button">
          Create New Invoice
        </Link>
        <Link to="/products" className="nav-button">
          View Products
        </Link>
        <Link to="/dashboard" className="nav-button">
          To Dashboard
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Number</th>
            <th>Operation Type</th>
            <th>Counter Agent</th>
            <th>Contract Number</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.incoming_invoice_id} onClick={() => handleInvoiceClick(invoice.incoming_invoice_id)}>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td>{invoice.number}</td>
              <td>{invoice.operation_type}</td>
              <td>{invoice.counter_agent_id}</td>
              <td>{invoice.contract_number}</td>
              <td>{calculateTotalPrice(invoice.items)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OutgoingInvoices;
