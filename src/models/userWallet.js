const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // unique: true,
      trim: true,
    },

    // trId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Transaction",
    // },

    credit: {
      type: Number,
      //required: true,
      trim: true,
      default: 0,
    },

    debit: {
      type: Number,
      trim: true,
      //required: true,
      default: 0,
    },

    marketId: {
      type: String,
      trim: true,
      // unique: true
    },

    balance: {
      type: Number,
      default: 1000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserWallet", walletSchema);
