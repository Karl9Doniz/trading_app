import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Select, MenuItem, Button, TextareaAutosize, FormControl, InputLabel } from '@mui/material';
import { getCustomers, getOrganizations, getStorages, getEmployees, getNextOutgoingInvoiceNumber, createOutgoingInvoice, getProductByName, getContract, getContracts } from '../services/api';
import OutgoingItemsTable from './outgoing_items_table';

function CreateOutgoingInvoice() {
  const [invoice, setInvoice] = useState({
    number: '',
    date: '',
    customer_id: '',
    organization_id: '',
    storage_id: '',
    responsible_person_id: '',
    contract_number: '',
    payment_document: '',
    comment: '',
    items: []
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [storages, setStorages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    fetchNextInvoiceNumber();
  }, []);

  const fetchDropdownData = async () => {
    const customersData = await getCustomers();
    const organizationsData = await getOrganizations();
    const storagesData = await getStorages();
    const employeesData = await getEmployees();
    const contractsData = await getContracts();

    setCustomers(customersData);
    setOrganizations(organizationsData);
    setStorages(storagesData);
    setEmployees(employeesData);
    setContracts(contractsData);
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await getNextOutgoingInvoiceNumber();
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        number: response.next_invoice_number
      }));
    } catch (error) {
      console.error('Error fetching next invoice number:', error);
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!invoice.date) newErrors.date = 'Date is required';
    if (!invoice.customer_id) newErrors.customer_id = 'Supplier is required';
    if (!invoice.organization_id) newErrors.organization_id = 'Organization is required';
    if (!invoice.storage_id) newErrors.storage_id = 'Storage is required';
    if (!invoice.responsible_person_id) newErrors.responsible_person_id = 'Responsible person is required';
    if (!invoice.contract_id) newErrors.contract_id = 'Contract number is required';
    if (invoice.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const response = await createOutgoingInvoice(invoice);
      alert('Invoice created successfully!');

      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        number: response.number
      }));
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to create invoice. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <h2>Create Outgoing Invoice</h2>
      <Button component={Link} to="/outgoing-invoices" variant="contained" sx={{ mb: 2, mr: 2 }}>
        View All Invoices
      </Button>
      <Button type="submit" form="invoice-form" variant="contained" color="primary" sx={{ width: 'auto', mb: 2 }}>
        Submit
      </Button>
      <Box component="form" id="invoice-form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {/* First Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Invoice Number"
              name="number"
              value={invoice.number}
              InputProps={{ readOnly: true }}
              size="small"
              sx={{ width: '45%' }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={invoice.date}
              onChange={handleInvoiceChange}
              error={!!errors.date}
              helperText={errors.date}
              size="small"
              sx={{ width: '45%' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <FormControl error={!!errors.customer_id} fullWidth size="small">
            <InputLabel id="customer-label" shrink>Customer</InputLabel>
            <Select
              labelId="customer-label"
              name="customer_id"
              value={invoice.customer_id}
              onChange={handleInvoiceChange}
              label="Customer"
              notched
            >
              <MenuItem value=""><em>Select Customer</em></MenuItem>
              {customers.map(customer => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>{customer.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl error={!!errors.contract_id} fullWidth size="small">
            <InputLabel id="contract-label" shrink>Contract number</InputLabel>
            <Select
              labelId="contract-label"
              name="contract_id"
              value={invoice.contract_id}
              onChange={handleInvoiceChange}
              label="Contract number"
              notched
            >
              <MenuItem value=""><em>Select Contract</em></MenuItem>
              {contracts.map(contract => (
                <MenuItem key={contract.contract_id} value={contract.contract_id}>{contract.contract_number}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Second Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl error={!!errors.organization_id} fullWidth size="small">
            <InputLabel id="organization-label" shrink>Organization</InputLabel>
            <Select
              labelId="organization-label"
              name="organization_id"
              value={invoice.organization_id}
              onChange={handleInvoiceChange}
              label="Organization"
              notched
            >
              <MenuItem value=""><em>Select Organization</em></MenuItem>
              {organizations.map(org => (
                <MenuItem key={org.organization_id} value={org.organization_id}>{org.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl error={!!errors.storage_id} fullWidth size="small">
            <InputLabel id="storage-label" shrink>Storage</InputLabel>
            <Select
              labelId="storage-label"
              name="storage_id"
              value={invoice.storage_id}
              onChange={handleInvoiceChange}
              label="Storage"
              notched
            >
              <MenuItem value=""><em>Select Storage</em></MenuItem>
              {storages.map(storage => (
                <MenuItem key={storage.storage_id} value={storage.storage_id}>{storage.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Invoice Items Table */}
        <Box sx={{ gridColumn: '1 / -1' }}>
          <OutgoingItemsTable
            invoice={invoice}
            setInvoice={setInvoice}
            errors={errors}
          />
        </Box>
      </Box>
      {/* Responsible Person and Comment */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', mt: 2 }}>
          <FormControl error={!!errors.responsible_person_id} fullWidth size="small">
            <InputLabel id="responsible-person-label" shrink>Responsible</InputLabel>
            <Select
              labelId="responsible-person-label"
              name="responsible_person_id"
              value={invoice.responsible_person_id}
              onChange={handleInvoiceChange}
              label="Responsible"
              notched
            >
              <MenuItem value=""><em>Select Responsible</em></MenuItem>
              {employees.map(employee => (
                <MenuItem key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextareaAutosize
            minRows={3}
            name="comment"
            value={invoice.comment}
            onChange={handleInvoiceChange}
            placeholder="Comment"
            style={{ width: '100%' }}
          />
        </Box>
    </Box>
  );
}

export default CreateOutgoingInvoice;