const gameLoopModel = require("../models/gameLoopModel");

const getGameHistory = async (req, res) => {
  try {
    const gameHistory = await gameLoopModel.find().select("-__v -password");

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

module.exports = { getGameHistory, getGameById };
