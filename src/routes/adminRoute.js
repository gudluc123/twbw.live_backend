const express = require("express");
const router = express.Router();
const { updateUserRole } = require("../controllers/adminController");

router.put("/users", updateUserRole);

module.exports = router;
