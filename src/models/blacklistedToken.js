const mongoose = require("mongoose");

const jwtTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

jwtTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 });
module.exports = mongoose.model("blackListedToken", jwtTokenSchema);
