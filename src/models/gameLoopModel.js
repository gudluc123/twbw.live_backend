const mongoose = require("mongoose");
const gameLoop = new mongoose.Schema(
  {
    active_player_id_list: {
      type: [],
      default: [],
    },

    gameCrash: {
      type: String,
      default: null,
    },

    totalAmountBet: {
      type: Number,
      default: 0,
    },

    totalAmountBetRedCard: {
      type: Number,
      default: 0,
    },

    totalAmountBetBlackCard: {
      type: Number,
      default: 0,
    },

    totalPlayerBetting: {
      type: Number,
      default: 0,
    },

    totalPlayerWin: {
      type: Number,
      default: 0,
    },

    totalPlayerLost: {
      type: Number,
      default: 0,
    },

    b_betting_phase: {
      type: Boolean,
      default: false,
    },

    b_game_phase: {
      type: Boolean,
      default: false,
    },

    b_cashout_phase: {
      type: Boolean,
      default: false,
    },

    timeNow: {
      type: Number,
      default: Date.now(),
    },

    previous_crashes: {
      type: [String],
      default: [],
    },

    roundId: {
      type: Number,
    },

    chat_messages_list: {
      type: [],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("gameLoop", gameLoop);
