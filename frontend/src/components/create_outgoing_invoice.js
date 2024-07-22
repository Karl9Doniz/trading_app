import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createOutgoingInvoice, getCustomers, getOrganizations, getStorages, getEmployees } from '../services/api';
import styles from '../styles/create_outgoing_invoice.module.css';

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

  const calculateTotals = () => {
    const quantity = parseFloat(currentItem.quantity) || 0;
    const unitPrice = parseFloat(currentItem.unit_price) || 0;
    const vatPercentage = parseFloat(currentItem.vat_percentage) || 0;

    const totalPrice = quantity * unitPrice;
    const vatAmount = totalPrice * (vatPercentage / 100);

    setCurrentItem({
      ...currentItem,
      total_price: totalPrice.toFixed(2),
      vat_amount: vatAmount.toFixed(2)
    });
  };

  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    product_description: '',
    quantity: '',
    unit_of_measure: '',
    unit_price: '',
    total_price: '',
    vat_percentage: '',
    vat_amount: '',
    discount: '',
    account_number: ''
  });

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [storages, setStorages] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const customersData = await getCustomers();
    const organizationsData = await getOrganizations();
    const storagesData = await getStorages();
    const employeesData = await getEmployees();

    setCustomers(customersData);
    setOrganizations(organizationsData);
    setStorages(storagesData);
    setEmployees(employeesData);
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const validateInvoice = () => {
    const newErrors = {};
    if (!invoice.number) newErrors.number = 'Invoice number is required';
    if (!invoice.date) newErrors.date = 'Date is required';
    if (!invoice.customer_id) newErrors.customer_id = 'Customer is required';
    if (!invoice.organization_id) newErrors.organization_id = 'Organization is required';
    if (!invoice.storage_id) newErrors.storage_id = 'Storage is required';
    if (!invoice.responsible_person_id) newErrors.responsible_person_id = 'Responsible person is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateItem = () => {
    const newErrors = {};
    if (!currentItem.product_name) newErrors.product_name = 'Product name is required';
    if (!currentItem.quantity || isNaN(currentItem.quantity) || currentItem.quantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!currentItem.unit_of_measure) newErrors.unit_of_measure = 'Unit of measure is required';
    if (!currentItem.unit_price || isNaN(currentItem.unit_price) || currentItem.unit_price <= 0) {
      newErrors.unit_price = 'Unit price must be a positive number';
    }
    if (!currentItem.total_price || isNaN(currentItem.total_price) || currentItem.total_price <= 0) {
      newErrors.total_price = 'Total price must be a positive number';
    }
    if (!currentItem.vat_percentage || isNaN(currentItem.vat_percentage) || currentItem.vat_percentage < 0) {
      newErrors.vat_percentage = 'VAT percentage must be a non-negative number';
    }
    if (!currentItem.vat_amount || isNaN(currentItem.vat_amount) || currentItem.vat_amount < 0) {
      newErrors.vat_amount = 'VAT amount must be a non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (validateItem()) {
      setInvoice({
        ...invoice,
        items: [...invoice.items, currentItem]
      });
      setCurrentItem({
        product_name: '',
        product_description: '',
        quantity: '',
        unit_of_measure: '',
        unit_price: '',
        total_price: '',
        vat_percentage: '',
        vat_amount: '',
        discount: '',
        account_number: ''
      });
    }
  };

  const removeItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({
      ...invoice,
      items: updatedItems
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateInvoice()) {
      try {
        const response = await createOutgoingInvoice(invoice);
        alert('Invoice created successfully!');
        // Reset form or redirect
      } catch (error) {
        console.error('Error creating invoice:', error);
        alert('Failed to create invoice. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Outgoing Invoice</h2>
      <Link to="/outgoing-invoices" className={styles.navButton}>
        View All Invoices
      </Link>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.invoiceSection}>
          <h3 className={styles.sectionTitle}>Invoice Details</h3>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="number"
              value={invoice.number}
              onChange={handleInvoiceChange}
              placeholder="Invoice Number"
              className={styles.input}
            />
            {errors.number && <span className={styles.errorMessage}>{errors.number}</span>}
          </div>
          <div className={styles.inputGroup}>
            <input
              type="datetime-local"
              name="date"
              value={invoice.date}
              onChange={handleInvoiceChange}
              className={styles.input}
            />
            {errors.date && <span className={styles.errorMessage}>{errors.date}</span>}
          </div>
          <div className={styles.inputGroup}>
            <select
              name="customer_id"
              value={invoice.customer_id}
              onChange={handleInvoiceChange}
              className={styles.input}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>{customer.name}</option>
              ))}
            </select>
            {errors.customer_id && <span className={styles.errorMessage}>{errors.customer_id}</span>}
          </div>
          <div className={styles.inputGroup}>
            <select
              name="organization_id"
              value={invoice.organization_id}
              onChange={handleInvoiceChange}
              className={styles.input}
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.organization_id} value={org.organization_id}>{org.name}</option>
              ))}
            </select>
            {errors.organization_id && <span className={styles.errorMessage}>{errors.organization_id}</span>}
          </div>
          <div className={styles.inputGroup}>
            <select
              name="storage_id"
              value={invoice.storage_id}
              onChange={handleInvoiceChange}
              className={styles.input}
            >
              <option value="">Select Storage</option>
              {storages.map(storage => (
                <option key={storage.storage_id} value={storage.storage_id}>{storage.name}</option>
              ))}
            </select>
            {errors.storage_id && <span className={styles.errorMessage}>{errors.storage_id}</span>}
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="contract_number"
              value={invoice.contract_number}
              onChange={handleInvoiceChange}
              placeholder="Contract Number"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="payment_document"
              value={invoice.payment_document}
              onChange={handleInvoiceChange}
              placeholder="Payment Document"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <select
              name="responsible_person_id"
              value={invoice.responsible_person_id}
              onChange={handleInvoiceChange}
              className={styles.input}
            >
              <option value="">Select Responsible Person</option>
              {employees.map(employee => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
                </option>
              ))}
            </select>
            {errors.responsible_person_id && <span className={styles.errorMessage}>{errors.responsible_person_id}</span>}
          </div>
          <div className={styles.inputGroup}>
            <textarea
              name="comment"
              value={invoice.comment}
              onChange={handleInvoiceChange}
              placeholder="Comment"
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Invoice Items</h3>
          {invoice.items.map((item, index) => (
            <div key={index} className={styles.item}>
              <p>Product: {item.product_name}, Quantity: {item.quantity}, Price: {item.unit_price}</p>
              <button type="button" onClick={() => removeItem(index)} className={styles.removeButton}>Remove</button>
            </div>
          ))}
          <div className={styles.addItemForm}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="product_name"
                value={currentItem.product_name}
                onChange={handleItemChange}
                placeholder="Product Name"
                className={styles.input}
              />
              {errors.product_name && <span className={styles.errorMessage}>{errors.product_name}</span>}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="product_description"
                value={currentItem.product_description}
                onChange={handleItemChange}
                placeholder="Product Description"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
            <input
              type="number"
              step="0.001"
              name="quantity"
              value={currentItem.quantity}
              onChange={handleItemChange}
              placeholder="Quantity"
              className={`${styles.input} ${errors.quantity ? styles.errorInput : ''}`}
            />
              {errors.quantity && <span className={styles.errorMessage}>{errors.quantity}</span>}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="unit_of_measure"
                value={currentItem.unit_of_measure}
                onChange={handleItemChange}
                placeholder="Unit of Measure"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
            <input
              type="number"
              step="0.01"
              name="unit_price"
              value={currentItem.unit_price}
              onChange={handleItemChange}
              placeholder="Unit Price"
              className={`${styles.input} ${errors.unit_price ? styles.errorInput : ''}`}
            />
              {errors.unit_price && <span className={styles.errorMessage}>{errors.unit_price}</span>}
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="total_price"
                value={currentItem.total_price}
                onChange={handleItemChange}
                placeholder="Total Price"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="vat_percentage"
                value={currentItem.vat_percentage}
                onChange={handleItemChange}
                placeholder="VAT Percentage"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="vat_amount"
                value={currentItem.vat_amount}
                onChange={handleItemChange}
                placeholder="VAT Amount"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="discount"
                value={currentItem.discount}
                onChange={handleItemChange}
                placeholder="Discount"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="account_number"
                value={currentItem.account_number}
                onChange={handleItemChange}
                placeholder="Account Number"
                className={styles.input}
              />
            </div>
            <button type="button" onClick={addItem} className={styles.addButton}>Add Item</button>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Create Invoice</button>
      </form>
    </div>
  );
}

export default CreateOutgoingInvoice;
