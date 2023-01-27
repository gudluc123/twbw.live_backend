const { isValidObjectId } = require("mongoose");
const adminModel = require("../models/adminModel");
const user = require("../models/user");
const { isValid } = require("../utils/validator");

const updateUserRole = async (req, res) => {
  try {
    let userId = req.params.userId;
    userId = userId.trim();
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
      if (["Broker", "SubBroker", "Agent", "User"].indexOf(role) === -1) {
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
      .send({ status: "true", message: "Success", data: updatedData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { updateUserRole };
