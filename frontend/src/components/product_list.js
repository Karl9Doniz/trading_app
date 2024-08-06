import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductsByDateAndStorage } from '../services/api';
import styles from '../styles/product_list.module.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [storageNames, setStorageNames] = useState({});

  useEffect(() => {
    if (selectedDate) {
      fetchProducts(selectedDate);
    }
  }, [selectedDate]);

  const fetchProducts = async (date) => {
    try {
      const productsData = await getProductsByDateAndStorage(date);
      setProducts(productsData);

      const storageIds = [...new Set(productsData.map(product => product.storage_id))];
      const storageNamesData = await Promise.all(storageIds.map(async (id) => {
        const response = await fetch(`/api/storages/${id}`);
        const data = await response.json();
        return { id, name: data.name };
      }));

      const storageNamesMap = storageNamesData.reduce((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {});
      setStorageNames(storageNamesMap);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const groupProductsByStorage = (products) => {
    return products.reduce((acc, product) => {
      if (!acc[product.storage_id]) {
        acc[product.storage_id] = { products: [], total: 0 };
      }
      acc[product.storage_id].products.push(product);
      acc[product.storage_id].total += product.unit_price * product.current_stock;  // Calculate total price
      return acc;
    }, {});
  };

  const groupedProducts = groupProductsByStorage(products);

  return (
    <div className={styles.productList}>
      <h1>Product Inventory</h1>
      <div className={styles.navigation}>
        <Link to="/incoming-invoices" className={styles.navButton}>View Incoming Invoices</Link>
        <Link to="/outgoing-invoices" className={styles.navButton}>View Outgoing Invoices</Link>
      </div>
      <div className={styles.dateFilter}>
        <label htmlFor="dateFilter">Filter by date:</label>
        <input
          type="date"
          id="dateFilter"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
      {Object.entries(groupedProducts).map(([storageId, { products: storageProducts, total }]) => (
        <div key={storageId} className={styles.storageGroup}>
          <h2>{storageNames[storageId] || 'Unknown Storage'} (Total Price: ${total.toFixed(2)})</h2>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Description</th>
                <th>Unit of Measure</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {storageProducts.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.unit_of_measure}</td>
                  <td>${product.unit_price.toFixed(2)}</td>
                  <td>{product.current_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
