const userModel = require("../models/user");
const userWallet = require("../models/userWallet");
const { isValidObjectId } = require("mongoose");

const getUserWalletById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const marketId = req.params.marketId;

    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid UserId" });
    }

    const user = await userModel.findById(userId).select("-__v -password");

    if (!user) {
      return res.status(404).send({ status: false, message: "Invalid UserId" });
    }

    const wallet = await userWallet
      .findOne({ userId: userId, marketId: marketId })
      .populate("userId")
      .select("-__v -createdAt -updatedAt")
      .lean();

    delete wallet.userId["password"];
    delete wallet.userId["__v"];

    return res
      .status(200)
      .send({ status: "true", message: "Success", data: wallet });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  getUserWalletById,
};
