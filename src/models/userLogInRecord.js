const mongoose = require("mongoose");

const userLogInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },

    userName: {
      type: String,
    },

    browser: {
      type: String,
    },

    host: {
      type: String,
    },

    browser: {
      type: String,
    },
    
    ipAddress: {
      type: String,
    },

    logInStatus: {
      type: Boolean,
      default: false,
    },

    timeStamp: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserLog", userLogInSchema);
