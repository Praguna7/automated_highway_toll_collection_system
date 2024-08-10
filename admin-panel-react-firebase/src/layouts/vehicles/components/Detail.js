// @mui material components
import Grid from "@mui/material/Grid";

// Admin panel React components
import MDBox from "components/MDBox"
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";

// Admin panel React example components
import * as React from 'react';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Bill from "layouts/vehicles/data/vehiclesDetailCard";
import { useParams } from "react-router-dom"

//firestore
import { db } from "../../../firebase"
import { doc, onSnapshot } from "firebase/firestore";

function Detail() {
  const [data, setData] = React.useState({})
  const [brandData, setBrandData] = React.useState({})
  const [userData, setBankData] = React.useState({})
  const [cardsData, setCardsData] = React.useState([])
  const { id } = useParams()

  React.useEffect(() => {
    const fetchDataById = onSnapshot(doc(db, "vehicles", id),
      (doc) => {
        setData(doc.data())
        setBrandData(doc.data().brand)
        setBankData(doc.data().user)
        setCardsData(doc.data().user.cards)
      },
      (error) => {
        console.log("error == ", error.code)
      })
    return () => {
      fetchDataById()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <MDBox pt={3} px={2}>
                    <MDTypography variant="h6" fontWeight="medium" sx={{ textAlign: 'center' }}>
                      Carousel Detail
                    </MDTypography>
                  </MDBox>
                  <MDBox pt={1} pb={2} px={2}>
                    <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                      {data && <Bill
                        discountTitle={data.title}
                        brandName={brandData.name}
                        brandCategory={brandData.category}
                        brandContactNo={brandData.contactNo}
                        brandWebsite={brandData.website}
                        brandLogo={brandData.logo}
                        userName={userData.name}
                        userAddress={userData.address}
                        userContactNo={userData.contactNo}
                        userCards={cardsData}
                        userImage={userData.image}
                        discountStartDate={data.startDate}
                        discountEndDate={data.endDate}
                        discountLocation={data.locations}
                        discountUrl={data.url}
                        discountImage={data.image}
                        dataId={id}
                      />}
                    </MDBox>
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
