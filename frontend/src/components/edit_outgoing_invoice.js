import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Select, MenuItem, Button, TextareaAutosize, FormControl, InputLabel } from '@mui/material';
import { getInvoiceOutgoing, updateInvoiceOutgoing, deleteInvoiceOutgoing, getCustomers, getOrganizations, getStorages, getEmployees, getContracts, getContract } from '../services/api';
import { Link } from 'react-router-dom';
import OutgoingItemsTable from './outgoing_items_table';

function EditOutgoingInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [storages, setStorages] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});
    const [contracts, setContracts] = useState([]);

    useEffect(() => {
        fetchInvoice();
        fetchDropdownData();
    }, [id]);

    const fetchInvoice = async () => {
        const data = await getInvoiceOutgoing(id);
        setInvoice(data);
    };

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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!invoice.date) newErrors.date = 'Date is required';
        if (!invoice.customer_id) newErrors.customer_id = 'Supplier is required';
        if (!invoice.organization_id) newErrors.organization_id = 'Organization is required';
        if (!invoice.storage_id) newErrors.storage_id = 'Storage is required';
        if (!invoice.responsible_person_id) newErrors.responsible_person_id = 'Responsible person is required';
        if (!invoice.contract_id) newErrors.contract_id = 'Contract number requiered';
        if (invoice.items.length === 0) newErrors.items = 'At least one item is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
          alert('Please fill in all required fields');
          return;
        }
        try {
          await updateInvoiceOutgoing(id, invoice);
          setIsEditing(false);
          alert('Invoice updated successfully!');
        } catch (error) {
          console.error('Error updating invoice:', error);
          if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
          } else {
            alert('Failed to update invoice. Please try again.');
          }
        }
      };

    const handleDelete = async () => {
        const confirmed = window.confirm('Are you sure you want to delete this invoice?');
        if (confirmed) {
            try {
                await deleteInvoiceOutgoing(id);
                navigate('/outgoing-invoices');
                alert('Invoice deleted successfully!');
            } catch (error) {
                console.error('Error deleting invoice:', error);
                alert('Failed to delete invoice. Please try again.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoice({ ...invoice, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    if (!invoice) return <div>Loading...</div>;

    return (
        <Box sx={{ p: 2 }}>
          <h2>Edit Outgoing Invoice</h2>
            <Box sx={{ display: 'flex', mb: 3, gap: 3 }}>
                <Button component={Link} to="/outgoing-invoices" variant="contained" sx={{mr: -1}}>
                    View All Invoices
                </Button>
                    {isEditing ? (
                        <Button onClick={handleSave} variant="contained" color="primary" sx={{ mr: -1 }}>
                            Save
                        </Button>
                    ) : (
                        <Button onClick={handleEdit} variant="contained" color="primary" sx={{ mr: -1 }}>
                            Edit
                        </Button>
                    )}
                    <Button onClick={handleDelete} variant="contained" color="secondary" sx={{ mr: 1}}>
                        Delete
                    </Button>
            </Box>
            <Box component="form" id="invoice-form" sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
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
                  onChange={handleChange}
                  error={!!errors.date}
                  helperText={errors.date}
                  size="small"
                  sx={{ width: '45%' }}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <FormControl error={!!errors.customer_id} fullWidth size="small">
                <InputLabel id="customer-label" shrink>Customer</InputLabel>
                <Select
                  labelId="customer-label"
                  name="customer_id"
                  value={invoice.customer_id}
                  onChange={handleChange}
                  label="Customer"
                  notched
                  disabled={!isEditing}
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
                  onChange={handleChange}
                  label="Contract number"
                  notched
                  disabled={!isEditing}
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
                  onChange={handleChange}
                  label="Organization"
                  notched
                  disabled={!isEditing}
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
                  onChange={handleChange}
                  label="Storage"
                  notched
                  disabled={!isEditing}
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
                  onChange={handleChange}
                  label="Responsible"
                  notched
                  disabled={!isEditing}
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
                onChange={handleChange}
                placeholder="Comment"
                style={{ width: '100%' }}
                disabled={!isEditing}
              />
            </Box>
        </Box>
      );
}

export default EditOutgoingInvoice;
