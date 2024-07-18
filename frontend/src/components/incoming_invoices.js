import React, { useState, useEffect } from 'react';
import { getIncomingInvoices, getIncomingInvoiceItems } from '../services/api';
import '../styles/incoming_invoices.css';

function IncomingInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoicesAndItems();
  }, []);

  const fetchInvoicesAndItems = async () => {
    try {
      const invoicesData = await getIncomingInvoices();
      setInvoices(invoicesData);

      const itemsPromises = invoicesData.map(invoice =>
        getIncomingInvoiceItems(invoice.incoming_invoice_id)
      );
      const itemsData = await Promise.all(itemsPromises);

      const itemsMap = {};
      itemsData.forEach((items, index) => {
        itemsMap[invoicesData[index].incoming_invoice_id] = items;
      });

      setInvoiceItems(itemsMap);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch invoices and items');
      setLoading(false);
    }
  };

  const calculateTotalSum = (invoiceId) => {
    const items = invoiceItems[invoiceId] || [];
    if (items.length === 0) return '0.00';
    return items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2);
  };

  const getUnitOfMeasure = (invoiceId) => {
    const items = invoiceItems[invoiceId] || [];
    return items.length > 0 ? items[0].unit_of_measure : 'N/A';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="incoming-invoices">
      <h2>Incoming Invoices</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Number</th>
            <th>Operation Type</th>
            <th>Counter Agent</th>
            <th>Contract Number</th>
            <th>Total Sum</th>
            <th>Unit of Measure</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.incoming_invoice_id}>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td>{invoice.number}</td>
              <td>{invoice.operation_type}</td>
              <td>{invoice.counter_agent_id}</td>
              <td>{invoice.contract_number}</td>
              <td>{calculateTotalSum(invoice.incoming_invoice_id)}</td>
              <td>{getUnitOfMeasure(invoice.incoming_invoice_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncomingInvoices;