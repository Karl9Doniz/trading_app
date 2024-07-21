import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import styles from '../styles/product_list.module.css';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className={styles.productList}>
      <h2>Product List</h2>
      <Link to="/incoming-invoices" className={styles.navButton}>
        View Incoming Invoices
      </Link>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Unit of Measure</th>
            <th>Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.unit_of_measure}</td>
              <td>{product.unit_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;