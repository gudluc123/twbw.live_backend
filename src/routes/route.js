const express = require("express");
const router = express.Router();
const {
  getAllUser,
  getUserById,
  getUserGameLogByUserId,
  getLatest2UserGameLog,
  userRegistration,
  userLogin,
  userLogout,
} = require("../controllers/userController");

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/logout", userLogout);
router.get("/users", getAllUser);
router.get("/user/:userId", getUserById);
router.get("/userGameLog/:userId", getUserGameLogByUserId);
router.get("/userGameLog", getLatest2UserGameLog);

module.exports = router;
