// @mui material components
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";

// Amdin panel React components
import MDBox from "components/MDBox";

import UserDisplayTable from "layouts/tables/UserDisplayTable";
import AdminDisplayTable from "layouts/tables/AdminDisplayTable";
// Amdin panel React example components
import * as React from 'react';
import { useState,useContext,useEffect } from "react";
import { AuthContext } from "context/AuthContext";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import Footer from "examples/Footer";

//firestore
import { messaging } from "../../firebase"
import { getToken } from "firebase/messaging";
import { db } from "../../firebase"
import { collection, doc, setDoc, addDoc, getDocs,getDoc, arrayUnion,query,where } from "firebase/firestore";

// Data
import exportedObject  from "layouts/dashboard/data/reportsBarChartData";
import exportedObject2 from "layouts/dashboard/data/reportsLineChartData";

function Dashboard() {
  const { sales, tasks } = exportedObject2;
  const [vehicleCount, setVehicleCount] = useState([]);
  const [balance,setBalance] = useState(0)
  const [maxToll,setMaxToll] = useState(0)
  const [userCount,setUserCount] = useState(0)
  const [revenue,setRevenue] = useState(0)
  const [currentTrip,setCurrentTrip] = useState(false)
  const [allCurrentTrips,setAllCurrentTrips] = useState(false)
  const { currentUser, role } = useContext(AuthContext);

  useEffect(async()  => {
    let totalRevenue = 0;
    if (role === 'user') {
      const q = query(collection(db, "vehicles"), where("userId", "==", currentUser));
      const querySnapShot = await getDocs(q)
      setVehicleCount(querySnapShot?querySnapShot.size:0)
      const balanceQuerySnapshot = await getDoc( doc(db, "balances", currentUser))
      if(balanceQuerySnapshot.data()){
        setBalance(balanceQuerySnapshot.data().balance)
      }
      const chargesSnapshot = await getDocs(query(collection(db, "charges")))
      let maxCharge = 0;
      chargesSnapshot.forEach((doc)=>{
        let chg = parseFloat(doc.data().Charge)
        if(chg>maxCharge) maxCharge=chg
      })
      setMaxToll(maxCharge.toFixed(2))
      totalRevenue = 0;
      let tripSnapshotUser = await getDocs(query(collection(db, "trips"), where("status", "==", "completed"), where("uid", "==", currentUser)))
      tripSnapshotUser.forEach((trip)=>{
        totalRevenue+= trip.data().toll?parseFloat(trip.data().toll):0
      })
      setRevenue(totalRevenue)

      tripSnapshotUser = await getDocs(query(collection(db, "trips"), where("status", "==", "started"), where("uid", "==", currentUser)))
      if(!tripSnapshotUser.empty){
        setCurrentTrip(tripSnapshotUser.docs[0].data())
      }


    }
    if (role === 'admin') {
      const q = query(collection(db, "users"), where("role", "==", "user"));
      const querySnapShot = await getDocs(q)
      setUserCount(querySnapShot?querySnapShot.size:0)
      totalRevenue = 0;

      const tripSnapshotAdmin = await getDocs(query(collection(db, "trips"), where("status", "==", "completed")))
      tripSnapshotAdmin.forEach((trip)=>{
        totalRevenue+= trip.data().toll?parseFloat(trip.data().toll):0
      })
      setRevenue(totalRevenue)

      const allCurrentTripSnapshot = await getDocs(query(collection(db, "trips"), where("status", "==", "started")))
      if(!allCurrentTripSnapshot.empty){
        setAllCurrentTrips(allCurrentTripSnapshot.docs)
      }

    }
  }, [currentUser, role]);
  
  const columns = [
    { name: "reg_num", type: "string" },
    { name: "from", type: "string" },
    { name: "to", type: "string" },
    { name: "in_time", type: "string" },
    { name: "out_time", type: "string" },
    { name: "toll", type: "number" },
    { name: "status", type: "string" },

  ];

  return (
    <DashboardLayout >
    <DashboardNavbar />
    <MDBox py={3} >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="directions_car"
              title="Registered Vehicles"
              count={vehicleCount}
              percentage={{
                label: "Register all your vehicles for seamless interchange",
              }}
              
            />
          </MDBox>
        </Grid>
        {role==="user" && (<Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              icon="attach_money"
              title="Account Balance"
              count={"Rs: "+ parseFloat(balance).toFixed(2)}
              percentage={{
                label: `Minimum balance of Rs ${maxToll} is required`,
              }}
            />
          </MDBox>
        </Grid>)}
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="success"
              icon="account_balance"
              title={role === "admin" ? "Revenue" : "Total Spend"}
              count={"Rs: "+ parseFloat(revenue).toFixed(2)}
              percentage={{
                color: "success",
                amount: "",
                label: `${role === "admin" ? "All Time Revenue" : "Totall Toll Amount You Spend For Expressway"}`,
              }}
            />
          </MDBox>
        </Grid>
        {role==="admin" && (<Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon="person_add"
              title="Registered users"
              count={userCount}
              percentage={{
                color: "success",
                amount: "",
                label: "Total User Count",
              }}
            />
          </MDBox>
        </Grid>)}
        {role==="user" && (<Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon="minor_crash"
              title="Current Trip"
              count={currentTrip?`Started from ${currentTrip.from}`:"No active Trips"}
              percentage={{
                color: "success",
                amount: "",
                label: currentTrip?`Vehicle Registration Number ${currentTrip.reg_num}`:"No trips at the moment. Only onging trips will apper here.",
              }}
            />
          </MDBox>
        </Grid>)}
        {role==="admin" && (<Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon="minor_crash"
              title="Current Trips"
              count={allCurrentTrips?`${allCurrentTrips.length}`:"No active Trips"}
              percentage={{
                color: "success",
                amount: "",
                label: allCurrentTrips?`Number of vehicles currently on expressway ${currentTrip.reg_num}`:"No Users on Expressway",
              }}
            />
          </MDBox>
        </Grid>)}
      </Grid>
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {role==="admin"?
           <AdminDisplayTable columns={columns} collectionName={"trips"} editable={false}/>:
           <UserDisplayTable columns={columns} collectionName={"trips"} editable={false}/>
        }
          
          
        </Grid>
          {/* <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsBarChart
                color="info"
                title="website views"
                description="Last Campaign Performance"
                date="campaign sent 2 days ago"
                chart={exportedObject }
              />
            </MDBox>
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsLineChart
                color="success"
                title="daily sales"
                description={
                  <>
                    (<strong>+15%</strong>) increase in today sales.
                  </>
                }
                date="updated 4 min ago"
                chart={sales}
              />
            </MDBox>
          </Grid> */}
          {/* <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={3}>
              <ReportsLineChart
                color="dark"
                title="completed tasks"
                description="Last Campaign Performance"
                date="just updated"
                chart={tasks}
              />
            </MDBox>
          </Grid> */}
        </Grid>
      </MDBox>
    </MDBox>
    <Footer />
  </DashboardLayout>
  );
}

export default Dashboard;
