import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createIncomingInvoice, getSuppliers, getOrganizations, getStorages, getEmployees, getNextInvoiceNumber } from '../services/api';
import styles from '../styles/create_incoming_invoice.module.css';

function CreateIncomingInvoice() {
  const [invoice, setInvoice] = useState({
    number: '',
    date: '',
    counter_agent_id: '',
    operation_type: '',
    organization_id: '',
    storage_id: '',
    contract_number: '',
    responsible_person_id: '',
    comment: '',
    items: []
  });

  const [errors, setErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [storages, setStorages] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchDropdownData();
    fetchNextInvoiceNumber();
  }, []);

  const fetchDropdownData = async () => {
    const suppliersData = await getSuppliers();
    const organizationsData = await getOrganizations();
    const storagesData = await getStorages();
    const employeesData = await getEmployees();

    setSuppliers(suppliersData);
    setOrganizations(organizationsData);
    setStorages(storagesData);
    setEmployees(employeesData);
  };

  const fetchNextInvoiceNumber = async () => {
    try {
      const response = await getNextInvoiceNumber();
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
    vat_percentage: 20,
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
      const response = await createIncomingInvoice(invoice);
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
      <h2 className={styles.title}>Create Incoming Invoice</h2>
      <Link to="/incoming-invoices" className={styles.navButton}>
        View All Invoices
      </Link>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.invoiceSection}>
          <h3 className={styles.sectionTitle}>Invoice Details</h3>
          <input
            type="text"
            name="number"
            value={invoice.number}
            readOnly
            className={styles.input}
          />
          {errors.number && <span className={styles.errorMessage}>{errors.number}</span>}
          <input
            type="datetime-local"
            name="date"
            value={invoice.date}
            onChange={handleInvoiceChange}
            className={styles.input}
          />
          {errors.date && <span className={styles.errorMessage}>{errors.date}</span>}
          <select
            name="counter_agent_id"
            value={invoice.counter_agent_id}
            onChange={handleInvoiceChange}
            className={styles.input}
          >
            <option value="">Select Supplier</option>
            {suppliers.map(supplier => (
              <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>
            ))}
          </select>
          {errors.supplier_id && <span className={styles.errorMessage}>{errors.supplier_id}</span>}
          <input
            type="text"
            name="operation_type"
            value={invoice.operation_type}
            onChange={handleInvoiceChange}
            placeholder="Operation Type"
            className={styles.input}
          />
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
          <input
            type="text"
            name="contract_number"
            value={invoice.contract_number}
            onChange={handleInvoiceChange}
            placeholder="Contract Number"
            className={styles.input}
          />
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
          <textarea
            name="comment"
            value={invoice.comment}
            onChange={handleInvoiceChange}
            placeholder="Comment"
            className={styles.textarea}
          />
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
              name="account_number"
              value={currentItem.account_number}
              onChange={handleItemChange}
              placeholder="Account Number"
              className={styles.input}
            />
            <button type="button" onClick={addItem} className={styles.navButton}>Add Item</button>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Submit</button>
      </form>
    </div>
  );
}

export default CreateIncomingInvoice;
