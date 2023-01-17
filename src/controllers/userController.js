const { isValidObjectId } = require("mongoose");
const userModel = require("../models/user");
const userLogInRecord = require("../models/userLogInRecord");

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

const getUserLogById = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const userLog = await userLogInRecord.findOne({ userId: userId }).select("-__v ");
//  console.log(userLog)
    if (!userLog) {
      return res
        .status(404)
        .send({ status: false, message: "User Log Not Found" });
    }

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: userLog });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getAllUser, getUserById, getUserLogById };
