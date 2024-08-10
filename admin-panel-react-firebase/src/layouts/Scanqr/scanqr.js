// @mui material components
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';


// admin panel React components
import MDBox from "components/MDBox";

// admin panel React example components
import * as React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Typography, Paper, Divider, Box, FormHelperText, Stack } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';


// QR Code Scanner
import QrScanner from "react-qr-scanner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrReader } from "react-qr-reader";

//utills
import {
  updateTripStatus,
  chargeUser,
  getCurrentTripStatus,
  getStartedTrips,
  validateQR,
  isBalanceEnough,
  getToll,
  updateGateStatus,
} from "./utils";

// firestore
import { db } from "../../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { useContext } from "react";
import { AuthContext } from "context/AuthContext";

function Scanqr() {
  const [data, setData] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isScanning, setIsScanning] = React.useState(true);
  const [capturedFrame, setCapturedFrame] = React.useState(null);
  let { currentUser } = useContext(AuthContext);
  const [vehicles, setVehicles] = React.useState([]);
  const [selectedVehicle, setSelectedVehicle] = React.useState([]);
  const [isSelectDisable, setSelectDisable] = React.useState(false);
  const [latestFromInterchange, setLatestFromInterchange] = React.useState(false);
  const [qrData,setQrData] = React.useState(null)
  const [isBadQr,setBadQr] = React.useState(false)
  const [isBalanceEnoughState, setBalanceEnoughState] = React.useState(true);
  const [isloading,setLoading] = React.useState(false);
  const [msg,setMsg] = React.useState(false);
  const [rescan,setRescan] = React.useState(0);


  const videoRef = React.useRef();

  const handleClickRescan=()=>{
    setData(false)
    setError("")
    setIsScanning(true)
    setCapturedFrame(null)
    setVehicles([])
    setSelectedVehicle([])
    setSelectDisable(false)
    setLatestFromInterchange(false)
    setQrData(null)
    setBalanceEnoughState(true)
    setLoading(false)
    setMsg(false)
    setRescan(rescan+1)
  }

  const handleScan = (result) => {
    if (result) {
      console.log("Scan result:", result[0]);
      setData(result[0].rawValue);
      setQrData(result[0].rawValue)
      captureFrame();
      setIsScanning(false);
    }
  };

  const handleSelect = (value) => {
    setSelectedVehicle(value);
  };

  React.useEffect(async () => {
    setLoading(true)
    let x = await getCurrentTripStatus("kf8848", currentUser);
    setLoading(false)
    console.log("getCurrentTripStatus", x);
    const q = query(
      collection(db, "vehicles"),
      where("userId", "==", currentUser)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const vehiclesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehiclesData);
      console.log("vehiclesData", vehiclesData);
    });
    return () => unsubscribe();
  }, [currentUser,rescan]);

  React.useEffect(async () => {
      setLoading(true)
      const trips = await getStartedTrips(currentUser)
      setLoading(false)
      if(trips.length){
        setSelectedVehicle(trips[0].reg_num)
        setSelectDisable(true)
        setLatestFromInterchange(trips[0].from)
      }
      if(!await isBalanceEnough(currentUser)){
        setError("Insufficient Balance. Topup First!")
        setBalanceEnoughState(false)
      }
  }, [currentUser,rescan]);
  let options = {
    timeZone: 'Asia/Kolkata', // UTC+5:30 time zone
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false 
};

  React.useEffect(async()=>{
    if(!qrData) return;
    const qrDataList = validateQR(qrData)
    if(!await isBalanceEnough(currentUser)){
      setError("Insufficient Balance")
      setBalanceEnoughState(false)
      return
    }
    else if(qrDataList){
      const [interchange,interchange_type] = qrDataList
      // when there is a ongoing trip
      if(latestFromInterchange){
        if(interchange_type==="IN"){
          setError("Please use entrance Gate")
          return
        }
        else{
          setLoading(true)
          const toll = await getToll(latestFromInterchange,interchange)
          setLoading(false)
          if(toll){
            setLoading(true)
            setMsg({type:"info",msg:"Payment Processing..."})
            await chargeUser(parseFloat(toll),currentUser)
            setMsg({type:"success",msg:"Payment Successful"})
            await updateTripStatus({
              to:interchange,
              status:"completed",
              reg_num:selectedVehicle,
              toll:toll,
              out_time:new Date().toLocaleString('en-US', options)
            },currentUser)

            await updateGateStatus(interchange,interchange_type,"open")
            setLoading(false)
            return
          }
          else{
            setError("Internal Error!")
          }
        }
      }
      //When intering highway
      else{
        if(interchange_type==="OUT"){
          setError("Please Use Entrance Gate")
          return
        }
        else{
          setLoading(true)
          await updateTripStatus({
            uid:currentUser,
            from:interchange,
            reg_num:selectedVehicle,
            status:"started",
            in_time:new Date().toLocaleString('en-US', options)
          },currentUser)
          await updateGateStatus(interchange,interchange_type,"open")
          setMsg({type:"success",msg:`Welcome to ${interchange} interchange.`})
          setLoading(false)
          return
        }

      }
    }
    else{
      setError("Invalid QR Code")
    }
    
  },[qrData])
  console.log("qrdata",qrData)
  

  const handleError = (err) => {
    console.error("Scan error:", err);
    setError("Error accessing camera or scanning QR code");
  };

  const captureFrame = () => {
    const videoElement = videoRef.current.querySelector("video");
    if (videoElement) {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      setCapturedFrame(canvas.toDataURL("image/png"));
    } else {
      console.error("Video element not found");
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };
console.log("msg",msg)
  return (
    <DashboardLayout>
      <DashboardNavbar />

      {isloading && (<>
        <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
          <LinearProgress color="primary" sx={{ color: 'primary' }} />
        </Box>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        </>
      )}
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={9} lg={12} mx={"auto"}>
              <Paper
                elevation={5}
                sx={{
                  bgcolor: "azure",
                  margin: "0 auto",
                  borderRadius: "1.5rem",
                  width: "100%",
                  minHeight: "500px",
                  p: 2,
                }}
              >
                <Typography
                  variant="h3"
                  color="secondary.main"
                  sx={{ pt: 2, textAlign: "center" }}
                >
                  Scan QR Code
                </Typography>
                
                <Divider />
                 
                <Grid item xs={8} md={7} lg={4} mx={"auto"}>
                  <FormControl fullWidth error={!selectedVehicle.length}>
                    <InputLabel id="demo-simple-select-label">
                      Vehicle
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selectedVehicle}
                      label="Vehicle"
                      style={{ height: 50 }}
                      onChange={(e) => {
                        handleSelect(e.target.value);
                      }}
                      disabled={isSelectDisable || !isBalanceEnoughState}
                    >
                      {vehicles &&
                        vehicles.map((vehicle) => {
                          return (
                            <MenuItem value={vehicle.licensePlate}>
                              {vehicle.licensePlate}
                            </MenuItem>
                          );
                        })}
                    </Select>

                    {!selectedVehicle.length && (
                      <FormHelperText>
                        Please Select Current Vehicle
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={8} md={7} lg={4} mx={"auto"}>
                  <MDBox
                    sx={{ display: "flex", justifyContent: "center", mt: 3 }}
                    xs={8}
                    md={7}
                    lg={4}
                  >
                    <div
                      ref={videoRef}
                      style={{ display: isScanning && selectedVehicle && selectedVehicle.length && isBalanceEnoughState  ? "block" : "none" }}
                    >
                      {/* <QrScanner
                        delay={300}
                        style={previewStyle}
                        onError={handleError}
                        onScan={handleScan}
                      /> */}
                      <Scanner
                        onScan={handleScan}
                        style={previewStyle}
                        paused={!(isScanning && selectedVehicle && selectedVehicle.length && isBalanceEnoughState)}
                      />
                    </div>
                    {!isScanning && (
                      <img
                        src={capturedFrame}
                        alt="Captured frame"
                        style={previewStyle}
                      />
                    )}
                    
               
                  </MDBox>
                  {error && (
                  <Alert severity="error" sx={{ mt: 2, textAlign: "center" }}>{error}</Alert>
                )}

                 {msg && (
                  <Box sx={{ width: '100%' }}>
                  <Collapse in={msg}>
                    <Alert severity={msg.type}
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setMsg(false);
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mt: 2 }}
                    >
                      {msg.msg}
                    </Alert>
                  </Collapse>
                </Box>
                )}

                {data && (<Box sx={{ width: '100%', mt:2}}>
                  <Alert severity='info' sx={{ mb: 2 }}>
                    {data}
                  </Alert>
                </Box>)}
                
                { (data) && (<Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  sx={{ mt: 2 }}
                >
                  <Button 
                    variant="contained" 
                    sx={{ color: 'white !important', '& .MuiSvgIcon-root': { color: 'white !important' } }} 
                    endIcon={<ReplayIcon />}
                    onClick={handleClickRescan}
                  >
                    Scan Again
                  </Button>
                </Box>)}
                
                </Grid>
                
                {/* <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
                  {data}
                </Typography> */}
                
              </Paper>
            </Grid>
            
          </Grid>
        </MDBox>
        
      </MDBox>
      
      <Footer />
    </DashboardLayout>
  );
}

export default Scanqr;
