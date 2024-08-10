// @mui material components
import Grid from "@mui/material/Grid";

// admin panel React components
import MDBox from "components/MDBox";

// admin panel React example components
import * as React from 'react';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Typography, Paper, Divider, Box } from '@mui/material';
import EditableTable from "layouts/tables/EditableTable";

function TollTable() {
  const columns = [
    { name: "From", type: "dropdown", options: ["Peliyagoda", "Kerawalapitiya", "Ja-Ela", "Katunayake"] },
    { name: "To", type: "dropdown", options: ["Peliyagoda", "Kerawalapitiya", "Ja-Ela", "Katunayake"] },
    { name: "Charge", type: "number" }
  ];
  const collectionName = "charges";

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={10} lg={8}>
                <Paper elevation={5} sx={{
                  margin: "0 auto",
                  borderRadius: "1.5rem",
                  width: '100%',
                  padding: '2rem'
                }}>
                  <Typography variant="h3" color="secondary.main" sx={{ pt: 2, textAlign: "center" }}>Toll Table</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <EditableTable columns={columns} collectionName={collectionName} editable={true} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    </>
  );
}

export default TollTable;
