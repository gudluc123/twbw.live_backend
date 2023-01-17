const gameLoopModel = require("../models/gameLoopModel");
const userGameLog = require("../models/userGameLog");

const getGameHistory = async (req, res) => {
  try {
    const gameHistory = await gameLoopModel
      .find()
      .sort({ roundId: -1 })
      .limit(250)
      .select("-__v ");

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: gameHistory });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getGameById = async (req, res) => {
  try {
    let roundId = req.params.gameId;
    // roundId = roundId.trim();

    const Game = await gameLoopModel
      .findOne({ roundId: roundId })
      .select("-__v ");

    if (!Game) {
      return res.status(404).send({ status: false, message: "Game Not Found" });
    }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: Game });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getGameLogByRoundId = async (req, res) => {
  try {
    let roundId = req.params.gameId;
    // roundId = roundId.trim();

    const GameLog = await userGameLog
      .find({ roundId: roundId })
      .select("-__v ");

    if (!GameLog.length) {
      return res
        .status(404)
        .send({ status: false, message: "No User Bet For This Round!" });
    }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: GameLog });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getGameHistory, getGameById, getGameLogByRoundId };
