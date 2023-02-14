const express = require("express");
const router = express.Router();
const { updateUserRole } = require("../controllers/adminController");

router.put("/user/:userId", updateUserRole);

module.exports = router;
