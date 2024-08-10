// @mui material components
import Grid from "@mui/material/Grid";

// Admin panel React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { green } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import DataTable from "examples/Tables/DataTable";
import MDTypography from "components/MDTypography";

// Admin panel React example components
import * as React from 'react';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { CircularProgress, Divider, Box, InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, IconButton, DialogContent, TextField, DialogActions, Card, Icon } from '@mui/material'
import { useContext } from "react";
import { AuthContext } from "context/AuthContext";

// Data
import vehiclesNameTable from "layouts/vehicles/data/vehiclesNameTable";

// Firestore
import { db } from "../../firebase"
import { collection, addDoc } from "firebase/firestore";

// Modal Styles
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}
BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

function Vehicles() {
  const { columns, rows, dialog } = vehiclesNameTable();
  const { currentUser } = useContext(AuthContext)

  const [vehicleModal, setVehicleModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [selectedVehicleType, setselectedVehicleType] = React.useState('');
  const [vehicleTableData, setVehicleTableData] = React.useState([])

  const [licensePlate, setLicensePlate] = React.useState("")
  const vehicleTypes = [
    { id: 1, name: "Light Vehicle" },
    { id: 2, name: "Heavy Vehicle" },
    { id: 3, name: "Long Vehicle" },
    { id: 4, name: "Special Purpose Vehicle" }
  ]

  const validateLicensePlate = (plate) => {
    const regex = /^[^ABQRTUVWXYZ][A-Z]{1,2}\d{4}$/;
    return regex.test(plate);
  }

  const onAddVehicle = async (e) => {
    e.preventDefault();
    if (!selectedVehicleType) {
      setError('Vehicle category is required.');
      return;
    }
    if (!validateLicensePlate(licensePlate)) {
      setError('Invalid license plate number. Enter your license plate without spaces and provice. Bikes and 3-wheelers are not allowed.');
      return;
    }

    // Post data into Firestore
    try {
      setLoading(true);
      console.log({
        userId: currentUser,
        licensePlate: licensePlate,
        vehicleType: selectedVehicleType
      });
      await addDoc(collection(db, "vehicles"), {
        userId: currentUser,
        licensePlate: licensePlate,
        vehicleType: selectedVehicleType
      });
      vehicleModalClose();
      setLicensePlate("");
      setVehicleTableData([]);
      setselectedVehicleType('');
    } catch (error) {
      setError(error.code);
      setLoading(false);
    }
  }

  const vehicleModalOpen = () => setVehicleModal(true);
  const vehicleModalClose = () => {
    setVehicleModal(false);
    setVehicleTableData([]);
    setselectedVehicleType('');
    setLoading(false);
    setError('');
  };

  return (
    <>
      <BootstrapDialog
        onClose={vehicleModalClose}
        aria-labelledby="customized-dialog-title"
        open={vehicleModal}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={vehicleModalClose}>
        </BootstrapDialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 2, maxWidth: "100%", display: "flex", direction: "column", justifyContent: "center" },
            }}
            noValidate
            autoComplete="off"
          >
            <MDInput
              type="text"
              label="License Plate"
              required
              value={licensePlate}
              error={Boolean(error)}
              helperText={error && error.startsWith('Invalid license plate number') ? error : ''}
              onChange={(e) => {
                setError('');
                setLicensePlate(e.target.value.toUpperCase());
              }}
            />
            <Box sx={{ maxWidth: "100%", m: 2 }}>
              <FormControl fullWidth error={Boolean(error && error === 'Vehicle category is required.')}>
                <InputLabel id="demo-simple-select-label" sx={{ height: "2.8rem" }} required>Vehicle Category</InputLabel>
                <Select
                  sx={{ height: "2.8rem" }}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Vehicle Type"
                  value={selectedVehicleType}
                  onChange={(e) => {
                    setError('');
                    setselectedVehicleType(e.target.value);
                  }}
                >
                  {vehicleTypes.map((items) => (
                    <MenuItem key={items.id} value={items.name}>{items.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Divider />
            {error && error !== 'Vehicle category is required.' && error !== 'Invalid license plate number' && (
              <MDBox mb={2} p={1}>
                <TextField
                  error
                  id="standard-error"
                  label="Error"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      "& input": {
                        color: "red",
                      }
                    }
                  }}
                  value={error}
                  variant="standard"
                />
              </MDBox>
            )}
            <MDBox mt={1} p={1} sx={{ display: 'flex', direction: 'row', justifyContent: "center" }}>
              {loading ?
                <CircularProgress
                  size={30}
                  sx={{
                    color: green[500],
                  }}
                /> : <MDButton variant="contained" color="info" type="submit"
                  onClick={onAddVehicle}
                >Save</MDButton>
              }
            </MDBox>
          </Box>
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </BootstrapDialog>

      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                  >
                    <MDBox pt={2} pb={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h6" fontWeight="medium" color="white">
                        My Vehicles
                      </MDTypography>
                      <MDButton variant="gradient" color="light"
                        onClick={vehicleModalOpen}>
                        <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                        &nbsp;ADD VEHICLE
                      </MDButton>
                    </MDBox>
                  </MDBox>
                  <MDBox pt={3}>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                  {dialog}
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    </>
  );
}

export default Vehicles;
