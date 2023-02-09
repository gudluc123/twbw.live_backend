const express = require("express");
const router = express.Router();
const {
  getAllUser,
  getUserById,
  getUserGameLogByUserId,
  getLatest2UserGameLog,
} = require("../controllers/userController");

router.get("/users", getAllUser);
router.get("/user/:userId", getUserById);
router.get("/userGameLog/:userId", getUserGameLogByUserId);
router.get("/userGameLog", getLatest2UserGameLog);

module.exports = router;
