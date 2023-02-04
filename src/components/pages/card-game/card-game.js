/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Modal from "../../modal/Modal";
import { ToastContainer, toast } from "react-toastify";
import { useMediaQuery } from "react-responsive";
import { Slide } from "react-toastify";
import Axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import blackCard from "../../../images/blackCard.png";
import redCard from "../../../images/redCard.png";
import { Link, NavLink } from "react-router-dom";
import ChatMessage from "../chat-message-page/ChatMessage";
import GameHistory from "../game-history-page/GameHistory";
import { socket } from "../../socket-io-connection/socket";
import LiveBettinTable from "../live-betting-table/LiveBettinTable";

function CardGame() {
  const [registerUsername, setRegisterUsername] = useState("");
  const [sponserId, setSponserId] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [betAmount, setBetAmount] = useState(
    localStorage.getItem("local_storage_wager") || 10
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
  const [bBettingPhase, setbBettingPhase] = useState(false);
  const [bettingPhaseTime, setBettingPhaseTime] = useState(-1);
  const [bBetForNextRound, setbBetForNextRound] = useState(false);
  const [hookToNextRoundBet, setHookToNextRoundBet] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authResponseMessage, setAuthResponseMessage] = useState("");
  const [globalTimeNow, setGlobalTimeNow] = useState(0);
  const [openModalLogin, setOpenModalLogin] = useState(false);
  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [startTime, setStartTime] = useState();
  const [selectedCard, setSelectedCard] = useState("");
  const [resultCard, setResultCard] = useState("");

  // console.log(process.env.REACT_APP_BASEURL)
  // Socket.io setup
  useEffect(() => {
    retrieve();
    setGlobalSocket(socket);

    socket.on("news_by_server", function (data) {
      setAnnouncement(data);
    });

    socket.on("randomCardColor", function (data) {
      // console.log(data);
      setResultCard(data);
      setLiveMultiplier(data);
      setLiveMultiplierSwitch(false);
      setBetActive(false);
    });

    Axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("twbwToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    socket.on("update_user", function (data) {
      getUser();
    });

    socket.on("start_betting_phase", function (data) {
      setGlobalTimeNow(Date.now());
      setLiveMultiplier("Starting...");
      setbBettingPhase(true);
      setHookToNextRoundBet(true);
      retrieve_active_bettors_list();
    });

    socket.on("connect_error", (error) => {
      console.log(error);
    });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1224px)",
  });
  const isBigScreen = useMediaQuery({ query: "(min-width: 1824px)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });
  const isRetina = useMediaQuery({ query: "(min-resolution: 2dppx)" });

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
        // console.log((Date.now() - globalTimeNow) / 1000.0);
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
  }, [betAmount, autoPayoutMultiplier]);

  useEffect(() => {
    get_game_status();
    getUser();
    setStartTime(Date.now());
    let getActiveBettorsTimer = setTimeout(
      () => retrieve_active_bettors_list(),
      1000
    );
    let getBetHistory = setTimeout(() => retrieve_bet_history(), 5000);

    return () => {
      clearTimeout(getActiveBettorsTimer);
      clearTimeout(getBetHistory);
    };
  }, []);

  // Routes
  const API_BASE = "https://playnwin.fun/api";
  const register = async () => {
    try {
      const res = await Axios({
        method: "post",
        url: API_BASE + "/register",
        data: {
          sponserId: sponserId,
          username: registerUsername,
          userEmail: registerEmail,
          password: registerPassword,
        },
        withCredentials: true,
      });
      // console.log(res);
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
          url: API_BASE + "/login",
        });
        // console.log(res1);
        if (res1) {
          setAuthResponseMessage(res1.data);
          getUser();

          if (res1.data.message === "Login Successful") {
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
        url: API_BASE + "/login",
      });
      // console.log(res);
      if (res) {
        localStorage.setItem("twbwToken", res.data.data);
        setAuthResponseMessage(res.data);
        getUser();

        if (res.data.message === "Login Successful") {
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
      if (res.data) {
        setUserData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const logout = async () => {
    try {
      let accesToken = localStorage.getItem("twbwToken");
      localStorage.clear();
      const res = await Axios.get(API_BASE + `/logout?token=${accesToken}`, {
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
      // console.log(res);

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
      // console.log(res);
      if (res) {
        setBetActive(true);
        userData.balance -= betAmount;
        setUserData(userData);
      }
    } catch (error) {
      // console.log(error);
      setErrorMessage(error.response.data.customError);
    }
  };

  const calculate_winnings = async () => {
    try {
      const res = await Axios.get(API_BASE + "/calculate_winnings", {
        withCredentials: true,
      });
      // console.log(res);

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

      // console.log(res);
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
      // console.log(res);

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

  const retrieve_active_bettors_list = async () => {
    try {
      const res = await Axios.get(API_BASE + "/retrieve_active_bettors_list", {
        withCredentials: true,
      });
      // console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const retrieve_bet_history = async () => {
    try {
      const res = await Axios.get(API_BASE + "/retrieve_bet_history", {
        withCredentials: true,
      });
      // console.log(res);
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

  const verifyBetAmount = (text) => {
    const validated = text.match(/^(\d*\.{0,1}\d{0,2}$)/);
    const re = /^[0-9\b]+$/;

    if (text === "" || re.test(text)) {
      setBetAmount(text);
    }
    if (text > userData.balance) {
      setErrorMessage("Bet greater than balance");
    } else if (text < 10) {
      setErrorMessage("Bet can't less than 10$");
    } else if (text > 500) {
      setErrorMessage("Bet can't greater than 500$");
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
              <label>SponserId: </label>
              <input
                placeholder="Enter your Sponser ID"
                onChange={(e) => setSponserId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Username: </label>
              <input
                placeholder="Enter your username"
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email: </label>
              <input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
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
            {userData && userData !== "No User Authentication" && localStorage.getItem("twbwToken") ? (
              <>
                <NavLink to="/user">
                  <li>User: {userData.username}</li>
                </NavLink>
                <li> Balance: {userData.balance.toFixed(2)}</li>
                {/* <li>
                  <a href="/addFund">Add BTC</a>
                  <Link to="/addFund">Add Fund</Link>
                </li> */}
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
              <h1 className="makeshift-input-group">Card Selected</h1>
              <input
                className="input_box"
                placeholder="Card"
                onChange={(e) => verifyMultiplierAmount(e.target.value)}
                onKeyDown={handleKeyDownBetting}
                value={selectedCard}
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
        <ChatMessage />
        <GameHistory />
        <LiveBettinTable />
      </div>
    </div>
  );
}

export default CardGame;
