import React from "react";
import AddFundToWallet from "./components/payment-gateway/add-fundTo-wallet/AddFundToWallet";
import P2PTransfer from "./pages/p2pTransfer";
import Home from "./pages/cardGame";
import Register from "./pages/registration";
import UserData from "./pages/userData";

export const ROUTES = [
  {
    path: "/",
    page: <Home />,
  },

  {
    path: "/addFund",
    page: <AddFundToWallet/>,
  },
  {
    path: "/transferp2p",
    page: <P2PTransfer/>,
  },
  {
    path: "/user",
    page: <UserData />,
  },

  {
    path: "/register",
    page: <Register />,
  },
];
