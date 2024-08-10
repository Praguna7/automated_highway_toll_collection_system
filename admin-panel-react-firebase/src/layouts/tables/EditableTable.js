import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import InputLabel from '@mui/material/InputLabel';

import { db } from "../../firebase"; // Adjust the import according to your project structure
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { Delete, Edit } from "@mui/icons-material";

const EditableTable = ({ columns, collectionName, editable = true }) => {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [newRow, setNewRow] = useState(columns.reduce((acc, col) => ({ ...acc, [col.name]: "" }), {}));

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const fetchedRows = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRows(fetchedRows);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const handleInputChange = (e, field) => {
    setSelectedRow({ ...selectedRow, [field]: e.target.value });
  };

  const handleAddRowChange = (e, field) => {
    setNewRow({ ...newRow, [field]: e.target.value });
  };

  const handleSaveRow = async () => {
    if (selectedRow.id) {
      await updateDoc(doc(db, collectionName, selectedRow.id), selectedRow);
    } else {
      const docRef = await addDoc(collection(db, collectionName), selectedRow);
      setRows((prevRows) => prevRows.map((r) => (r.id === selectedRow.id ? { ...r, id: docRef.id } : r)));
    }
    setDialogOpen(false);
  };

  const handleDeleteRow = async () => {
    if (rowToDelete.id) {
      await deleteDoc(doc(db, collectionName, rowToDelete.id));
    }
    setRows(rows.filter((row) => row.id !== rowToDelete.id));
    setDeleteDialogOpen(false);
  };

  const handleAddRow = async () => {
    if (Object.values(newRow).every((value) => value)) {
      const docRef = await addDoc(collection(db, collectionName), newRow);
      setRows([...rows, { ...newRow, id: docRef.id }]);
      setNewRow(columns.reduce((acc, col) => ({ ...acc, [col.name]: "" }), {}));
    }
  };

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const renderInputField = (col, value, onChange) => {
    switch (col.type) {
      case "text":
        return (
          <TextField
            value={value}
            onChange={onChange}
            placeholder={col.name.charAt(0).toUpperCase() + col.name.slice(1)}
            
            
          />
        );
      case "number":
        return (
          <TextField
            type="number"
            value={value}
            onChange={onChange}
            placeholder={col.name.charAt(0).toUpperCase() + col.name.slice(1)}
          />
        );
      case "dropdown":
        return (
          <>
          <InputLabel>{col.name}</InputLabel>
          <Select 
          value={value} 
          onChange={onChange} 
          fullWidth
          >
            {col.options.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          </>
        );
      default:
        return (
          <TextField
            value={value}
            onChange={onChange}
            placeholder={col.name.charAt(0).toUpperCase() + col.name.slice(1)}
            fullWidth
          />
        );
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 100 , maxWidth: 1000}} aria-label="simple table">
        <TableHead sx={{ display: "table-header-group" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.name} align="center">
                {col.name.charAt(0).toUpperCase() + col.name.slice(1)}
              </TableCell>
            ))}
            {editable && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              {columns.map((col) => (
                <TableCell key={col.name} align="center">
                  {row[col.name]}
                </TableCell>
              ))}
              {editable && (
                <TableCell align="center">
                  <IconButton onClick={() => handleEditClick(row)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(row)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
          {editable && (
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.name} align="center">
                  {renderInputField(col, newRow[col.name], (e) => handleAddRowChange(e, col.name))}
                </TableCell>
              ))}
              <TableCell align="center">
                <Button onClick={handleAddRow}>Add</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {columns.map((col) => (
            <Box key={col.name} mb={2}>
              {renderInputField(col, selectedRow ? selectedRow[col.name] : "", (e) => handleInputChange(e, col.name))}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveRow} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Row</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this row?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteRow} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default EditableTable;
