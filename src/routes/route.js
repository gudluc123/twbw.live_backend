const express = require("express");
const router = express.Router();
const {
  getAllUser,
  getUserById,
  getUserGameLogByUserId,
} = require("../controllers/userController");

router.get("/users", getAllUser);
router.get("/user/:userId", getUserById);
router.get("/userGameLog/:userId", getUserGameLogByUserId);

module.exports = router;
