const jwt = require("jsonwebtoken");
const jwtTokenSchema = require("../models/blacklistedToken");

const AuthBalcklisted = async (req, res, next) => {
  try {
    //   console.log(req.headers)
    const userToken = req.headers.authorization.split(" ")[1];

    const blackListToken = await jwtTokenSchema.findOne({ token: userToken });

    if (!blackListToken) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(401).send("No User Authentication");
  }
};

const Authentication = (req, res, next) => {
  try {
    //   console.log(req.headers)
    const token = req.headers.authorization.split(" ")[1];
    if (typeof token !== "undefined") {
      const decoded = jwt.verify(token, "Game123$");
      req.user = decoded.user;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(401).send("No User Authentication");
  }
};

module.exports = { Authentication, AuthBalcklisted };
