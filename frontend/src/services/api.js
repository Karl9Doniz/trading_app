import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
    baseURL: API_URL,
  });

  // Add a response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Assuming your backend returns a 401 status for expired tokens
        const expiredError = new Error('Token has expired');
        expiredError.name = 'ExpiredSignatureError';
        return Promise.reject(expiredError);
      }
      return Promise.reject(error);
    }
  );


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

  export const getSuppliers = async () => {
    const response = await axios.get(`${API_URL}/suppliers/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const getOrganizations = async () => {
    const response = await axios.get(`${API_URL}/organizations/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const getStorages = async () => {
    const response = await axios.get(`${API_URL}/storages/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const getEmployees = async () => {
    const response = await axios.get(`${API_URL}/employees/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  };

  export const getProducts = async () => {
    const response = await axios.get(`${API_URL}/products/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
};

export const updateInvoice = async (id, data) => {
    const response = await fetch(`/api/incoming-invoices/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  };

  export const deleteInvoice = async (id) => {
    await fetch(`/api/incoming-invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  };

  export const getInvoice = async (id) => {
    try {
      const response = await fetch(`/api/incoming-invoices/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('API Response:', text);

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Invalid JSON in response');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  };