const express = require("express");
const router = express.Router();
const { getAllUser, getUserById } = require("../controllers/userController");

router.get("/users", getAllUser);
router.get("/user/:userId", getUserById);

module.exports = router;
