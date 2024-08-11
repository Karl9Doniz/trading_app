import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createIncomingInvoice, getCustomers, getOrganizations, getStorages, getEmployees, getNextOutgoingInvoiceNumber, createOutgoingInvoice } from '../services/api';
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

  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [storages, setStorages] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    fetchNextInvoiceNumber();
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

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const addItem = () => {
    const { quantity, unit_price, vat_percentage } = currentItem;
    const totalPrice = quantity * unit_price;
    const vatAmount = vat_percentage === 0 ? 0 : (totalPrice / 6).toFixed(2);

    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        {
          ...currentItem,
          total_price: totalPrice,
          vat_amount: vatAmount
        }
      ]
    });

    setCurrentItem({
      product_name: '',
      product_description: '',
      quantity: '',
      unit_of_measure: '',
      unit_price: '',
      vat_percentage: 20,
      discount: '',
      account_number: ''
    });
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
    try {
      const response = await createOutgoingInvoice(invoice);
      alert('Invoice created successfully!');

      // Update the state with the generated invoice number
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        number: response.number
      }));
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
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
              readOnly
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
              <p>Total Price: {item.total_price}, VAT Amount: {item.vat_amount}</p>
              <button type="button" onClick={() => removeItem(index)} className={styles.removeButton}>Remove</button>
            </div>
          ))}
          <div className={styles.addItemForm}>
            <input
              type="text"
              name="product_name"
              value={currentItem.product_name}
              onChange={handleItemChange}
              placeholder="Product Name"
              className={styles.input}
            />
            <input
              type="text"
              name="product_description"
              value={currentItem.product_description}
              onChange={handleItemChange}
              placeholder="Product Description"
              className={styles.input}
            />
            <input
              type="number"
              name="quantity"
              value={currentItem.quantity}
              onChange={handleItemChange}
              placeholder="Quantity"
              className={styles.input}
            />
            <input
              type="text"
              name="unit_of_measure"
              value={currentItem.unit_of_measure}
              onChange={handleItemChange}
              placeholder="Unit of Measure"
              className={styles.input}
            />
            <input
              type="number"
              name="unit_price"
              value={currentItem.unit_price}
              onChange={handleItemChange}
              placeholder="Unit Price"
              className={styles.input}
            />
            <select
              name="vat_percentage"
              value={currentItem.vat_percentage}
              onChange={handleItemChange}
              className={styles.input}
            >
              <option value={20}>20%</option>
              <option value={0}>0%</option>
            </select>
            <input
                type="text"
                name="discount"
                value={currentItem.discount}
                onChange={handleItemChange}
                placeholder="Discount"
                className={styles.input}
              />
            <input
              type="text"
              name="account_number"
              value={currentItem.account_number}
              onChange={handleItemChange}
              placeholder="Account Number"
              className={styles.input}
            />
            <button type="button" onClick={addItem} className={styles.navButton}>Add Item</button>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Create Invoice</button>
      </form>
    </div>
  );
}

export default CreateOutgoingInvoice;