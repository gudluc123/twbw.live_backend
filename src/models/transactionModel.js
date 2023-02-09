const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      trim: true,
    },

    credit: {
      type: Number,
      //required: true,
      default: 0,
      trim: true,
    },

    debit: {
      type: Number,
      //required: true,
      default: 0,
      trim: true,
    },

    transactionId: {
      type: String,
      unique: true,
    },

    marketId: {
      type: String,
      // ref: "Wallet",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Success", "Fail", "Pending"],
      default: "Pending",
    },

    txType: {
      type: String,
      enum: ["credit", "debit"],
    },

    transactionTime: {
      type: Number,
      default: (unixTime = function unixTimestamp() {
        return Math.floor(Date.now() / 1000);
      }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
