// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Brands from "layouts/brands";
import AddSale from "layouts/addSale";
import Banks from "layouts/users";
import Categories from "layouts/categories";
import Carousels from "layouts/carousels";
import Vehicles from "layouts/vehicles";
import Notifications from "layouts/notifications/Notifications";
import SendNotifications from "layouts/notifications/SendNotifications";
import Signup from "layouts/authentication/users/Signup"
import Payments from "layouts/payments/payments";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Scanqr from "layouts/Scanqr/scanqr";
import TollTable from "layouts/charges/TollTable";
import UserTollTable from "layouts/charges/UserTollTable";

//auth routes
import BrandsDetail from "layouts/brands/components/Detail"
import BanksDetail from "layouts/users/components/Detail"
import SalesDetail from "layouts/addSale/components/Detail"
import CarouselsDetail from "layouts/carousels/components/Detail"
import VehiclesDetail from "layouts/vehicles/components/Detail"

// @mui icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CategoryIcon from '@mui/icons-material/Category';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationAddIcon from '@mui/icons-material/NotificationAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LoginIcon from '@mui/icons-material/Login';
import * as React from 'react'
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "context/AuthContext";
import TableViewIcon from '@mui/icons-material/TableView';

const AdminAuthRoutes = ({ children }) => {
  const { role } = useContext(AuthContext)
  return role === "admin" ? children : <Navigate to="/login" />
}
const BrandAuthRoutes = ({ children }) => {
  const { role } = useContext(AuthContext)
  return role === "brand" ? children : <Navigate to="/login" />
}
const UserAuthRoutes = ({ children }) => {
  const { role } = useContext(AuthContext)
  return role === "user" ? children : <Navigate to="/login" />
}

