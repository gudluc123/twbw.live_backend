const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const express = require("express");
const cors = require("cors");
// const passport = require("passport");
// const passportLocal = require("passport-local").Strategy;
// const cookieParser = require("cookie-parser");
// const bcrypt = require("bcryptjs");
// const session = require("express-session");
const app = express();
const User = require("./src/models/user");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");
// const { isTypedArray } = require("util/types");
const userGameLog = require("./src/models/userGameLog");
const route = require("./src/routes/route");
const gameLoopRoute = require("./src/routes/gameLoopRoute");
const userLogInRoute = require("./src/routes/userLogInRoute");
const adminRoute = require("./src/routes/adminRoute");
const gameLoopModel = require("./src/models/gameLoopModel");
const Game_loop = require("./src/models/game_loop");
// const Stopwatch = require("statman-stopwatch");
// const sw = new Stopwatch(true);
const morgan = require("morgan");
const { Authentication, AuthBalcklisted } = require("./src/middleware/auth");
const { randomTransactionId } = require("./src/utils/helper");
const gameTrxModel = require("./src/models/gameTrxModel");
const walletRoute = require("./src/routes/walletRoute");

var GAME_LOOP_ID = GAME_LOOP_ID ? GAME_LOOP_ID : "63f5b4df29800748be638f86"; //"63f4bc54e97914d49eaf4722";;

// let PASSPORT_SECRET = "Siamaq@9";
let MONGOOSE_DB_LINK =
  "mongodb+srv://siamaqConsultancy:siamaqAdmin@siamaqdatabase.obfed2x.mongodb.net/twbwDbTest";

