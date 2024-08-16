import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
  });


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newTokens = await refreshToken();
        localStorage.setItem('token', newTokens.access_token);
        localStorage.setItem('refresh_token', newTokens.refresh_token);
        api.defaults.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const refreshToken = async () => {
  const response = await axios.post(`${API_URL}/user/refresh`, null, {
    headers: {
      'Authorization': `Bearer ${getRefreshToken()}`
    }
  });
  return response.data;
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/user/login', { username, password });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
    try {
      const response = await api.post('/user/register', { username, email, password });
      if (response.data.access_token && response.data.refresh_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

export const getIncomingInvoices = async () => {
  const response = await api.get('/incoming-invoices/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getOutgoingInvoices = async () => {
  const response = await api.get('/outgoing-invoices/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getIncomingInvoiceItems = async (invoiceId) => {
  const response = await api.get(`/incoming-invoice-items/?invoice_id=${invoiceId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const createIncomingInvoice = async (invoiceData) => {
  const response = await api.post('/incoming-invoices/', invoiceData, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const createIncomingInvoiceItem = async (itemData) => {
  const response = await api.post('/incoming-invoice-items/', itemData, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getSuppliers = async () => {
  const response = await api.get('/suppliers/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getSupplier = async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  };

export const getOrganizations = async () => {
  const response = await api.get('/organizations/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getStorages = async () => {
  const response = await api.get('/storages/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get('/employees/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get('/products/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const updateInvoice = async (id, data) => {
  const response = await api.patch(`/incoming-invoices/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const updateInvoiceOutgoing = async (id, data) => {
    const response = await api.patch(`/outgoing-invoices/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.data;
};

export const deleteInvoice = async (id) => {
  await api.delete(`/incoming-invoices/${id}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
};

export const deleteInvoiceOutgoing = async (id) => {
    await api.delete(`/outgoing-invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
  };


export const getInvoiceOutgoing = async (id) => {
  try {
    const response = await api.get(`/outgoing-invoices/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

export const getInvoiceIncoming = async (id) => {
    try {
      const response = await api.get(`/incoming-invoices/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  };

export const createOutgoingInvoice = async (invoice) => {
  const response = await api.post('/outgoing-invoices/', invoice, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get('/customers/', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  return response.data;
};

export const getCustomer = async (id) => {
    try {
      const response = await api.get(`/customers/${id}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  };

  export const getProductsByDateAndStorage = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/incoming-invoices/by-date-and-storage`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by date and storage:', error);
      throw error;
    }
  };

  export const getNextInvoiceNumber = async () => {
    const response = await fetch('/api/incoming-invoices/next-invoice-number');
    if (!response.ok) {
      throw new Error('Failed to fetch next invoice number');
    }
    return response.json();
  };

  export const getNextOutgoingInvoiceNumber = async () => {
    const response = await fetch('/api/outgoing-invoices/next-invoice-number');
    if (!response.ok) {
      throw new Error('Failed to fetch next invoice number');
    }
    return response.json();
  };

  export const getProductByName = async (productName) => {
    const response = await axios.get(`/api/products/by-name/${productName}`);
    return response.data;
  };

