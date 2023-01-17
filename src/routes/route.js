const express = require("express");
const router = express.Router();
const {
  getGameHistory,
  getGameById,
} = require("../controllers/gameLoopController");
const { getAllUser, getUserById, getUserLogById } = require("../controllers/userController");

router.get("/users", getAllUser);
router.get("/user/:userId", getUserById);
router.get("/userLog/:userId", getUserLogById);

router.get("/game", getGameHistory);
router.get("/game/:gameId", getGameById);

module.exports = router;
