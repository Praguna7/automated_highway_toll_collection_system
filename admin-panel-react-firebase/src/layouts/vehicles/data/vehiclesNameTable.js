import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";
import { AuthContext } from "context/AuthContext";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

function Data() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { currentUser, role } = useContext(AuthContext);

  useEffect(() => {
    if (role === 'user') {
      const q = query(collection(db, "vehicles"), where("userId", "==", currentUser));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(vehiclesData);
      });

      return () => unsubscribe();
    }
    else if(role === 'admin') {
      const q = query(collection(db, "vehicles"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const vehiclesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(vehiclesData);
      });

      return () => unsubscribe();
    }
  }, [currentUser, role]);

  const handleClickOpen = (vehicle) => {
    console.log("delete clicked")
    setSelectedVehicle(vehicle);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVehicle(null);
  };

  const handleDelete = async () => {
    if (selectedVehicle) {
      try {
        console.log("Deleting vehicle: ", selectedVehicle.id);
        await deleteDoc(doc(db, "vehicles", selectedVehicle.id));
        setOpen(false);
        setSelectedVehicle(null);
      } catch (error) {
        console.error("Error deleting vehicle: ", error);
      }
    }
  };

  const VEHICLE_INFO = ({ licensePlate, vehicleType }) => (
    <MDBox lineHeight={1}>
      <MDTypography variant="body2" fontWeight="medium">
        {licensePlate}
      </MDTypography>
      <MDTypography variant="caption" color="text" fontWeight="regular">
        {vehicleType}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "Vehicle License Plate Number", accessor: "licensePlate", align: "left" },
      { Header: "Vehicle Type", accessor: "vehicleType", align: "left" },
      { Header: "Action", accessor: "action", width: '10%', align: "right" }
    ],
    rows: vehicles.map((vehicle, index) => ({
      licensePlate: <VEHICLE_INFO licensePlate={vehicle.licensePlate} vehicleType={vehicle.vehicleType} />,
      vehicleType: vehicle.vehicleType,
      action: (
        <IconButton onClick={() => handleClickOpen(vehicle)} color="error">
          <DeleteIcon />
        </IconButton>
      )
    })),
    dialog: (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Vehicle"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this vehicle?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  };
}

export default Data;