const { isValidObjectId } = require("mongoose");
const adminModel = require("../models/adminModel");
const user = require("../models/user");
const { isValid } = require("../utils/validator");

const adminLogin = async (req, res) => {
  try {
    const requestBody = req.body;
    const { email, password } = requestBody;

    if (!email) {
      return res.status(400).send("Invalid userName");
    }

    if (!password) {
      return res.status(400).send("Invalid password");
    }

    const admin = await adminModel
      .findOne({
        email: email,
        password: password,
      })
      .select("-__v -password");

    if (!admin) {
      return res.status(401).send("Email or Password not matched!");
    }

    return res
      .status(200)
      .send({ status: true, message: "Login Successful", data: admin });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    let userId = req.params.userId;
    const requestBody = req.body;

    const { role, userStatus } = requestBody;
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const updateData = {};

    if ("role" in requestBody) {
      if (!isValid(role)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid user role" });
      }
      if (
        ["Broker", "SubBroker", "Sponser", "User", "Bot", "Player"].indexOf(
          role
        ) === -1
      ) {
        return res
          .status(400)
          .send({ status: false, message: "Please select valid user role" });
      }
      if (!("$set" in updateData)) {
        updateData["$set"] = {};
      }
      updateData["$set"]["role"] = role;
    }

    if ("userStatus" in requestBody) {
      if (!isValid(userStatus)) {
        return res
          .status(400)
          .send({ status: false, message: "Invalid user status" });
      }
      if (["Active", "InActive", "Suspend"].indexOf(userStatus) === -1) {
        return res
          .status(400)
          .send({ status: false, message: "Please select valid user status" });
      }

      if (!("$set" in updateData)) {
        updateData["$set"] = {};
      }
      updateData["$set"]["userStatus"] = userStatus;
    }

    const updatedData = await user.findOneAndUpdate(
      { _id: userId },
      updateData,
      { new: true }
    );

    return res
      .status(200)
      .send({ status: "true", message: "Updated Successfully", data: updatedData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { adminLogin, updateUserRole };
