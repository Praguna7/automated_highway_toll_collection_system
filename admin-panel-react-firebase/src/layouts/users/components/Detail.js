// @mui material components
import Grid from "@mui/material/Grid";

// Admin panel React components
import MDBox from "components/MDBox"
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { CircularProgress, OutlinedInput, InputAdornment, IconButton, DialogActions, Dialog, DialogTitle, DialogContent, Typography, Box, TextField, InputLabel, FormControl } from '@mui/material'
import { green } from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import MDSnackbar from "components/MDSnackbar";
import CheckIcon from '@mui/icons-material/Check';

// Admin panel React example components
import * as React from 'react';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Bill from "layouts/users/data/usersDetailCard";
import DataTable from "examples/Tables/DataTable";
import { useParams } from "react-router-dom"

// Data
import cardsNameTable from "layouts/users/data/cardsNameTable"

//firestore
import { db, storage } from "../../../firebase"
import { doc, query, where, collection, getDocs, arrayUnion, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

//modal Styles
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

function Detail() {
  const { id } = useParams()
  const { columns, rows } = cardsNameTable(id)
  const [data, setData] = React.useState({})
  const [userCardModal, setBankCardModal] = React.useState(false);
  const [userCardNotification, setBankCardNotification] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [imageProgress, setImageProgress] = React.useState(0);
  const [imageProgressValue, setImageProgressValue] = React.useState(0);
  const [userCardFile, setBankCardFile] = React.useState('')
  const [selectedBankName, setSelectedBankName] = React.useState({})
  const [vehiclesId, setVehiclesId] = React.useState('')
  const [dbBankCard, setDbBankCard] = React.useState({
    name: '',
    category: ''
  })

  // userCardFile upload
  React.useEffect(() => {
    const uploadBankCardFile = () => {
      const name = userCardFile.name
      const storageRef = ref(storage, `cards/${name}`);;
      const uploadTask = uploadBytesResumable(storageRef, userCardFile);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageProgress(progress)
          setImageProgressValue(progress)
        },
        (error) => {
          console.log("ERROR == ", error)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setDbBankCard((prev) => ({
              ...prev,
              image: downloadURL
            }))
          });
        }
      );

    }
    userCardFile && uploadBankCardFile()
  }, [userCardFile])

  React.useEffect(() => {
    const fetchDataById = onSnapshot(doc(db, "users", id),
      (doc) => (setData(doc.data())),
      (error) => {
        console.log("error == ", error.code)
      })
    return () => {
      fetchDataById()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSpecificBankAndDiscountCard = async (id) => {
    // get data from database
    try {
      const userName = doc(db, "users", id)
      const getSpecificBankName = await getDoc(userName);
      if (getSpecificBankName.exists()) {
        setSelectedBankName(getSpecificBankName.data())
      } else {
        console.log("No such document!");
      }
      const q = query(collection(db, "vehicles"), where("user.uid", "==", id));
      const querySnapshotCarousel = await getDocs(q);
      querySnapshotCarousel.forEach((doc) => {
        setVehiclesId(doc.id)
      })
    } catch (error) {
      console.log('error == ', error)
    }
  };
  React.useEffect(() => {
    fetchSpecificBankAndDiscountCard(id)
  }, [id])

  const onAddBankCard = async (e) => {
    e.preventDefault()
    //post data into firestore
    const updateData = {
      cards: arrayUnion({
        name: dbBankCard.name,
        category: dbBankCard.category,
        image: dbBankCard.image,
      })
    }
    try {
      setLoading(true)
      if (id) {
        const docRef = doc(db, "users", id)
        await setDoc(docRef, updateData, { merge: true })
      }
      if (vehiclesId) {
        const docRef = doc(db, "vehicles", vehiclesId)
        await setDoc(docRef, { user: updateData }, { merge: true })
      }
      userCardModalClose()
      userCardNotificationOpen()
      setDbBankCard({
        name: '',
        category: ''
      })
      setImageProgress(0)
      setImageProgressValue(0)
    }
    catch (error) {
      setError(error.code)
      setLoading(false)
    }
  }

  const userCardModalOpen = () => setBankCardModal(true);
  const userCardModalClose = () => {
    setBankCardModal(false)
    setLoading(false)
    setError('')
    setImageProgress(0)
    setImageProgressValue(0)
  };
  const userCardNotificationOpen = () => setBankCardNotification(true);
  const userCardNotificationClose = () => setBankCardNotification(false);
  return (
    <>
      <MDSnackbar
        color="success"
        icon="check"
        title="Successfully Add Card"
        // content="Hello, world! This is a userCardNotification message"
        // dateTime="11 mins ago"
        open={userCardNotification}
        onClose={userCardNotificationClose}
        close={userCardNotificationClose}
      />
      <BootstrapDialog
        onClose={userCardModalClose}
        aria-labelledby="customized-dialog-title"
        open={userCardModal}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={userCardModalClose}>
          <Typography variant="h3" color="secondary.main" sx={{ pt: 1, textAlign: "center" }}>Add Bank Card</Typography>
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 2, maxWidth: "100%", display: "flex", direction: "column", justifyContent: "center" },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Bank"
              InputProps={{
                readOnly: true,
              }}
              color="secondary"
              required
              value={selectedBankName.name}
            />
            <TextField
              label="Card Name"
              type="text"
              color="secondary"
              required
              value={dbBankCard.name}
              onChange={(e) => {
                setDbBankCard({
                  ...dbBankCard,
                  name: e.target.value
                })
              }}
            />
            <TextField
              label="Card Category"
              type="text"
              color="secondary"
              required
              value={dbBankCard.category}
              onChange={(e) => {
                setDbBankCard({
                  ...dbBankCard,
                  category: e.target.value
                })
              }}
            />
            <Box sx={{ maxWidth: "100%", m: 2 }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="outlined-adornment-amount">Card Image</InputLabel>
                <OutlinedInput
                  sx={{ height: '2.8rem' }}
                  id="outlined-adornment-amount"
                  startAdornment={<><InputAdornment position="start">
                    <input multiple type="File"
                      onChange={(e) => setBankCardFile(e.target.files[0])}
                    />
                  </InputAdornment>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    size={25}
                    sx={{
                      color: green[500],
                    }}
                    value={imageProgress} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {imageProgressValue === 100 ? <CheckIcon /> : null}
                  </Box>
                </Box></>}
                  label="Card Image"
                />
              </FormControl>
            </Box>
            {error === '' ? null :
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
                  // defaultValue="Invalid Data!"
                  value={error}
                  variant="standard"
                />
              </MDBox>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          {loading ?
            <CircularProgress
              size={30}
              sx={{
                color: green[500],
              }}
            /> : <MDButton
              variant="contained" color="info" type="submit" onClick={onAddBankCard}>Add Card</MDButton>
          }
        </DialogActions>
      </BootstrapDialog>

      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox pt={3} px={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ textAlign: 'center' }}>
                      Bank Detail
                    </MDTypography>
                  </MDBox>
                  <MDBox pt={1} pb={2} px={2}>
                    <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                      {data && <Bill
                        name={data.name}
                        contactNo={data.contactNo}
                        address={data.address}
                        image={data.image}
                        dataId={id}
                      />}
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
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
                        Bank Cards
                      </MDTypography>
                      <MDButton variant="gradient" color="light"
                        onClick={() => {
                          userCardModalOpen()
                        }}>
                        <Icon sx={{ fontWeight: "bold" }}>add</Icon>
                        &nbsp;ADD BANK CARD
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
                      dataId={id}
                    />
                  </MDBox>
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

export default Detail;
