import React from "react";
// import AddFund from "./pages/paymetGateway";
import Home from "./pages/cardGame";
import Register from "./pages/registration";
import UserData from "./pages/userData";

export const ROUTES = [
  {
    path: "/",
    page: <Home />,
  },

  // {
  //   path: "/addFund",
  //   page: <AddFund />,
  // },
  {
    path: "/user",
    page: <UserData />,
  },

  {
    path: "/register",
    page: <Register />,
  },
];