// Start Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let resultCard;
let timeEnd;
io.on("connection", (socket) => {
  socket.on("clicked", (data) => {});
  console.log("socket.io: User connected: ", socket.id);

  socket.on("result", (data) => {
    // console.log("data from client:", data);
    resultCard = data;
  });

  socket.on("timeEnd", (data) => {
    // console.log("data from client time:", data);
    timeEnd = data;
  });

  socket.on("disconnect", () => {
    console.log("socket.io: User disconnected: ", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.log(error);
  });
});
// console.log(resultCard);
// Connect to MongoDB
mongoose.connect(MONGOOSE_DB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Backend Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan("dev"));

// app.set("trust proxy", 2);
// app.use(
//   session({
//     secret: PASSPORT_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: true, sameSite: false },
//     name: "cardToken",
//   })
// );
// app.use(cookieParser(PASSPORT_SECRET));
// app.use(passport.initialize());
// app.use(passport.session());
// require("./passportConfig")(passport);
// Passport.js login/register system

let game_phase = false;
let game = async () => {
  let gameLoopList = await gameLoopModel.find().count();

  const gameData = {
    active_player_id_list: live_bettors_table,
    // gameCrash: resultCard,
    b_betting_phase: betting_phase,
    b_game_phase: game_phase,
    b_cashout_phase: cashout_phase,
    roundId: gameLoopList + 1,
    chat_messages_list: messages_list,
  };
  const game = await gameLoopModel.create(gameData);

  GAME_LOOP_ID = game._id;
};

// Routes
app.get("/api", (req, res) => {
  try {
    res.status(200).send({ status: true, message: "hello from server" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/user", AuthBalcklisted, Authentication, async (req, res) => {
  try {
    let userId = req.user._id;
    // userId = userId.trim();

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid ObjectId" });
    }

    const user = await User.findById({ _id: userId }).select("-__v -password");

    if (!user) {
      return res.status(403).send({ status: false, message: "Not Authorized" });
    }
    io.emit("userData", user);

    // console.log(req.user);
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

var totalAmount = 0;
var totalAmountRedCard = 0;
var totalAmountBlackCard = 0;
let totalPlayer = [];
let totalPlayerBetting = [];

// Creating Bet
app.post("/api/send_bet", AuthBalcklisted, Authentication, async (req, res) => {
  try {
    const requestBody = req.body;
    const { bet_amount, payout_multiplier } = requestBody;
    // console.log(betting_phase);

    if (!betting_phase) {
      return res
        .status(400)
        .json({ customError: "IT IS NOT THE BETTING PHASE" });
    }
    if (isNaN(bet_amount) == true) {
      return res.status(400).send({ customError: "Not a number" });
    }
    if (bet_amount < 10) {
      return res.status(400).send({ customError: "Bet can't less than 10$" });
    }
    if (bet_amount > 500) {
      return res
        .status(400)
        .send({ customError: "Bet can't greater than 500$" });
    }

    totalAmount = totalAmount + Number(bet_amount);
    if (payout_multiplier === "Red") {
      totalAmountRedCard += Number(bet_amount);
    } else {
      totalAmountBlackCard += Number(bet_amount);
    }

    // bDuplicate = false;
    theLoop = await gameLoopModel.findById(GAME_LOOP_ID);
    playerIdList = theLoop.active_player_id_list;
    let now = Date.now();
    for (let i = 0; i < playerIdList.length; i++) {
      if (playerIdList[i] === req.user._id) {
        // bDuplicate = true;
        return res
          .status(400)
          .send({ customError: "You are already betting this round" });
        // break;
      }
    }

    thisUser = await User.findById(req.user._id);
    if (bet_amount > thisUser.balance) {
      return res.status(400).send({ customError: "Bet too big" });
    }

    totalPlayer.push(req.user._id);
    if (totalAmount > 10000 || totalPlayer.length > 100) {
      return res
        .status(400)
        .send({ customError: "Bet limit exdeeds, bet next round" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      bet_amount: bet_amount,
      payout_multiplier: payout_multiplier,
    });
    await User.findByIdAndUpdate(req.user._id, {
      balance: thisUser.balance - bet_amount,
    });
    await Game_loop.findByIdAndUpdate(GAME_LOOP_ID, {
      $push: { active_player_id_list: req.user._id },
    });

    info_json = {
      the_user_id: req.user._id,
      the_username: req.user.username,
      bet_amount: bet_amount,
      cashout_multiplier: payout_multiplier,
      profit: null,
      b_bet_live: true,
    };

    live_bettors_table.push(info_json);

    // User Game Record
    const userGameData = {
      userId: thisUser._id,
      roundId: theLoop["roundId"],
      cardSelected: payout_multiplier,
      betAmount: bet_amount,
      remainingAmount: thisUser.balance - bet_amount,
      timeStamp: Date.now(),
    };
    const userGameRecordData = await userGameLog.create(userGameData);
    totalPlayerBetting.push(userGameRecordData._id);

    const transactionData = {
      userId: thisUser._id,
      betId: userGameRecordData._id,
      roundId: theLoop["roundId"],
      debit: bet_amount,
      transactionId: randomTransactionId(9, ["A", "Z"], ["0", "9"]),
      description: "For Betting in Game",
      status: "Success",
      txType: "Debit",
    };
    const transactionRecordOfBet = await gameTrxModel.create(transactionData);

    io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
    io.emit("update_user");

    return res
      .status(200)
      .send({ status: true, message: `Bet placed for ${req.user.username}` });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Game Status
app.get("/api/get_game_status", async (req, res) => {
  try {
    let theLoop = await gameLoopModel.find().sort({ roundId: -1 }).limit(50);
    let crashlist = [];
    let roundIdList = [];

    for (let i = 0; i < theLoop.length; i++) {
      roundIdList.push(theLoop[i]["roundId"]);
      crashlist.push(theLoop[i]["gameCrash"]);
    }

    io.emit("crash_history", crashlist);
    io.emit("get_round_id_list", roundIdList);

    if (betting_phase == true) {
      return res.json({ phase: "betting_phase", info: phase_start_time });
    } else if (game_phase == true) {
      return res.json({ phase: "game_phase", info: phase_start_time });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get(
  "/api/auto_cashout_early",
  AuthBalcklisted,
  Authentication,
  async (req, res) => {
    try {
      if (!game_phase) {
        return res
          .status(400)
          .send({ status: false, message: "It's not Game phase" });
      }

      theLoop = await gameLoopModel.findById(GAME_LOOP_ID);
      let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
      current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2);
      playerIdList = theLoop.active_player_id_list.map((e) => e.the_user_id);

      if (
        req.user.payout_multiplier == resultCard &&
        playerIdList.includes(req.user._id)
      ) {
        const currUser = await User.findById(req.user._id);
        currUser.balance += currUser.bet_amount * 2;
        await currUser.save();
        await theLoop.updateOne({
          $pull: { active_player_id_list: req.user._id },
        });

        for (const bettorObject of live_bettors_table) {
          if (bettorObject.the_user_id === req.user._id) {
            bettorObject.cashout_multiplier = 2;
            bettorObject.profit = currUser.bet_amount * 2 - currUser.bet_amount;
            bettorObject.b_bet_live = false;
            io.emit(
              "receive_live_betting_table",
              JSON.stringify(live_bettors_table)
            );
            break;
          }
        }

        return res.status(200).json(currUser);
      }
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  }
);

// Send Message
app.post("/api/send_message_to_chatbox", Authentication, async (req, res) => {
  try {
    let user_message = req.body.message_to_textbox;
    let message_json = {
      the_user_id: req.user._id,
      the_username: req.user.username,
      message_body: user_message,
      the_time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),

      the_date: new Date().toLocaleDateString(),
      time: new Date(),
    };

    theLoop = await gameLoopModel.findById(GAME_LOOP_ID);

    const somevar = await gameLoopModel.findOneAndUpdate(
      { _id: GAME_LOOP_ID },
      { $push: { chat_messages_list: message_json } }
    );

    messages_list.push(message_json);
    io.emit(
      "receive_message_for_chat_box",
      JSON.stringify(theLoop.chat_messages_list)
    );

    return res.status(200).send({ status: true, message: "Message sent" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Chat History
app.get("/api/get_chat_history", async (req, res) => {
  try {
    theLoop = await gameLoopModel.findById(GAME_LOOP_ID);

    return res.status(200).json(
      theLoop.chat_messages_list.reverse() //.slice(0, 50)
    );
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Active Player
app.get("/api/retrieve_active_bettors_list", async (req, res) => {
  try {
    io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));

    return res.status(200).send({ status: true });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Bet History
app.get("/api/retrieve_bet_history", async (req, res) => {
  try {
    let theLoop = await gameLoopModel.find().sort({ roundId: -1 }).limit(50);
    let crashList1 = [];

    for (let i = 0; i < theLoop.length; i++) {
      crashList1.push(theLoop[i]["gameCrash"]);
    }
    io.emit("crash_history", crashList1);

    return res.status(200).send({ status: true });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Passport Authentication
// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   return res.status(400).send("No User Authentication");
// }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect("/");
//   }
//   next();
// }

app.use("/api", route);
app.use("/api/loop", gameLoopRoute);
app.use("/api/userlog", userLogInRoute);
app.use("/api/admin", adminRoute);
app.use("/api/wallet", walletRoute);

// Listen Server
server.listen(5000, () => {
  console.log(`Server running on Port 5000`);
});

// let totalPlayerWin = 0;
const cashout = async () => {
  // console.log(totalPlayerBetting);
  let theLoop = await gameLoopModel.findById(GAME_LOOP_ID);

  for (const bettingId of totalPlayerBetting) {
    // console.log(bettingId);
    const userBet = await userGameLog.findById(bettingId);
    const currUser = await User.findById(userBet.userId);

    // If a player win Game
    if (userBet.cardSelected === resultCard) {
      currUser.balance += currUser.bet_amount * 2;
      await currUser.save();
      // totalPlayerWin = totalPlayerWin + 1;

      const winTrData = {
        userId: currUser._id,
        betId: bettingId,
        roundId: theLoop["roundId"],
        credit: currUser.bet_amount * 2,
        transactionId: randomTransactionId(9, ["A", "Z"], ["0", "9"]),
        description: "For Betting in Game(Win) ",
        status: "Success",
        txType: "Credit",
      };
      const winTrRecordOfBet = await gameTrxModel.create(winTrData);
    } else {
      // If a player Lost Game
      currUser.balance += (currUser.bet_amount * 1) / 100;

      // If a player is self "Broker"
      if (currUser.role === "Broker") {
        currUser.balance += (currUser.bet_amount * 3) / 100;
      } else if (currUser.role === "SubBroker") {
        // If a player is self "SubBroker"
        currUser.balance += (currUser.bet_amount * 1.25) / 100;
        const sponserofSB = await User.findById(currUser.sponserId);

        if (sponserofSB.role === "Broker") {
          sponserofSB.balance += (currUser.bet_amount * 1.75) / 100;
        }
        await sponserofSB.save();
      } else if (currUser.role === "Sponser") {
        // If a player is self "Sponser"
        currUser.balance += (currUser.bet_amount * 0.5) / 100;
        const sponserofSponser = await User.findById(currUser.sponserId);

        if (sponserofSponser.role === "Broker") {
          sponserofSponser.balance += (currUser.bet_amount * 2.5) / 100;
        } else if (sponserofSponser.role === "SubBroker") {
          sponserofSponser.balance += (currUser.bet_amount * 0.75) / 100;
          const sponserofSB = await User.findById(sponserofSponser.sponserId);

          if (sponserofSB.role === "Broker") {
            sponserofSB.balance += (currUser.bet_amount * 1.75) / 100;
          }
          await sponserofSB.save();
        }
        await sponserofSponser.save();
      } else {
        // If a player role is "Player"
        const currSponser = await User.findById(currUser.sponserId);

        // If Sponser of "Player" is a "Broker"
        if (currSponser.role === "Broker") {
          currSponser.balance += (currUser.bet_amount * 3) / 100;
        } else if (currSponser.role === "SubBroker") {
          // If Sponser of "Player" is a "SubBroker"
          currSponser.balance += (currUser.bet_amount * 1.25) / 100;
          const sponserofSB = await User.findById(currSponser.sponserId);

          if (sponserofSB.role === "Broker") {
            sponserofSB.balance += (currUser.bet_amount * 1.75) / 100;
          }
          await sponserofSB.save();
        } else if (currSponser.role === "Sponser") {
          // If Sponser of "Player" is a "Sponser"
          currSponser.balance += (currUser.bet_amount * 0.5) / 100;
          const sponserofSponser = await User.findById(currSponser.sponserId);

          // If Sponser of "Sponser"(Player") is a "Broker"
          if (sponserofSponser.role === "Broker") {
            sponserofSponser.balance += (currUser.bet_amount * 2.5) / 100;
          } else if (sponserofSponser.role === "SubBroker") {
            // If Sponser of "Sponser"(Player") is a "SubBroker"
            sponserofSponser.balance += (currUser.bet_amount * 2.5) / 100;
          }
          await sponserofSponser.save();
        }
        await currSponser.save();
      }

      await currUser.save();
    }
  }

  // const updateData = {
  //   totalPlayerWin: totalPlayerWin,
  //   totalPlayerLost: Number(totalPlayerBetting.length) - Number(totalPlayerWin),
  // };
  // const updateGameData = await gameLoopModel.findOneAndUpdate(
  //   { _id: GAME_LOOP_ID },
  //   { $set: updateData }
  // );
  totalPlayerBetting = [];
  totalPlayer = [];
};

// Run Game Loop
let phase_start_time = Date.now();
// const pat = setInterval(async () => {
//   await loopUpdate();
//   isTypedArray;
// }, 30000);

const pat = setInterval(async () => {
  if (timeEnd) {
    await loopUpdate();
  }
}, 500);

const messages_list = [];
let live_bettors_table = [];
let betting_phase = false;
let cashout_phase = true;
// let game_crash_value = -69;
let sent_cashout = true;
// console.log(betting_phase);

// Game Loop Update After Result Card
const loopUpdate = async () => {
  let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
  // console.log(time_elapsed)

  if (betting_phase) {
    if (time_elapsed > 6) {
      sent_cashout = false;
      // betting_phase = true;
      betting_phase = false;
      game_phase = true;
      phase_start_time = Date.now();
    }
  } else if (game_phase) {
    // io.on("result", function (data) {
    //   resultCard = data;
    //   console.log(data);
    // });

    game_phase = false;
    cashout_phase = true;
    phase_start_time = Date.now();
  } else if (cashout_phase) {
    if (!sent_cashout) {
      sent_cashout = true;
      right_now = Date.now();

      const update_loop = await gameLoopModel.findById(GAME_LOOP_ID);
      let updaetData = {
        gameCrash: resultCard,
        active_player_id_list: live_bettors_table,
        totalPlayerBetting: live_bettors_table.length,
        totalAmountBet: totalAmount,
        totalAmountBetRedCard: totalAmountRedCard,
        totalAmountBetBlackCard: totalAmountBlackCard,
      };

      const updateGameLoop = await gameLoopModel.findOneAndUpdate(
        { _id: GAME_LOOP_ID },
        { $set: updaetData },
        {
          new: true,
        }
      );

      await update_loop.updateOne({
        $push: { previous_crashes: resultCard },
      });
      cashout();
    }

    if (time_elapsed > 3) {
      cashout_phase = false;
      betting_phase = true;

      io.emit("update_user");
      let crashList2 = [];
      let roundIdList2 = [];
      let theLoop = await gameLoopModel.find().sort({ roundId: -1 }).limit(50);

      for (let i = 0; i < theLoop.length; i++) {
        roundIdList2.push(theLoop[i]["roundId"]);
        crashList2.push(theLoop[i]["gameCrash"]);
      }

      io.emit("crash_history", crashList2);
      io.emit("get_round_id_list", roundIdList2);
      // io.emit("start_betting_phase");
      io.emit("testingvariable");
      live_bettors_table = [];
      totalAmount = 0;
      totalAmountRedCard = 0;
      totalAmountBlackCard = 0;
      phase_start_time = Date.now();
      game();
      timeEnd = false;
    }
  }
};
