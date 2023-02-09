const { isValidObjectId } = require("mongoose");
const userModel = require("../models/user");
const userGameLog = require("../models/userGameLog");

const getAllUser = async (req, res) => {
  try {
    const allUser = await userModel.find().select("-__v -password");

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: allUser });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const user = await userModel
      .findById({ _id: userId })
      .select("-__v -password");

    if (!user) {
      return res.status(404).send({ status: false, message: "User Not Found" });
    }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: user });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getUserGameLogByUserId = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const userGamePlayed = await userGameLog.find({ userId }).select("-__v");

    if (!userGamePlayed.length) {
      return res
        .status(404)
        .send({ status: false, message: "User not Bet for this round" });
    }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: userGamePlayed });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getLatest2UserGameLog = async (req, res) => {
  try {
    const requestBody = req.query;

    if (!isValidObjectId(requestBody.userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }
    let roundId = Number(requestBody.roundId);
    const userGamePlayed = await userGameLog.find({
      roundId: roundId,
      userId: userId,
    });

    // if (!userGamePlayed.length) {
    //   return res
    //     .status(404)
    //     .send({ status: false, message: "User not Bet for this round" });
    // }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: userGamePlayed });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  getAllUser,
  getUserById,
  getUserGameLogByUserId,
  getLatest2UserGameLog,
};
