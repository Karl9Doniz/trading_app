import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  Button,
  Box,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const InvoiceItemsTable = ({ invoice, setInvoice, errors }) => {
  const [rows, setRows] = useState([]);
  const [editRowsModel, setEditRowsModel] = useState({});

  useEffect(() => {
    setRows(invoice.items.map((item, index) => ({ ...item, id: index })));
  }, [invoice.items]);

  const calculateTotalPriceAndVAT = (row) => {
    const quantity = Number(row.quantity) || 0;
    const unitPrice = Number(row.unit_price) || 0;
    const vatPercentage = Number(row.vat_percentage) || 0;

    const totalPrice = quantity * unitPrice;
    const vatAmount = vatPercentage === 20 ? totalPrice / 6 : 0;

    return { totalPrice, vatAmount };
  };

  const handleProcessRowUpdate = (newRow) => {
    const { totalPrice, vatAmount } = calculateTotalPriceAndVAT(newRow);
    const updatedRow = { ...newRow, total_price: totalPrice, vat_amount: vatAmount };
    setRows((prevRows) => prevRows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: prevInvoice.items.map((item, index) =>
        index === newRow.id ? updatedRow : item
      ),
    }));
    return updatedRow;
  };

  const handleDeleteRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    setRows(updatedRows);
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: updatedRows,
    }));
  };

  const addNewRow = () => {
    const newItem = {
      id: rows.length,
      product_name: '',
      product_description: '',
      quantity: 0,
      unit_of_measure: '',
      unit_price: 0,
      vat_percentage: 20,
      account_number: '',
      total_price: 0,
      vat_amount: 0,
    };
    setRows([...rows, newItem]);
    setInvoice((prevInvoice) => ({
      ...prevInvoice,
      items: [...prevInvoice.items, newItem],
    }));
  };

  const handleEditClick = (id) => {
    setEditRowsModel({ ...editRowsModel, [id]: true });
  };

  const handleSaveClick = (id) => {
    setEditRowsModel({ ...editRowsModel, [id]: false });
  };

  const columns = [
    { field: 'product_name', headerName: 'Product Name', width: 150, editable: (params) => !!editRowsModel[params.id] },
    { field: 'product_description', headerName: 'Description', width: 200, editable: (params) => !!editRowsModel[params.id] },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 100, editable: (params) => !!editRowsModel[params.id] },
    { field: 'unit_of_measure', headerName: 'Unit', width: 100, editable: (params) => !!editRowsModel[params.id] },
    { field: 'unit_price', headerName: 'Price', type: 'number', width: 100, editable: (params) => !!editRowsModel[params.id] },
    {
      field: 'vat_percentage',
      headerName: 'VAT %',
      width: 100,
      editable: (params) => !!editRowsModel[params.id],
      type: 'singleSelect',
      valueOptions: [
        { value: 20, label: '20%' },
        { value: 0, label: '0%' },
      ],
    },
    { field: 'account_number', headerName: 'Account', width: 120, editable: (params) => !!editRowsModel[params.id] },
    {
      field: 'total_price',
      headerName: 'Total Price',
      width: 120,
    },
    {
      field: 'vat_amount',
      headerName: 'VAT',
      width: 120,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = editRowsModel[id];
        return isInEditMode
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={() => handleSaveClick(id)}
                color="primary"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                onClick={() => handleEditClick(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDeleteRow(id)}
                color="inherit"
              />,
            ];
      },
    },
  ];

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" gutterBottom component="div">
        Invoice Items
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        components={{ Toolbar: GridToolbar }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={addNewRow}>
        Add New Item
      </Button>
    </Box>
  );
};

export default InvoiceItemsTable;
