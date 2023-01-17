const express = require("express");
const router = express.Router();
const { getUserLogById } = require("../controllers/userLogInController");

router.get("/userLog/:userId", getUserLogById);

module.exports = router;
