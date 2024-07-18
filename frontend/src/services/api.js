import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_URL}/user/login`, { username, password });
  return response.data;
};

export const registerUser = async (username, email, password) => {
  const response = await axios.post(`${API_URL}/user/register`, { username, email, password });
  return response.data;
};

export const getIncomingInvoices = async () => {
    const response = await axios.get(`${API_URL}/incoming-invoices/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
};

export const getIncomingInvoiceItems = async (invoiceId) => {
    const response = await axios.get(`${API_URL}/incoming-invoice-items/?invoice_id=${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const createIncomingInvoice = async (invoiceData) => {
    const response = await axios.post(`${API_URL}/incoming-invoices/`, invoiceData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const createIncomingInvoiceItem = async (itemData) => {
    const response = await axios.post(`${API_URL}/incoming-invoice-items/`, itemData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };