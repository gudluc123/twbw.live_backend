const { isValidObjectId } = require("mongoose");
const userModel = require("../models/user");
const userGameLog = require("../models/userGameLog");
const userLogInRecord = require("../models/userLogInRecord");
const userWallet = require("../models/userWallet");
const jwtTokenSchema = require("../models/blacklistedToken");
const jwt = require("jsonwebtoken");

// Passport.js Register system
const userRegistration = async (req, res) => {
  try {
    const requestBody = req.body;
    const { sponserId, username, userEmail, password } = requestBody;

    if (username.length < 3 || password < 3) {
      return;
    }

    const sponser = await userModel.findOne({ _id: sponserId });

    if (!sponser) {
      return res
        .status(404)
        .send({ status: false, message: "Sponser doesn't exists" });
    }

    // Updating user role of sponser to "Sponser"
    const updateSponserRole = await userModel.findOneAndUpdate(
      { _id: sponserId },
      { $set: { role: "Sponser" } },
      { new: true }
    );

    let user = await userModel.findOne({ username: username });
    if (user) {
      return res.send("Username already exists");
    }

    const newUser = new userModel({
      username: username,
      userEmail: userEmail,
      password: password,
      sponserId: sponserId,
    });

    const userCreated = await newUser.save();

    if (!userCreated) {
      return res
        .status(400)
        .send({ status: false, message: "Internal Server error" });
    }

    const depositWallet = {
      userId: userCreated._id,
      marketId: 1,
    };

    const incomeWallet = {
      userId: userCreated._id,
      marketId: 2,
      balance: 0,
    };

    const dWallet = await userWallet.create(depositWallet);
    const iWallet = await userWallet.create(incomeWallet);

    return res.send("Loading...");
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// Passport.js Login system
const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).send("Invalid userName");
    }

    if (!password) {
      return res.status(400).send("Invalid password");
    }
    const user = await userModel
      .findOne({
        username: username,
        password: password,
      })
      .select("-__v -password");

    if (!user) {
      return res.status(404).send("User not found");
    }

    const token = jwt.sign({ user: user }, "Game123$", {
      expiresIn: "12h",
    });

    // User LogIn Record
    const logData = {
      userId: user._id,
      userName: user.username,
      host: req.hostname,
      browser: req.rawHeaders[15],
      ipAddress: req.ip,
      timeStamp: new Date(),
      logInStatus: true,
    };
    const userLog = await userLogInRecord.create(logData);

    res.set("Authorization", `Bearer ${token}`);

    return res
      .status(200)
      .send({ status: true, message: "Login Successful", data: token });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// User Logout system
const userLogout = async (req, res, next) => {
  try {
    let token = req.query.token;

    const tokenData = {
      token: token,
    };
    const blackListToken = await jwtTokenSchema.create(tokenData);
    return res.status(200).send("success2");
    //  return res.redirect('/');
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

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
  userRegistration,
  userLogin,
  userLogout,
  getAllUser,
  getUserById,
  getUserGameLogByUserId,
  getLatest2UserGameLog,
};
