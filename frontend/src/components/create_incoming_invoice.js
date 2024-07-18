import React, { useState } from 'react';
import { createIncomingInvoice, createIncomingInvoiceItem } from '../services/api';
import styles from '../styles/create_incoming_invoice.css';

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
    comment: ''
  });

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: '',
    unit_of_measure: '',
    unit_price: '',
    total_price: '',
    vat_percentage: '',
    vat_amount: '',
    account_number: ''
  });

  const handleInvoiceChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    setItems([...items, currentItem]);
    setCurrentItem({
      product_id: '',
      quantity: '',
      unit_of_measure: '',
      unit_price: '',
      total_price: '',
      vat_percentage: '',
      vat_amount: '',
      account_number: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceResponse = await createIncomingInvoice(invoice);
      const invoiceId = invoiceResponse.data.id; // Assuming the API returns the created invoice ID

      for (let item of items) {
        await createIncomingInvoiceItem({ ...item, incoming_invoice_id: invoiceId });
      }

      alert('Invoice and items created successfully!');
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Incoming Invoice</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.invoiceSection}>
          <h3>Invoice Details</h3>
          <input
            type="text"
            name="number"
            value={invoice.number}
            onChange={handleInvoiceChange}
            placeholder="Invoice Number"
            className={styles.input}
          />
          <input
            type="datetime-local"
            name="date"
            value={invoice.date}
            onChange={handleInvoiceChange}
            className={styles.input}
          />
          <input
            type="number"
            name="counter_agent_id"
            value={invoice.counter_agent_id}
            onChange={handleInvoiceChange}
            placeholder="Counter Agent ID"
            className={styles.input}
          />
          <input
            type="text"
            name="operation_type"
            value={invoice.operation_type}
            onChange={handleInvoiceChange}
            placeholder="Operation Type"
            className={styles.input}
          />
          <input
            type="number"
            name="organization_id"
            value={invoice.organization_id}
            onChange={handleInvoiceChange}
            placeholder="Organization ID"
            className={styles.input}
          />
          <input
            type="number"
            name="storage_id"
            value={invoice.storage_id}
            onChange={handleInvoiceChange}
            placeholder="Storage ID"
            className={styles.input}
          />
          <input
            type="text"
            name="contract_number"
            value={invoice.contract_number}
            onChange={handleInvoiceChange}
            placeholder="Contract Number"
            className={styles.input}
          />
          <input
            type="number"
            name="responsible_person_id"
            value={invoice.responsible_person_id}
            onChange={handleInvoiceChange}
            placeholder="Responsible Person ID"
            className={styles.input}
          />
          <textarea
            name="comment"
            value={invoice.comment}
            onChange={handleInvoiceChange}
            placeholder="Comment"
            className={styles.textarea}
          />
        </div>

        <div className={styles.itemsSection}>
          <h3>Invoice Items</h3>
          {items.map((item, index) => (
            <div key={index} className={styles.item}>
              <p>Product ID: {item.product_id}, Quantity: {item.quantity}, Price: {item.unit_price}</p>
            </div>
          ))}
          <div className={styles.addItemForm}>
            <input
              type="number"
              name="product_id"
              value={currentItem.product_id}
              onChange={handleItemChange}
              placeholder="Product ID"
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
            <input
              type="number"
              name="total_price"
              value={currentItem.total_price}
              onChange={handleItemChange}
              placeholder="Total Price"
              className={styles.input}
            />
            <input
              type="number"
              name="vat_percentage"
              value={currentItem.vat_percentage}
              onChange={handleItemChange}
              placeholder="VAT Percentage"
              className={styles.input}
            />
            <input
              type="number"
              name="vat_amount"
              value={currentItem.vat_amount}
              onChange={handleItemChange}
              placeholder="VAT Amount"
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
            <button type="button" onClick={addItem} className={styles.button}>Add Item</button>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Create Invoice</button>
      </form>
    </div>
  );
}

export default CreateIncomingInvoice;