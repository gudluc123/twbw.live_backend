const mongoose = require("mongoose");

const walletTrxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },

    // betId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "UserGameLog",
    //   trim: true,
    // },

    // roundId: {
    //   type: Number,
    // },

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
      enum: ["Credit", "Debit", "LostCommission"],
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

module.exports = mongoose.model("WalletTransaction", walletTrxSchema);
