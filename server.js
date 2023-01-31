const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const app = express();
const User = require("./src/models/user");
require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");
const { update } = require("./src/models/user");
const { isTypedArray } = require("util/types");
const userLogInRecord = require("./src/models/userLogInRecord");
const userGameLog = require("./src/models/userGameLog");
const route = require("./src/routes/route");
const gameLoopRoute = require("./src/routes/gameLoopRoute");
const userLogInRoute = require("./src/routes/userLogInRoute");
const adminRoute = require("./src/routes/adminRoute");
const gameLoopModel = require("./src/models/gameLoopModel");
const Game_loop = require("./src/models/game_loop");
const Stopwatch = require("statman-stopwatch");
const sw = new Stopwatch(true);
var id;

var GAME_LOOP_ID = GAME_LOOP_ID ? GAME_LOOP_ID : "63bfeaac7333cecf1030a29c";

let PASSPORT_SECRET = "Siamaq@9";
let MONGOOSE_DB_LINK =
  "mongodb+srv://siamaqConsultancy:siamaqAdmin@siamaqdatabase.obfed2x.mongodb.net/bustabitClone2";

// Start Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("clicked", (data) => {});
  console.log("socket.io: User connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("socket.io: User disconnected: ", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.log(error);
  });
});

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
app.use(
  session({
    secret: PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser(PASSPORT_SECRET));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// Passport.js login/register system
app.post("/api/login", (req, res, next) => {
  try {
    passport.authenticate("local", (err, user, info) => {
      if (err) throw err;
      if (!user) {
        res
          .status(400)
          .send({ status: false, message: "Username or Password is Wrong" });
      } else {
        req.logIn(user, async (err) => {
          if (err) throw err;

          // User LogIn Record
          const logData = {
            userId: user._id,
            userName: user.username,
            host: req.hostname,
            browser: req.rawHeaders[15],
            ipAddress: req.ip,
            timeStamp: new Date(),
            logInStatus: true,
          };
          const userLog = await userLogInRecord.create(logData);
          res.status(200).send("Login Successful");
        });
      }
    })(req, res, next);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Passport.js login/register system
app.post("/api/register", async (req, res) => {
  try {
    const requestBody = req.body;

    const { sponserId, username, userEmail, password } = requestBody;

    if (username.length < 3 || password < 3) {
      return;
    }

    const sponser = await User.findOne({ _id: req.body.sponserId });
    if (!sponser) {
      return res
        .status(404)
        .send({ status: false, message: "Sponser doesn't exists" });
    }

    let user = await User.findOne({ username: username });
    if (user) {
      return res.send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: username,
      userEmail: userEmail,
      password: hashedPassword,
      sponserId: sponserId,
    });

    await newUser.save();
    res.send("Loading...");

    // User.findOne({ username: req.body.username }, async (err, doc) => {
    //   if (err) throw err;
    //   if (doc) res.send("Username already exists");
    //   if (!doc) {
    //     const sponser = await User.findOne({ _id: req.body.sponserId });
    //     if (!sponser) {
    //       return res
    //         .status(404)
    //         .send({ status: false, message: "Sponser doesn't exists" });
    //     }
    //     const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //     const newUser = new User({
    //       username: req.body.username,
    //       userEmail: req.body.userEmail,
    //       password: hashedPassword,
    //     });
    //     await newUser.save();
    //     res.send("Loading...");
    //   }
    // });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

let game_phase = false;
// console.log(id);
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

  id = game._id;
  GAME_LOOP_ID = game._id;
  // console.log(game);
};

// Routes
app.get("/api", (req, res) => {
  try {
    res.status(200).send({ status: true, message: "hello from server" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/user", checkAuthenticated, (req, res) => {
  try {
    return res.status(200).send(req.user);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/logout", (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).send("success2");
      //  return res.redirect('/');
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/multiply", checkAuthenticated, async (req, res) => {
  try {
    const thisUser = await User.findById(req.user._id);
    const game_loop = await gameLoopModel.findById(GAME_LOOP_ID);
    crashMultipler = game_loop.multiplier_crash;
    thisUser.balance = thisUser.balance + 2;
    await thisUser.save();
    return res.status(200).json(thisUser);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/generate_crash_value", async (req, res) => {
  try {
    const randomInt = Math.floor(Math.random() * 6) + 1;
    const game_loop = await gameLoopModel.findById(GAME_LOOP_ID);
    game_loop.multiplier_crash = resultCard;
    await game_loop.save();
    return res.json(randomInt);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/retrieve", async (req, res) => {
  try {
    const game_loop = await gameLoopModel.findById(GAME_LOOP_ID);
    crashMultipler = game_loop.gameCrash;
    // console.log(crashMultipler)
    res.json(crashMultipler);
    const delta = sw.read(2);
    let seconds = delta / 1000.0;
    seconds = seconds.toFixed(2);
    return;
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});
var totalAmount = 0;
var totalAmountRedCard = 0;
var totalAmountBlackCard = 0;

// Creating Bet
app.post("/api/send_bet", checkAuthenticated, async (req, res) => {
  try {
    if (!betting_phase) {
      return res
        .status(400)
        .json({ customError: "IT IS NOT THE BETTING PHASE" });
    }
    if (isNaN(req.body.bet_amount) == true) {
      return res.status(400).send({ customError: "Not a number" });
    }
    // bDuplicate = false;
    theLoop = await gameLoopModel.findById(GAME_LOOP_ID);
    playerIdList = theLoop.active_player_id_list;
    let now = Date.now();
    for (let i = 0; i < playerIdList.length; i++) {
      if (playerIdList[i] === req.user.id) {
        // bDuplicate = true;
        return res
          .status(400)
          .send({ customError: "You are already betting this round" });
        // break;
      }
    }
    // if (bDuplicate) {
    //   return res.status(400).send({status:false, message:"Duplicate Bet"});
    // }
    thisUser = await User.findById(req.user.id);
    if (req.body.bet_amount > thisUser.balance) {
      return res.status(400).send({ customError: "Bet too big" });
    }
    await User.findByIdAndUpdate(req.user.id, {
      bet_amount: req.body.bet_amount,
      payout_multiplier: req.body.payout_multiplier,
    });
    await User.findByIdAndUpdate(req.user.id, {
      balance: thisUser.balance - req.body.bet_amount,
    });
    await Game_loop.findByIdAndUpdate(GAME_LOOP_ID, {
      $push: { active_player_id_list: req.user.id },
    });

    info_json = {
      the_user_id: req.user.id,
      the_username: req.user.username,
      bet_amount: req.body.bet_amount,
      cashout_multiplier: req.body.payout_multiplier,
      profit: null,
      b_bet_live: true,
    };

    live_bettors_table.push(info_json);

    // User Game Record
    const userGameData = {
      userId: thisUser._id,
      roundId: theLoop["roundId"],
      cardSelected: req.body.payout_multiplier,
      betAmount: req.body.bet_amount,
      remainingAmount: thisUser.balance - req.body.bet_amount,
      timeStamp: Date.now(),
    };
    const userGameRecordData = await userGameLog.create(userGameData);

    io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
    totalAmount = totalAmount + Number(req.body.bet_amount);

    if (req.body.payout_multiplier === "Red") {
      totalAmountRedCard += Number(req.body.bet_amount);
    } else {
      totalAmountBlackCard += Number(req.body.bet_amount);
    }
    return res
      .status(200)
      .send({ status: true, message: `Bet placed for ${req.user.username}` });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/calculate_winnings", checkAuthenticated, async (req, res) => {
  try {
    let theLoop = await gameLoopModel.findById(GAME_LOOP_ID);
    playerIdList = theLoop.active_player_id_list.map((e) => e.the_user_id);
    crash_number = theLoop.resultCard;
    for (const playerId of playerIdList) {
      const currUser = await User.findById(playerId);
      if (currUser.payout_multiplier == crash_number) {
        currUser.balance += currUser.bet_amount * 2;
        await currUser.save();
      }
    }
    theLoop.active_player_id_list = [];
    await theLoop.save();
    return res.json("You clicked on the calcualte winnings button ");
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Game Status
app.get("/api/get_game_status", async (req, res) => {
  try {
    let theLoop = await gameLoopModel.find().sort({ roundId: -1 }).limit(50);
    // console.log(theLoop);
    let crashlist = [];
    let roundIdList = [];

    for (let i = 0; i < theLoop.length; i++) {
      roundIdList.push(theLoop[i]["roundId"]);
      crashlist.push(theLoop[i]["gameCrash"]);
    }
    // console.log(roundId)
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

app.get("/api/manual_cashout_early", checkAuthenticated, async (req, res) => {
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
      current_multiplier == resultCard &&
      playerIdList.includes(req.user.id)
    ) {
      const currUser = await User.findById(req.user.id);
      currUser.balance += currUser.bet_amount * 2;
      await currUser.save();
      await theLoop.updateOne({
        $pull: { active_player_id_list: req.user.id },
      });
      for (const bettorObject of live_bettors_table) {
        if (bettorObject.the_user_id === req.user.id) {
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
    } else {
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/api/auto_cashout_early", checkAuthenticated, async (req, res) => {
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
      playerIdList.includes(req.user.id)
    ) {
      const currUser = await User.findById(req.user.id);
      currUser.balance += currUser.bet_amount * 2;
      await currUser.save();
      await theLoop.updateOne({
        $pull: { active_player_id_list: req.user.id },
      });
      for (const bettorObject of live_bettors_table) {
        if (bettorObject.the_user_id === req.user.id) {
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
});

// Send Message
app.post("/api/send_message_to_chatbox", checkAuthenticated, async (req, res) => {
  try {
    user_message = req.body.message_to_textbox;
    message_json = {
      the_user_id: req.user.id,
      the_username: req.user.username,
      message_body: user_message,
      the_time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      the_date: new Date().toLocaleDateString(),
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
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(400).send("No User Authentication");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.use("/api", route);
app.use("/api/loop", gameLoopRoute);
app.use("/api/userlog", userLogInRoute);
app.use("/api/admin", adminRoute);

// Listen Server
server.listen(4000, () => {
  console.log(`Server running on Port 4000`);
});

const cashout = async () => {
  theLoop = await gameLoopModel.findById(GAME_LOOP_ID);
  // console.log(theLoop);
  playerIdList = theLoop.active_player_id_list.map((e) => e.the_user_id);
  // crash_number = game_crash_value;
  for (const playerId of playerIdList) {
    const currUser = await User.findById(playerId);
    if (currUser.payout_multiplier == resultCard) {
      currUser.balance += currUser.bet_amount * 2;
      await currUser.save();
    }
  }
  theLoop.active_player_id_list = [];
  await theLoop.save();
};

// Run Game Loop
let phase_start_time = Date.now();
const pat = setInterval(async () => {
  await loopUpdate();
  isTypedArray;
}, 30000);

const messages_list = [];
let live_bettors_table = [];
let betting_phase = false;
let cashout_phase = true;
let game_crash_value = -69;
let sent_cashout = true;
let resultCard;

// Game Loop Update After Result Card
const loopUpdate = async () => {
  let time_elapsed = (Date.now() - phase_start_time) / 1000.0;

  if (betting_phase) {
    if (time_elapsed > 6) {
      sent_cashout = false;
      betting_phase = false;
      game_phase = true;
      // io.emit("start_multiplier_count");
      phase_start_time = Date.now();
    }
  } else if (game_phase) {
    // current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2);
    // if (current_multiplier > game_crash_value) {
    //   io.emit("stop_multiplier_count", game_crash_value.toFixed(2));
    // declare card elements
    const suits = ["Spades", "Diamonds", "Club", "Heart"];
    const values = [
      "Ace",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "Jack",
      "Queen",
      "King",
    ];

    // empty array to contain cards
    let deck = [];

    // create a deck of cards
    for (let i = 0; i < suits.length; i++) {
      for (let x = 0; x < values.length; x++) {
        let card = { Value: values[x], Suit: suits[i] };
        deck.push(card);
      }
    }

    // shuffle the cards
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    // Display 1 Random result(card)
    for (let i = 0; i < 1; i++) {
      // console.log(`${deck[i].Value} of ${deck[i].Suit}`);
      if (deck[i].Suit === "Club" || deck[i].Suit === "Spades") {
        // console.log("Black");
        resultCard = "Black";
      } else {
        resultCard = "Red";
        // console.log("Red");
      }
    }
    io.emit("randomCardColor", resultCard);

    game_phase = false;
    cashout_phase = true;
    phase_start_time = Date.now();
    // }
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
      // console.log(updateGameLoop);

      await update_loop.updateOne({
        $push: { previous_crashes: resultCard },
      });
      // await update_loop.updateOne({ $unset: { "previous_crashes.0": 1 } });
      // await update_loop.updateOne({ $pull: { previous_crashes: null } });
      // const the_round_id_list = update_loop.round_id_list;
      // await update_loop.updateOne({
      //   $push: {
      //     round_id_list: the_round_id_list[the_round_id_list.length - 1] + 1,
      //   },
      // });
      // await update_loop.updateOne({ $unset: { "round_id_list.0": 1 } });
      // await update_loop.updateOne({ $pull: { round_id_list: null } });
      cashout();
    }

    if (time_elapsed > 3) {
      cashout_phase = false;
      betting_phase = true;
      // let randomInt = Math.floor(Math.random() * (9999999999 - 0 + 1) + 0);
      // if (randomInt % 33 == 0) {
      //   game_crash_value = 1;
      // } else {
      //   random_int_0_to_1 = Math.random();
      //   while (random_int_0_to_1 == 0) {
      //     random_int_0_to_1 = Math.random;
      //   }
      //   // game_crash_value = 0.01 + 0.99 / random_int_0_to_1;
      //   // game_crash_value = Math.round(game_crash_value * 100) / 100;
      // }
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
      io.emit("start_betting_phase");
      io.emit("testingvariable");
      live_bettors_table = [];
      totalAmount = 0;
      totalAmountRedCard = 0;
      totalAmountBlackCard = 0;
      phase_start_time = Date.now();
      game();
    }
  }
};
