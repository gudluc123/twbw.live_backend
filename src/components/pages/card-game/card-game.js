/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Modal from "../../modal/Modal";
import { ToastContainer, toast } from "react-toastify";
import { Slide } from "react-toastify";
import io from "socket.io-client";
import Axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import blackCard from "../../../images/blackCard.png";
import redCard from "../../../images/redCard.png";
import { Link } from "react-router-dom";

function CardGame() {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [betAmount, setBetAmount] = useState(
    localStorage.getItem("local_storage_wager") || 100
  );
  const [autoPayoutMultiplier, setAutoPayoutMultiplier] = useState(
    localStorage.getItem("local_storage_multiplier") || 2
  );
  const [userData, setUserData] = useState(null);
  const [multiplier, setMultiplier] = useState(null);
  const [liveMultiplier, setLiveMultiplier] = useState("CONNECTING...");
  const [liveMultiplierSwitch, setLiveMultiplierSwitch] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [globalSocket, setGlobalSocket] = useState(null);
  const [betActive, setBetActive] = useState(false);
  const [crashHistory, setCrashHistory] = useState([]);
  const [roundIdList, setRoundIdList] = useState([]);
  const [bBettingPhase, setbBettingPhase] = useState(false);
  const [bettingPhaseTime, setBettingPhaseTime] = useState(-1);
  const [bBetForNextRound, setbBetForNextRound] = useState(false);
  const [hookToNextRoundBet, setHookToNextRoundBet] = useState(false);
  const [messageToTextBox, setMessageToTextBox] = useState("");
  const [chatHistory, setChatHistory] = useState();
  const [liveBettingTable, setLiveBettingTable] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [authResponseMessage, setAuthResponseMessage] = useState("");
  const [globalTimeNow, setGlobalTimeNow] = useState(0);
  const [openModalLogin, setOpenModalLogin] = useState(false);
  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [chartSwitch, setChartSwitch] = useState(false);
  // const [gamePhaseTimeElapsed, setGamePhaseTimeElapsed] = useState();
  const [startTime, setStartTime] = useState();
  const [selectedCard, setSelectedCard] = useState("");
  const [resultCard, setResultCard] = useState("");
  // const [streakList, setStreakList] = useState([]);
  const [tenNumbers, setTenNumbers] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // const multiplierCount = useRef([]);
  // const timeCount_xaxis = useRef([]);
  //  console.log(resultCard)
 // http://139.59.36.115:4000/get_chat_history

  // Socket.io setup
  useEffect(() => {
    retrieve();
    const socket = io.connect("http://139.59.36.115:4000");
    setGlobalSocket(socket);

    socket.on("news_by_server", function (data) {
      setAnnouncement(data);
    });

    // socket.on("start_multiplier_count", function (data) {
    //   setGlobalTimeNow(Date.now());
    //   setLiveMultiplierSwitch(true);
    // });

    socket.on("randomCardColor", function (data) {
      // console.log(data);
      setResultCard(data);
      setLiveMultiplier(data);
      setLiveMultiplierSwitch(false);
      setBetActive(false);
    });

    socket.on("update_user", function (data) {
      getUser();
    });

    socket.on("crash_history", function (data) {
      setCrashHistory(data);

      // console.log(data);

      // let temp_streak_list = [];
      // const new_data = data;
      // let blue_counter = 0;
      // let red_counter = 0;

      // for (let i = 0; i < data.length; i++) {
      //   if (new_data[i] >= 2) {
      //     blue_counter += 1;
      //     red_counter = 0;
      //     temp_streak_list.push(blue_counter);
      //   } else {
      //     red_counter += 1;
      //     blue_counter = 0;
      //     temp_streak_list.push(red_counter);
      //   }
      // }
      // setStreakList(temp_streak_list.reverse());
    });

    socket.on("get_round_id_list", function (data) {
      // console.log(data);
      setRoundIdList(data);
    });

    socket.on("start_betting_phase", function (data) {
      setGlobalTimeNow(Date.now());
      setLiveMultiplier("Starting...");
      setbBettingPhase(true);
      setLiveBettingTable(null);
      setHookToNextRoundBet(true);
      retrieve_active_bettors_list();

      // multiplierCount.current = [];
      // timeCount_xaxis.current = [];
    });

    socket.on("receive_message_for_chat_box", (data) => {
      get_chat_history();
    });

    socket.on("receive_live_betting_table", (data) => {
      // console.log(data);
      setLiveBettingTable(data);
      data = JSON.parse(data);
      setTenNumbers(Array(10 - data.length).fill(2));
    });

    socket.on("connect_error", (error) => {
      console.log(error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Define useEffects
  useEffect(() => {
    if (hookToNextRoundBet) {
      if (bBetForNextRound) {
        send_bet();
      } else {
      }
      setHookToNextRoundBet(false);
      setbBetForNextRound(false);
    }
  }, [hookToNextRoundBet]);

  useEffect(() => {
    if (betActive && selectedCard === resultCard) {
      userData.balance += betAmount * 2;
      auto_cashout_early();
      setBetActive(false);
    }
  }, [resultCard]);

  const buttonClick = () => {
    globalSocket.emit("clicked", { message2: Date.now() });
  };

  useEffect(() => {
    let bettingInterval = null;

    if (bBettingPhase) {
      bettingInterval = setInterval(() => {
        let time_elapsed = (Date.now() - globalTimeNow) / 1000.0;
        // console.log(time_elapsed);
        let time_remaining = (30 - time_elapsed).toFixed(2);
        setBettingPhaseTime(time_remaining);
        if (time_remaining < 0) {
          setbBettingPhase(false);
        }
      }, 100);
    }
    return () => {
      clearInterval(bettingInterval);
      setBettingPhaseTime("Starting...");
    };
  }, [bBettingPhase]);

  useEffect(() => {
    if (bBetForNextRound) {
    } else {
    }
  }, [bBetForNextRound]);

  useEffect(() => {
    localStorage.setItem("local_storage_wager", betAmount);
    // localStorage.setItem("local_storage_multiplier", autoPayoutMultiplier);
  }, [betAmount, autoPayoutMultiplier]);

  useEffect(() => {
    get_game_status();
    getUser();
    setChartSwitch(true);
    setStartTime(Date.now());
    let getChatHistoryTimer = setTimeout(() => get_chat_history(), 1000);
    let getActiveBettorsTimer = setTimeout(
      () => retrieve_active_bettors_list(),
      1000
    );
    let getBetHistory = setTimeout(() => retrieve_bet_history(), 1000);

    return () => {
      clearTimeout(getChatHistoryTimer);
      clearTimeout(getActiveBettorsTimer);
      clearTimeout(getBetHistory);
    };
  }, []);

  useEffect(() => {}, [liveBettingTable]);

  // Routes
  const API_BASE = "http://139.59.36.115:4000";
  const register = async () => {
    try {
      const res = await Axios({
        method: "post",
        url: "http://139.59.36.115:4000/register",
        data: {
          username: registerUsername,
          password: registerPassword,
        },
        withCredentials: true,
      });

      console.log(res);

      if (res) {
        setAuthResponseMessage(res.data);

        if (res.data === "Username already exists") {
          return;
        }
        const res1 = await Axios({
          method: "POST",
          data: {
            username: registerUsername,
            password: registerPassword,
          },
          withCredentials: true,
          url: "http://139.59.36.115:4000/login",
        });

        // console.log(res1);
        if (res1) {
          setAuthResponseMessage(res1.data);
          getUser();

          if (res1.data === "Login Successful") {
            setOpenModalRegister(false);
            registerAndLoginToast();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const login = async () => {
    try {
      const res = await Axios({
        method: "POST",
        data: {
          username: loginUsername,
          password: loginPassword,
        },
        withCredentials: true,
        url: "http://139.59.36.115:4000/login",
      });

      if (res) {
        setAuthResponseMessage(res.data);
        getUser();

        if (res.data === "Login Successful") {
          setOpenModalLogin(false);
          loginToast();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      const res = await Axios({
        method: "GET",
        withCredentials: true,
        url: API_BASE + "/user",
      });
      // console.log(res);

      if (res) {
        setUserData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const logout = async () => {
    try {
      const res = await Axios.get(API_BASE + "/logout", {
        withCredentials: true,
      });

      if (res) {
        getUser();
        logoutToast();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const multiply = async () => {
    try {
      const res = await Axios.get(API_BASE + "/multiply", {
        withCredentials: true,
      });

      if (res) {
        if (res.data !== "No User Authentication") {
          setUserData(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const generate = async () => {
    try {
      const res = await Axios.get(API_BASE + "/generate_crash_value", {
        withCredentials: true,
      });

      if (res) {
        setMultiplier(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const retrieve = async () => {
    try {
      const res = await Axios.get(API_BASE + "/retrieve", {
        withCredentials: true,
      });

      if (res) {
        setMultiplier(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const send_bet = async () => {
    try {
      const res = await Axios({
        method: "POST",
        data: {
          bet_amount: betAmount,
          payout_multiplier: selectedCard,
        },
        withCredentials: true,
        url: API_BASE + "/send_bet",
      });

      console.log(res);

      if (res) {
        setBetActive(true);
        userData.balance -= betAmount;
        setUserData(userData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculate_winnings = async () => {
    try {
      const res = await Axios.get(API_BASE + "/calculate_winnings", {
        withCredentials: true,
      });

      if (res) {
        getUser();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const get_game_status = async () => {
    try {
      const res = await Axios.get(API_BASE + "/get_game_status", {
        withCredentials: true,
      });

      if (res) {
        if (res.data.phase === "betting_phase") {
          setGlobalTimeNow(res.data.info);
          setbBettingPhase(true);
        } else if (res.data.phase === "game_phase") {
          setGlobalTimeNow(res.data.info);
          setLiveMultiplierSwitch(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const manual_cashout_early = async () => {
    try {
      const res = await Axios.get(API_BASE + "/manual_cashout_early", {
        withCredentials: true,
      });

      if (res) {
        setUserData(res.data);
        setBetActive(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const auto_cashout_early = async () => {
    try {
      let res = await Axios.get(API_BASE + "/auto_cashout_early", {
        withCredentials: true,
      });

      if (res) {
        setUserData(res.data);
        setBetActive(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bet_next_round = () => {
    setbBetForNextRound(!bBetForNextRound);
  };

  const send_message_to_chatbox = async () => {
    try {
      let res = await Axios({
        method: "POST",
        data: {
          message_to_textbox: messageToTextBox,
        },
        withCredentials: true,
        url: API_BASE + "/send_message_to_chatbox",
      });

      if (res) {
        setMessageToTextBox("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const get_chat_history = async () => {
    try {
      const res = await Axios.get(API_BASE + "/get_chat_history", {
        withCredentials: true,
      });

      // console.log(res)
      if (res) {
        setChatHistory(res.data.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const retrieve_active_bettors_list = async () => {
    try {
      const res = await Axios.get(API_BASE + "/retrieve_active_bettors_list", {
        withCredentials: true,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const retrieve_bet_history = async () => {
    try {
      const res = await Axios.get(API_BASE + "/retrieve_bet_history", {
        withCredentials: true,
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  // Functions
  const handleKeyDownBetting = (e) => {
    if (e.key === "Enter") {
      if (bBettingPhase) {
        send_bet();
      } else {
        bet_next_round();
      }
    }
  };

  const handleKeyDownChat = (e) => {
    if (e.key === "Enter") {
      send_message_to_chatbox();
    }
  };

  const verifyBetAmount = (text) => {
    const validated = text.match(/^(\d*\.{0,1}\d{0,2}$)/);
    const re = /^[0-9\b]+$/;

    if (text === "" || re.test(text)) {
      setBetAmount(text);
    }
    if (text > userData.balance) {
      setErrorMessage("Bet greater than balance");
    } else {
      setErrorMessage("");
    }
  };

  const verifyMultiplierAmount = (text) => {
    const validated = text.match(/^(\d*\.{0,1}\d{0,2}$)/);
    if (validated) {
      setAutoPayoutMultiplier(text);
    }
  };

  // Define Toasts
  const loginToast = () => {
    toast.success("Login Successful", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  };

  const registerAndLoginToast = () => {
    toast.info("Account Created and Logged In", {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  };

  const logoutToast = () => {
    toast.success("You have been logged out", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
  };

  // const temp_time = Date.now();

  useEffect(() => {
    const temp_interval = setInterval(() => {
      setChartSwitch(false);
      // sendToChart();
    }, 1);

    return () => {
      clearInterval(temp_interval);
      setChartSwitch(true);
    };
  }, [chartSwitch]);

  return (
    <div className="App">
      <div>
        <ToastContainer />

        <Modal trigger={openModalLogin} setTrigger={setOpenModalLogin}>
          <div className="login-modal">
            <div>
              {authResponseMessage ? (
                <p className="err-msg">{authResponseMessage}</p>
              ) : (
                ""
              )}
              <h1>Login</h1>
            </div>
            <div className="form-group">
              <label>Username: </label>
              <input
                placeholder="Enter your username"
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                placeholder="Enter your password"
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <div>
              <button className="modal-submit" onClick={login}>
                Submit
              </button>
              <br />
            </div>
          </div>
        </Modal>
      </div>
      <div>
        <Modal trigger={openModalRegister} setTrigger={setOpenModalRegister}>
          <div className="login-modal">
            <div>
              {authResponseMessage ? (
                <p className="err-msg">{authResponseMessage}</p>
              ) : (
                ""
              )}
              <h1>Register</h1>
            </div>
            <div className="form-group">
              <label>Username: </label>
              <input
                placeholder="Enter your username"
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                placeholder="Enter your password"
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>
            <div>
              <button className="modal-submit" onClick={register}>
                Submit
              </button>
              <br />
            </div>
            {registerUsername !== "" && registerUsername.length < 3 ? (
              <span className="register_errors">
                Username must have at least 3 characters
              </span>
            ) : (
              ""
            )}{" "}
            <br />
            {registerPassword !== "" && registerPassword.length < 3 ? (
              <span className="register_errors">
                Password must have at least 3 characters
              </span>
            ) : (
              ""
            )}
          </div>
          <div></div>
        </Modal>
      </div>

      <nav className="navbar">
        <div className="container">
          <span className="logo">Gambling Game</span>
          <ul className="nav">
            {userData && userData !== "No User Authentication" ? (
              <>
                <li>User: {userData.username}</li>
                <li> Balance: {userData.balance.toFixed(2)}</li>
                <li>
                  {/* <a href="/addFund">Add BTC</a> */}
                  <Link to="/addFund">Add Fund</Link>
                </li>
                <li>
                  <Link onClick={logout}>Logout</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    href="/#"
                    onClick={() => {
                      setOpenModalLogin(true);
                      setAuthResponseMessage("");
                    }}
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/#"
                    onClick={() => {
                      setOpenModalRegister(true);
                      setAuthResponseMessage("");
                    }}
                  >
                    Register
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className="grid-container-main">
        <div className="grid-elements">
          {/* <div> <u>Select Card To Bet</u> </div> */}
          {/* {bBettingPhase  ? ( */}
          <div
            className="btn-group"
            role="group"
            aria-label="Basic radio toggle button group"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio1"
              // autocomplete="off"
              value="Black"
              disabled={betActive ? "disabled" : null}
              onClick={(event) => {
                setSelectedCard("Black");
              }}
            />
            <label className="btn btn-outline-primary" htmlFor="btnradio1">
              <img src={blackCard} width="60%" height="85%" alt="Black" />
            </label>
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio2"
              // autocomplete="off"
              disabled={betActive ? "disabled" : null}
              value="Red"
              onClick={(event) => {
                setSelectedCard("Red");
              }}
            />
            <label className="btn btn-outline-primary" htmlFor="btnradio2">
              <img src={redCard} width="60%" height="85%" alt="Red" />
            </label>
          </div>
          {/* ):(
            <div>{resultCard}</div>
            )} */}
          {/* {
            <div className="effects-box"> */}

          {/* <div
                className="basically-the-graph"
                style={{
                  height: "90%",
                  width: "90%",
                  position: "absolute",
                  top: "12%",
                }}
              >
                {chartData ? (
                  <SomeChart
                    chartData={chartData}
                    chartOptions={chartOptions}
                  />
                ) : (
                  ""
                )}
              </div> */}
          <div style={{ position: "absolute", zIndex: 12, top: "45%" }}>
            {(() => {
              if (bBettingPhase) {
                return <h1>Result in {bettingPhaseTime}</h1>;
              } else {
                return (
                  <div
                    className={` ${
                      !liveMultiplierSwitch
                        ? // liveMultiplier !== "Starting..." &&
                          // liveMultiplier !== "CONNECTING..."
                          "multipler_crash_value_message"
                        : ""
                    }`}
                  >
                    {liveMultiplier !== "Starting..." ? (
                      <div>
                        {liveMultiplier === "Red" ? (
                          <div>
                            {
                              <img
                                src={redCard}
                                width="75%"
                                height="100%"
                                alt="Red"
                              />
                            }
                          </div>
                        ) : (
                          <div>
                            {
                              <img
                                src={blackCard}
                                width="75%"
                                height="100%"
                                alt="Black"
                              />
                            }
                          </div>
                        )}
                      </div> //liveMultiplier + "x"
                    ) : (
                      "Starting..."
                    )}
                  </div>
                );
              }
            })()}
          </div>
          {/* </div>
          } */}
        </div>

        <div className="grid-elements ">
          {userData && userData !== "No User Authentication" ? (
            <div>
              <h1 className="makeshift-input-group"> Bet Amount</h1>
              <input
                className="input_box"
                placeholder="Type Your Bet Amount"
                onChange={(e) => verifyBetAmount(e.target.value)}
                value={betAmount}
                disabled={betActive ? "disabled" : null}
                onKeyDown={handleKeyDownBetting}
              />
              <br />

              <h1 className="makeshift-input-group">Card Selectd</h1>
              <input
                className="input_box"
                placeholder="Card"
                onChange={(e) => verifyMultiplierAmount(e.target.value)}
                onKeyDown={handleKeyDownBetting}
                value={
                  //localStorage.getItem("selectedCard")
                  selectedCard
                }
                disabled={betActive ? "disabled" : null}
              />

              <br />
              {bBettingPhase && !betActive ? (
                <button
                  className="css-button css-button-3d css-button-3d--grey"
                  onClick={send_bet}
                >
                  Send Bet
                </button>
              ) : (
                <>
                  {betActive ? (
                    <div>
                      <button
                        className="css-button css-button-3d css-button-3d--grey"
                        onClick={manual_cashout_early}
                      >
                        {betActive && resultCard ? (
                          <span>Cashout at {(2 * betAmount).toFixed(2)}</span>
                        ) : (
                          "Starting..."
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        className={`css-button css-button-3d css-button-3d--grey ${
                          bBetForNextRound ? "bet_for_next_round_active" : ""
                        }`}
                        onClick={bet_next_round}
                      >
                        {bBetForNextRound ? "Cancel Bet" : "Bet Next round"}{" "}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <h1>
              <a
                href="/#"
                onClick={() => {
                  setOpenModalLogin(true);
                  setAuthResponseMessage("");
                }}
                className="quickLoginOrRegister"
              >
                Login
              </a>
              or
              <a
                href="/#"
                onClick={() => {
                  setOpenModalRegister(true);
                  setAuthResponseMessage("");
                }}
                className="quickLoginOrRegister"
              >
                Register
              </a>
              to place a bet
            </h1>
          )}
          <div style={{ color: "red", fontWeight: 600, marginTop: "5px" }}>
            {errorMessage}
          </div>
        </div>
        <div className="grid-elements">
          Chat <br />
          <div className="chat-box-wrapper">
            <div className="chat-box-rectangle">
              {chatHistory && chatHistory.length > 0 ? (
                <>
                  {chatHistory.map((message) => {
                    return (
                      <div className="individual-chat-message" key={uuidv4()}>
                        <span className="message_top">
                          {message.the_username}
                        </span>
                        <span className="message_top_time">
                          {message.the_time} -&nbsp;
                          {message.the_date}
                        </span>
                        <br />
                        <span className="message_bottom">
                          {message.message_body}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <h1>Loading Chat history </h1>
              )}
            </div>
          </div>
          {userData && userData !== "No User Authentication" ? (
            <>
              <input
                className="input_box_for_chat"
                placeholder="Send A Message"
                onChange={(e) => setMessageToTextBox(e.target.value)}
                value={messageToTextBox}
                onKeyDown={handleKeyDownChat}
              />
              <br />
            </>
          ) : (
            <h3>Log in to send a chat message</h3>
          )}
        </div>

        <div className="grid-elements">
          Game History
          <div className="container-crash-history">
            <ul className="history-table">
              <li className="history-table-header">
                <div className="col col-1">Game Id</div>
                <div className="col col-2">Result Card</div>
                {/* <div className="col col-3">Streak</div> */}
              </li>
              {crashHistory
                .slice(0, 15)
                // .reverse()
                .map((crash, index, array) => {
                  return (
                    <div className="row-history-wrapper" key={uuidv4()}>
                      <li
                        className={
                          crash >= 2 ? "table-row-blue" : "table-row-red"
                        }
                      >
                        <div className="col col-1">{roundIdList[index]} </div>
                        <div className="col col-2">{crash}</div>
                        {/* <div className="col col-3">{streakList[index]}</div> */}
                      </li>
                    </div>
                  );
                })}
            </ul>
          </div>
        </div>
        <div className="grid-elements">
          Live Bets Tracker
          <ul className="active-bet-table">
            <li className="active-bet-table-header">
              <div className="col col-1">User</div>
              <div className="col col-2">Bet Amount</div>
              <div className="col col-3">Selected Card</div>
              <div className="col col-4">Profit</div>
            </li>
          </ul>
          <div>
            {liveBettingTable && liveBettingTable !== "[]" ? (
              <>
                {JSON.parse(liveBettingTable).map((message, index) => {
                  return (
                    <div className="container-crash-history" key={index}>
                      <ul className="active-bet-table">
                        <div className="row-bet-wrapper" key={uuidv4()}>
                          <li
                            className={
                              message.cashout_multiplier
                                ? "table-row-green"
                                : "table-row-blue"
                            }
                          >
                            <div className="col col-1">
                              {message.the_username}{" "}
                            </div>
                            <div className="col col-2">
                              {message.bet_amount}
                            </div>
                            <div className="col col-3">
                              {selectedCard ? selectedCard : "--"}
                            </div>
                            <div className="col col-4">
                              {message.profit
                                ? message.profit.toFixed(2)
                                : "--"}
                            </div>
                          </li>
                        </div>
                      </ul>
                    </div>
                  );
                })}
              </>
            ) : (
              ""
            )}

            <div className="container-crash-history">
              <ul className="active-bet-table">
                {tenNumbers.map((someNumber, index, array) => {
                  return (
                    <div className="row-bet-wrapper" key={uuidv4()}>
                      <li className={"table-row-blue"}>
                        <div className="col col-1">-- </div>
                        <div className="col col-2">--</div>
                        <div className="col col-3">--</div>
                        <div className="col col-4">--</div>
                      </li>
                    </div>
                  );
                })}
              </ul>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardGame;
