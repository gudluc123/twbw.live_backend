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
const User = require("./models/user");
const Game_loop = require("./models/game_loop");
require("dotenv").config();

const GAME_LOOP_ID = "63a18010136c7f925346c6c0";
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
const https = require("https");
const Stopwatch = require("statman-stopwatch");
const { update } = require("./models/user");
const { isTypedArray } = require("util/types");
const userLogInRecord = require("./models/userLogInRecord");
const userGameLog = require("./models/userGameLog");
const sw = new Stopwatch(true);

let PASSPORT_SECRET = "Siamaq@9";
let MONGOOSE_DB_LINK =
  "mongodb+srv://siamaqConsultancy:siamaqAdmin@siamaqdatabase.obfed2x.mongodb.net/bustabitClone";

// Start Socket.io Server
const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  },
  app
);
const io = new Server(server, {
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
mongoose.connect(process.env.MONGOOSE_DB_LINK || MONGOOSE_DB_LINK, {
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
    secret: process.env.PASSPORT_SECRET || PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser(process.env.PASSPORT_SECRET || PASSPORT_SECRET));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// Passport.js login/register system
app.post("/login", (req, res, next) => {
  try {
    // console.log(req.ip)
    passport.authenticate("local", (err, user, info) => {
      // console.log(user)

      if (err) throw err;
      if (!user) {
        res.send("Username or Password is Wrong");
      } else {
        req.logIn(user, async (err) => {
          if (err) throw err;

          // User LogIn Record
          const logData = {
            userId: user._id,
            userName: user.username,
            host: req.hostname,
            ipAddress: req.ip,
            timeStamp: Date.now(),
            logInStatus: true,
          };
          const userLog = await userLogInRecord.create(logData);

          res.send("Login Successful");
        });
      }
    })(req, res, next);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Passport.js login/register system
app.post("/register", async (req, res) => {
  try {
    if (req.body.username.length < 3 || req.body.password < 3) {
      return;
    }

    User.findOne({ username: req.body.username }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("Username already exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        await newUser.save();
        res.send("Loading...");
      }
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// app.post("/gameLoop", async (req, res) => {
//   try {
//     const requestBody = req.body;

//     const {
//       round_number,
//       active_player_id_list,
//       multiplier_crash,
//       b_betting_phase,
//       b_game_phase,
//       b_cashout_phase,
//       time_now,
//       round_id_list,
//       chat_messages_list,
//     } = requestBody;

//     const game = await Game_loop.create(requestBody);

//     return res
//       .status(201)
//       .send({ status: true, message: "Success", data: game });
//   } catch (error) {
// return res.status(500).send({ status: false, message: error.message });
//   }
// });

// Routes

app.get("/", (req, res) => {
  try {
    res.send("hello from server");
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/user", checkAuthenticated, (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/logout", (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.send("success2");
      // res.redirect('/');
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/multiply", checkAuthenticated, async (req, res) => {
  try {
    const thisUser = await User.findById(req.user._id);
    const game_loop = await Game_loop.findById(GAME_LOOP_ID);
    crashMultipler = game_loop.multiplier_crash;
    thisUser.balance = thisUser.balance + 2;
    await thisUser.save();
    res.json(thisUser);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/generate_crash_value", async (req, res) => {
  try {
    const randomInt = Math.floor(Math.random() * 6) + 1;
    const game_loop = await Game_loop.findById(GAME_LOOP_ID);
    game_loop.multiplier_crash = resultCard;
    await game_loop.save();
    res.json(randomInt);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/retrieve", async (req, res) => {
  try {
    const game_loop = await Game_loop.findById(GAME_LOOP_ID);
    crashMultipler = game_loop.multiplier_crash;
    // console.log(crashMultipler)
    res.json(crashMultipler);
    const delta = sw.read(2);
    // console.log(delta)
    let seconds = delta / 1000.0;
    seconds = seconds.toFixed(2);
    // console.log(seconds)
    return;
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Creating Bet
app.post("/send_bet", checkAuthenticated, async (req, res) => {
  try {
    if (!betting_phase) {
      res.status(400).json({ customError: "IT IS NOT THE BETTING PHASE" });
      return;
    }
    if (
      isNaN(req.body.bet_amount) == true
      // isNaN(req.body.payout_multiplier) == true
    ) {
      res.status(400).json({ customError: "Not a number" });
    }
    bDuplicate = false;
    theLoop = await Game_loop.findById(GAME_LOOP_ID);
    playerIdList = theLoop.active_player_id_list;
    let now = Date.now();
    for (let i = 0; i < playerIdList.length; i++) {
      if (playerIdList[i] === req.user.id) {
        res
          .status(400)
          .json({ customError: "You are already betting this round" });
        bDuplicate = true;
        break;
      }
    }
    if (bDuplicate) {
      return;
    }
    thisUser = await User.findById(req.user.id);
    if (req.body.bet_amount > thisUser.balance) {
      res.status(400).json({ customError: "Bet too big" });
      return;
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
      cashout_multiplier: null,
      profit: null,
      b_bet_live: true,
    };

    live_bettors_table.push(info_json);

    // User Game Record
    const userGameData = {
      userId: thisUser._id,
      roundId: theLoop["round_id_list"].length,
      cardSelected: req.body.payout_multiplier,
      betAmount: req.body.bet_amount,
      // resultCard: resultCard,
      timeStamp: Date.now(),
    };
    const userGameRecordData = await userGameLog.create(userGameData);

    io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
    res.json(`Bet placed for ${req.user.username}`);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/calculate_winnings", checkAuthenticated, async (req, res) => {
  try {
    let theLoop = await Game_loop.findById(GAME_LOOP_ID);
    playerIdList = theLoop.active_player_id_list;
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
    res.json("You clicked on the calcualte winnings button ");
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Game Status
app.get("/get_game_status", async (req, res) => {
  try {
    let theLoop = await Game_loop.findById(GAME_LOOP_ID);
    const crashes = theLoop.previous_crashes.reverse().slice(0, 15);
    const roundId = theLoop.round_id_list.reverse().slice(0, 15);
    // console.log(roundId)
    io.emit("crash_history", crashes);
    io.emit("get_round_id_list", roundId);
    if (betting_phase == true) {
      res.json({ phase: "betting_phase", info: phase_start_time });
      return;
    } else if (game_phase == true) {
      res.json({ phase: "game_phase", info: phase_start_time });
      return;
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/manual_cashout_early", checkAuthenticated, async (req, res) => {
  try {
    if (!game_phase) {
      return;
    }
    theLoop = await Game_loop.findById(GAME_LOOP_ID);
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2);
    if (
      current_multiplier == resultCard &&
      theLoop.active_player_id_list.includes(req.user.id)
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
      res.json(currUser);
    } else {
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

app.get("/auto_cashout_early", checkAuthenticated, async (req, res) => {
  try {
    if (!game_phase) {
      return;
    }
    theLoop = await Game_loop.findById(GAME_LOOP_ID);
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2);
    if (
      req.user.payout_multiplier == resultCard &&
      theLoop.active_player_id_list.includes(req.user.id)
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
      res.json(currUser);
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Send Message
app.post("/send_message_to_chatbox", checkAuthenticated, async (req, res) => {
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
    theLoop = await Game_loop.findById(GAME_LOOP_ID);
    const somevar = await Game_loop.findOneAndUpdate(
      { _id: GAME_LOOP_ID },
      { $push: { chat_messages_list: message_json } }
    );

    messages_list.push(message_json);
    io.emit(
      "receive_message_for_chat_box",
      JSON.stringify(theLoop.chat_messages_list)
    );
    res.send("Message sent");
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Chat History
app.get("/get_chat_history", async (req, res) => {
  try {
    theLoop = await Game_loop.findById(GAME_LOOP_ID);
    res.json(theLoop.chat_messages_list.reverse().slice(0, 50));
    return;
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Active Player
app.get("/retrieve_active_bettors_list", async (req, res) => {
  try {
    io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
    return;
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Bet History
app.get("/retrieve_bet_history", async (req, res) => {
  try {
    let theLoop = await Game_loop.findById(GAME_LOOP_ID);
    const crashesList = theLoop.previous_crashes.reverse().slice(0, 15);

    io.emit("crash_history", crashesList);
    return;
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

// Passport Authentication
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.send("No User Authentication");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

// Listen Server
server.listen(4000, () => {
  console.log(`Server running on Port 4000`);
});

const cashout = async () => {
  theLoop = await Game_loop.findById(GAME_LOOP_ID);
  playerIdList = theLoop.active_player_id_list;
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
}, 16000);

const messages_list = [];
let live_bettors_table = [];
let betting_phase = false;
let game_phase = false;
let cashout_phase = true;
let game_crash_value = -69;
let sent_cashout = true;
let resultCard;

// Game Loop Update After Result Card
const loopUpdate = async () => {
  let time_elapsed = (Date.now() - phase_start_time) / 1000.0;

  // console.log(time_elapsed);

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
      cashout();
      sent_cashout = true;
      right_now = Date.now();
      const update_loop = await Game_loop.findById(GAME_LOOP_ID);
      await update_loop.updateOne({
        $push: { previous_crashes: resultCard },
      });
      // await update_loop.updateOne({ $unset: { "previous_crashes.0": 1 } });
      // await update_loop.updateOne({ $pull: { previous_crashes: null } });
      const the_round_id_list = update_loop.round_id_list;
      await update_loop.updateOne({
        $push: {
          round_id_list: the_round_id_list[the_round_id_list.length - 1] + 1,
        },
      });
      // await update_loop.updateOne({ $unset: { "round_id_list.0": 1 } });
      // await update_loop.updateOne({ $pull: { round_id_list: null } });
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
      let theLoop = await Game_loop.findById(GAME_LOOP_ID);
      const roundIdList = theLoop.round_id_list.reverse().slice(0, 15);
      const crashesList1 = theLoop.previous_crashes.reverse().slice(0, 15);

      io.emit("crash_history", crashesList1);
      io.emit("get_round_id_list", roundIdList);
      io.emit("start_betting_phase");
      io.emit("testingvariable");
      live_bettors_table = [];
      phase_start_time = Date.now();
    }
  }
};

// const updateUserGameLog = await userGameLog.updateOne(
//   { _id: userGameLogId },
//   {
//     roundId: the_round_id_list[the_round_id_list.length - 1] + 1,
//     resultCard: resultCard,
//   },
//   { new: true }
// );
// console.log(updateUserGameLog);
