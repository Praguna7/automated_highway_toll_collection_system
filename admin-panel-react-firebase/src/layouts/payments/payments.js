import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import { Typography, Paper, Divider, Stack, Tooltip, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { blueGrey } from "@mui/material/colors";

// Firebase
import { db } from "../../firebase";
import { collection, doc, setDoc, updateDoc, getDocs,getDoc,query } from "firebase/firestore";

import { AuthContext } from "context/AuthContext";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Payments() {
  const [data] = useState([]);
  const [balance, setBalance] = useState(0.00);
  const [topupAmount, setTopupAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);
  const [maxToll,setMaxToll] = useState(0)

  const fetchBalance = async () => {
    const balanceDoc = await getDoc(doc(db, 'balances', currentUser));
    if (balanceDoc.exists()) {
      setBalance(balanceDoc.data().balance);
    } else {
      // Create a new balance document for the first-time user
      await setDoc(doc(db, 'balances', currentUser), { balance: 0 });
      setBalance(0);
    }

    const chargesSnapshot = await getDocs(query(collection(db, "charges")))
      let maxCharge = 0;
      chargesSnapshot.forEach((doc)=>{
        let chg = parseFloat(doc.data().Charge)
        if(chg>maxCharge) maxCharge=chg
      })
      setMaxToll(maxCharge.toFixed(2))
  };

  useEffect(() => {
    if (currentUser) {
      fetchBalance();
    }
  }, [currentUser]);

  const handleClickOpen = async () => {
    const topupAmountValue = parseFloat(topupAmount);
    if (topupAmountValue >= 500) {
      const newBalance = balance + topupAmountValue;
      setBalance(newBalance);
      await updateDoc(doc(db, 'balances', currentUser), { balance: newBalance });
      handleClose();
    } else {
      setError('Minimum top-up amount is 500 rupees.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTopupAmount('');
    setError('');
  };

  const handleTopupAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setTopupAmount(value);
      if (error) setError('');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
                <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                    icon="attach_money"
                    title="Account Balance"
                    count={"Rs: "+ parseFloat(balance).toFixed(2)}
                    percentage={{
                        label: `Minimum balance of Rs ${maxToll} is required to enter the expressway.`,
                    }}
                    />
                </MDBox>
            </Grid>
            <Grid item xs={12} md={9} lg={12} mx={'auto'}>
              <Paper elevation={5} sx={{
                margin: "0, auto",
                borderRadius: "1.5rem",
                width: '100%',
                p: 2
              }}>
                <Typography variant="h3" color="secondary.main" sx={{ pt: 2, textAlign: "center" }}>Payments</Typography>
                <Divider />

                <TextField
                  margin="dense"
                  id="topupAmount"
                  label="Top Up Amount"
                  type="number"
                  fullWidth
                  value={topupAmount}
                  onChange={handleTopupAmountChange}
                  error={!!error}
                  helperText={error}
                />
                <Button variant="contained" sx={{ color: 'white !important', '& .MuiSvgIcon-root': { color: 'white !important' }, marginTop:2,marginBottom:2 }} onClick={handleClickOpen}>
                  Top Up
                </Button>
                <Dialog open={open} onClose={handleClose} aria-labelledby="topup-dialog-title">
                  <DialogTitle id="topup-dialog-title">Top Up Account</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Enter your payment details to top up your account.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
                {data.map((items, index) => (
                  <Paper key={items.id} elevation={5} sx={{ m: 2, pt: 1, borderRadius: '0.5rem', pb: 1 }}>
                    <Stack direction="row" spacing={3} sx={{ display: 'flex', alignItems: 'center', pt: 1.5, pb: 1.5, px: 1.5 }}>
                      <Typography variant="h6" color="secondary.main">{index + 1}</Typography>
                      <MDInput
                        sx={{
                          width: '90%',
                        }}
                        label="Message"
                        multiline
                        focused
                        value={items.body}
                        rows={3}
                      />
                      <Tooltip title="Send" arrow>
                        <Avatar sx={{ bgcolor: blueGrey[500], cursor: 'pointer' }}>
                          <SendIcon />
                        </Avatar>
                      </Tooltip>
                    </Stack>
                  </Paper>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Payments;
