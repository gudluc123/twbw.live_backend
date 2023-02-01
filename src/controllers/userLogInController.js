const userLogInRecord = require("../models/userLogInRecord");
const { isValidObjectId } = require("mongoose");
const user = require("../models/user");

const getUserData = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const user = await user.findOne({ _id: userId }).select("-__v ");

    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "User  Not Found" });
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

    const userLog = await userLogInRecord
      .findOne({ userId: userId })
      .sort({ timeStamp: -1 })
      .select("-__v ");
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

const getUserLogList = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();

    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const userLog = await userLogInRecord
      .find({ userId: userId })
      .sort({ timeStamp: -1 })
      .select("-__v ");

    //  console.log(userLog)
    if (!userLog.length) {
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

module.exports = { getUserLogById, getUserLogList, getUserData };
