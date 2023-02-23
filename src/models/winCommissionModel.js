const mongoose = require("mongoose");

const winCommissionSchema = new mongoose.Schema(
  {
    brokerPercent: {
      type: Number,
      default: 1.75,
    },

    subBrokerPercent: {
      type: Number,
      default: 0.75,
    },

    sponserPercent: {
      type: Number,
      default: 0.5,
    },

    playerPercent: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WinCommission", winCommissionSchema);
