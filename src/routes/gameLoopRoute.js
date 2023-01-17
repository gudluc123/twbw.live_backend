const express = require("express");
const router = express.Router();
const {
  getGameHistory,
  getGameById,
  getGameLogByRoundId,
} = require("../controllers/gameLoopController");

router.get("/game", getGameHistory);
router.get("/game/:gameId", getGameById);
router.get("/gameLog/:gameId", getGameLogByRoundId);

module.exports = router;
