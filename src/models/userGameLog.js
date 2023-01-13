const mongoose = require("mongoose");

const userGameLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
    },

    roundId: {
      type: Number,
    },

    cardSelected: {
      type: String,
    },

    betAmount: {
      type: Number,
    },

    remainingAmount: {
      type: Number,
    },

    resultCard: {
      type: String,
    },

    timeStamp: {
      type: String,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserGameLog", userGameLogSchema);
