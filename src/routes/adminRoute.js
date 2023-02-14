const express = require("express");
const router = express.Router();
const {
  updateUserRole,
  adminLogin,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.put("/user/:userId", updateUserRole);

module.exports = router;