const routes = [
  {
    routeRole: "admin",
    type: "collapse",
    name: "Admin Dashboard",
    key: "admin/dashboard",
    icon: <DashboardIcon />,
    route: "/admin/dashboard",
    component: <AdminAuthRoutes><Dashboard /></AdminAuthRoutes>,
  },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: "Brands",
  //   key: "admin/brands",
  //   icon: <StoreIcon />,
  //   route: "/admin/brands",
  //   component: <AdminAuthRoutes><Brands /></AdminAuthRoutes>,
  // },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: "Add Sale",
  //   key: "admin/addSale",
  //   icon: <InventoryIcon />,
  //   route: "/admin/addSale",
  //   component: <AdminAuthRoutes><AddSale /></AdminAuthRoutes>,
  // },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: "Banks",
  //   key: "admin/users",
  //   icon: <AccountBalanceIcon />,
  //   route: "/admin/users",
  //   component: <AdminAuthRoutes><Banks /></AdminAuthRoutes>,
  // },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: "Categories",
  //   key: "admin/categories",
  //   icon: <CategoryIcon />,
  //   route: "/admin/categories",
  //   component: <AdminAuthRoutes><Categories /></AdminAuthRoutes>,
  // },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: "Carousels",
  //   key: "admin/carousels",
  //   icon: <ViewCarouselIcon />,
  //   route: "/admin/carousels",
  //   component: <AdminAuthRoutes><Carousels /></AdminAuthRoutes>,
  // },
  {
    routeRole: "admin",
    type: "collapse",
    name: "Vehicles",
    key: "admin/vehicles",
    icon: <DirectionsCarIcon/>,
    route: "/admin/vehicles",
    component: <AdminAuthRoutes><Vehicles /></AdminAuthRoutes>,
  },
  // {
  //   routeRole: "admin",
  //   type: "collapse",
  //   name: `Notifications`,
  //   key: "admin/notifications",
  //   icon: <NotificationsActiveIcon />,
  //   route: "/admin/notifications",
  //   component: <AdminAuthRoutes><Notifications /></AdminAuthRoutes>,
  // },
  {
    routeRole: "admin",
    type: "collapse",
    name: "Signup",
    icon: <LoginIcon />,
    route: "/admin/signup",
    component: <AdminAuthRoutes><Signup /></AdminAuthRoutes>,
  },
  {
    routeRole: "brand",
    type: "collapse",
    name: "Demo Dashboard",
    key: "brand/dashboard",
    icon: <DashboardIcon />,
    route: "/brand/dashboard",
    component: <BrandAuthRoutes><Dashboard /></BrandAuthRoutes>
  },
  {
    routeRole: "brand",
    type: "collapse",
    name: "Add Sale",
    key: "brand/addSale",
    icon: <InventoryIcon />,
    route: "/brand/addSale",
    component: <BrandAuthRoutes><AddSale /></BrandAuthRoutes>,
  },
  // {
  //   routeRole: "brand",
  //   type: "collapse",
  //   name: `Send Notifications`,
  //   key: "brand/sendNotifications",
  //   icon: <NotificationAddIcon />,
  //   route: "/brand/sendNotifications",
  //   component: <BrandAuthRoutes><SendNotifications /></BrandAuthRoutes>,
  // },
  {
    routeRole: "user",
    type: "collapse",
    name: "Dashboard",
    key: "user/dashboard",
    icon: <DashboardIcon />,
    route: "/user/dashboard",
    component: <UserAuthRoutes><Dashboard /></UserAuthRoutes>,
  },
  {
    routeRole: "user",
    type: "collapse",
    name: "Vehicles",
    key: "user/vehicles",
    icon: <DirectionsCarIcon/>,
    route: "/user/vehicles",
    component: <UserAuthRoutes><Vehicles /></UserAuthRoutes>,
  },
  // {
  //   routeRole: "user",
  //   type: "collapse",
  //   name: `Send Notification`,
  //   key: "user/sendNotificationst",
  //   icon: <NotificationAddIcon />,
  //   route: "/user/sendNotifications",
  //   component: <UserAuthRoutes><SendNotifications /></UserAuthRoutes>,
  // },
  {
    routeRole: "user",
    type: "collapse",
    name: `Topup`,
    key: "user/topup",
    icon: <MonetizationOnIcon />,
    route: "/user/topup",
    component: <UserAuthRoutes><Payments /></UserAuthRoutes>,
  },
  {
    routeRole: "user",
    type: "collapse",
    name: `Scan QR`,
    key: "user/scanqr",
    icon: <QrCodeScannerIcon />,
    route: "/user/scanqr",
    component: <UserAuthRoutes><Scanqr /></UserAuthRoutes>,
  },
  {
    routeRole: "user",
    type: "collapse",
    name: `Toll Table`,
    key: "user/tolltable",
    icon: <TableViewIcon />,
    route: "/user/tolltable",
    component: <UserAuthRoutes><UserTollTable /></UserAuthRoutes>,
  },
  {
    routeRole: "admin",
    type: "collapse",
    name: `Toll Table`,
    key: "admin/tolltable",
    icon: <TableViewIcon />,
    route: "/admin/tolltable",
    component: <AdminAuthRoutes><TollTable /></AdminAuthRoutes>,
  },

]

const authRoutes = [
  {
    routeRole: "admin",
    type: "authRoutes",
    route: "/admin/brands/detail/:id",
    component: <AdminAuthRoutes><BrandsDetail /></AdminAuthRoutes>,
  },
  {
    routeRole: "admin",
    type: "authRoutes",
    route: "/admin/users/detail/:id",
    component: <AdminAuthRoutes><BanksDetail /></AdminAuthRoutes>,
  },
  {
    routeRole: "admin",
    type: "authRoutes",
    route: `/admin/addSale/detail/:id`,
    component: <AdminAuthRoutes><SalesDetail /></AdminAuthRoutes>,
  },
  {
    routeRole: "admin",
    type: "authRoutes",
    route: "/admin/carousels/detail/:id",
    component: <AdminAuthRoutes><CarouselsDetail /></AdminAuthRoutes>,
  },
  {
    routeRole: "admin",
    type: "authRoutes",
    route: "/admin/vehicles/detail/:id",
    component: <AdminAuthRoutes><VehiclesDetail /></AdminAuthRoutes>,
  },
  {
    routeRole: "brand",
    type: "authRoutes",
    route: `/brand/addSale/detail/:id`,
    component: <BrandAuthRoutes><SalesDetail /></BrandAuthRoutes>,
  },
  {
    routeRole: "user",
    type: "authRoutes",
    route: "/user/vehicles/detail/:id",
    component: <UserAuthRoutes><VehiclesDetail /></UserAuthRoutes>,
  },
  
]
export default routes;
export { authRoutes }
