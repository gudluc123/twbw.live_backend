import React from "react";
import AddFund from "./pages/paymetGateway";
import Home from "./pages/cardGame";
import Register from "./pages/registration";

export const ROUTES = [
  {
    path: "/",
    page: <Home />,
  },

  {
    path: "/addFund",
    page: <AddFund />,
  },

  {
    path: "/register",
    page: <Register />,
  },
];
