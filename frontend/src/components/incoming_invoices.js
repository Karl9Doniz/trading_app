import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIncomingInvoices } from '../services/api';
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
    navigate(`/edit-incoming-invoice/${id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <AuthErrorHandler message={error} />;

  return (
    <div className="incoming-invoices">
      <h2>Incoming Invoices</h2>
      <div className="button-container">
        <Link to="/create-incoming-invoice" className="nav-button">
          Create New Invoice
        </Link>
        <Link to="/products" className="nav-button">
          View Products
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
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncomingInvoices;