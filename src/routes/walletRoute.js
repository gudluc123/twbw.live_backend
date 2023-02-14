const express = require("express");
const router = express.Router();
const { getUserWalletById } = require("../controllers/walletController");

router.get("/user/:userId/:marketId", getUserWalletById);

module.exports = router;
