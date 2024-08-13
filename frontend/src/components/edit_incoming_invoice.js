import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceIncoming, updateInvoice, deleteInvoice, getSuppliers, getOrganizations, getStorages, getEmployees } from '../services/api';
import { Link } from 'react-router-dom';
import styles from '../styles/edit_incoming_invoice.module.css';

function EditIncomingInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [storages, setStorages] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [errors, setErrors] = useState({});
    const [currentItem, setCurrentItem] = useState({
        product_name: '',
        product_description: '',
        quantity: '',
        unit_of_measure: '',
        unit_price: '',
        total_price: '',
        vat_percentage: '',
        vat_amount: '',
        account_number: ''
    });

    useEffect(() => {
        fetchInvoice();
        fetchDropdownData();
    }, [id]);

    const fetchInvoice = async () => {
        const data = await getInvoiceIncoming(id);
        setInvoice(data);
    };

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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!invoice.date) newErrors.date = 'Date is required';
        if (!invoice.counter_agent_id) newErrors.counter_agent_id = 'Supplier is required';
        if (!invoice.operation_type) newErrors.operation_type = 'Operation type is required';
        if (!invoice.organization_id) newErrors.organization_id = 'Organization is required';
        if (!invoice.storage_id) newErrors.storage_id = 'Storage is required';
        if (!invoice.responsible_person_id) newErrors.responsible_person_id = 'Responsible person is required';
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
            await updateInvoice(id, invoice);
            setIsEditing(false);
            alert('Invoice updated successfully!');
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('Failed to update invoice. Please try again.');
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteInvoice(id);
            navigate('/incoming-invoices');
            alert('Invoice deleted successfully!');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Failed to delete invoice. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoice({ ...invoice, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleCurrentItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({ ...currentItem, [name]: value });
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const validateItem = () => {
        const itemErrors = {};
        if (!currentItem.product_name) itemErrors.product_name = 'Product name is required';
        if (!currentItem.quantity) itemErrors.quantity = 'Quantity is required';
        if (!currentItem.unit_price) itemErrors.unit_price = 'Unit price is required';

        setErrors(prevErrors => ({ ...prevErrors, ...itemErrors }));
        return Object.keys(itemErrors).length === 0;
    };

    const addItem = () => {
        if (!validateItem()) {
            return;
        }

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
        setInvoice({ ...invoice, items: updatedItems });
    };

    if (!invoice) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Edit Incoming Invoice</h2>
            <Link to="/incoming-invoices" className={styles.navButton}>
                View All Invoices
            </Link>
            <form className={styles.form}>
                <div className={styles.invoiceSection}>
                    <h3 className={styles.sectionTitle}>Invoice Details</h3>
                    <input
                        type="text"
                        name="number"
                        value={invoice.number}
                        readOnly
                        className={styles.input}
                    />
                    <input
                        type="datetime-local"
                        name="date"
                        value={invoice.date}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    />
                    {errors.date && <span className={styles.errorMessage}>{errors.date}</span>}
                    <select
                        name="counter_agent_id"
                        value={invoice.counter_agent_id}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.counter_agent_id ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>
                        ))}
                    </select>
                    {errors.counter_agent_id && <span className={styles.errorMessage}>{errors.counter_agent_id}</span>}
                    <input
                        type="text"
                        name="operation_type"
                        value={invoice.operation_type}
                        onChange={handleChange}
                        placeholder="Operation Type"
                        className={`${styles.input} ${errors.operation_type ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    />
                    {errors.operation_type && <span className={styles.errorMessage}>{errors.operation_type}</span>}
                    <select
                        name="organization_id"
                        value={invoice.organization_id}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.organization_id ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    >
                        <option value="">Select Organization</option>
                        {organizations.map(org => (
                            <option key={org.organization_id} value={org.organization_id}>{org.name}</option>
                        ))}
                    </select>
                    {errors.organization_id && <span className={styles.errorMessage}>{errors.organization_id}</span>}
                    <select
                        name="storage_id"
                        value={invoice.storage_id}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.storage_id ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    >
                        <option value="">Select Storage</option>
                        {storages.map(storage => (
                            <option key={storage.storage_id} value={storage.storage_id}>{storage.name}</option>
                        ))}
                    </select>
                    {errors.storage_id && <span className={styles.errorMessage}>{errors.storage_id}</span>}
                    <input
                        type="text"
                        name="contract_number"
                        value={invoice.contract_number}
                        onChange={handleChange}
                        placeholder="Contract Number"
                        className={styles.input}
                        disabled={!isEditing}
                    />
                    <select
                        name="responsible_person_id"
                        value={invoice.responsible_person_id}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.responsible_person_id ? styles.inputError : ''}`}
                        disabled={!isEditing}
                    >
                        <option value="">Select Responsible Person</option>
                        {employees.map(employee => (
                            <option key={employee.employee_id} value={employee.employee_id}>
                                {`${employee.first_name} ${employee.last_name}`}
                            </option>
                        ))}
                    </select>
                    {errors.responsible_person_id && <span className={styles.errorMessage}>{errors.responsible_person_id}</span>}
                    <textarea
                        name="comment"
                        value={invoice.comment}
                        onChange={handleChange}
                        placeholder="Comment"
                        className={styles.textarea}
                        disabled={!isEditing}
                    />
                </div>

                <div className={styles.itemsSection}>
                    <h3 className={styles.sectionTitle}>Invoice Items</h3>
                    {invoice.items.map((item, index) => (
                        <div key={index} className={styles.item}>
                            <p>Product: {item.product_name}, Quantity: {item.quantity}, Price: {item.unit_price}</p>
                            <p>Total Price: {item.total_price}, VAT Amount: {item.vat_amount}</p>
                            {isEditing && (
                                <button type="button" onClick={() => removeItem(index)} className={styles.removeButton}>Remove</button>
                            )}
                        </div>
                    ))}
                    {errors.items && <span className={styles.errorMessage}>{errors.items}</span>}
                    {isEditing && (
                        <div className={styles.addItemForm}>
                            <input
                                type="text"
                                name="product_name"
                                value={currentItem.product_name}
                                onChange={handleCurrentItemChange}
                                placeholder="Product Name"
                                className={`${styles.input} ${errors.product_name ? styles.inputError : ''}`}
                            />
                            {errors.product_name && <span className={styles.errorMessage}>{errors.product_name}</span>}
                            <input
                                type="text"
                                name="product_description"
                                value={currentItem.description}
                                onChange={handleCurrentItemChange}
                                placeholder="Product Description"
                                className={styles.input}
                            />
                            <input
                                type="number"
                                name="quantity"
                                value={currentItem.quantity}
                                onChange={handleCurrentItemChange}
                                placeholder="Quantity"
                                className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
                            />
                            {errors.quantity && <span className={styles.errorMessage}>{errors.quantity}</span>}
                            <input
                                type="text"
                                name="unit_of_measure"
                                value={currentItem.unit_of_measure}
                                onChange={handleCurrentItemChange}
                                placeholder="Unit of Measure"
                                className={styles.input}
                            />
                            <input
                                type="number"
                                name="unit_price"
                                value={currentItem.unit_price}
                                onChange={handleCurrentItemChange}
                                placeholder="Unit Price"
                                className={`${styles.input} ${errors.unit_price ? styles.inputError : ''}`}
                            />
                            {errors.unit_price && <span className={styles.errorMessage}>{errors.unit_price}</span>}
                            <select
                                name="vat_percentage"
                                value={currentItem.vat_percentage}
                                onChange={handleCurrentItemChange}
                                className={styles.input}
                            >
                                <option value={20}>20%</option>
                                <option value={0}>0%</option>
                            </select>
                            <input
                                type="text"
                                name="account_number"
                                value={currentItem.account_number}
                                onChange={handleCurrentItemChange}
                                placeholder="Account Number"
                                className={styles.input}
                            />
                            <button type="button" onClick={addItem} className={styles.button}>Add Item</button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <button type="button" onClick={handleSave} className={styles.submitButton}>Save</button>
                ) : (
                    <button type="button" onClick={handleEdit} className={styles.submitButton}>Edit</button>
                )}
                <button type="button" onClick={handleDelete} className={styles.submitButton}>Delete</button>
            </form>

            {showDeleteConfirm && (
                <div className={styles.confirmationOverlay}>
                    <div className={styles.confirmationBox}>
                        <p>Are you sure you want to delete this invoice?</p>
                        <button onClick={confirmDelete} className={styles.confirmationButton}>Yes</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className={styles.confirmationButton}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditIncomingInvoice;