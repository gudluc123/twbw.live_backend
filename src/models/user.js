const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 1000,
    },
    bet_amount: {
      type: Number,
      default: 0,
    },
    payout_multiplier: {
      type: String,
      default: 0,
    },
    cardSelected: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    userStatus: {
      type: String,
      enum: ["Active", "InActive", "Suspend"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", user);
