import React, { useState, useEffect } from "react";
import { playSocket, socket } from "../../socket-io-connection/socket";

export default function LiveBettinTable() {
  const [tenNumbers, setTenNumbers] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [liveBettingTable, setLiveBettingTable] = useState();

  // Socket.io setup
  useEffect(() => {
    playSocket.on("start_betting_phase", function (data) {
      setLiveBettingTable(null);
    });

    socket.on("receive_live_betting_table", (data) => {
      //   console.log(data);
      setLiveBettingTable(data);
      data = JSON.parse(data);
      setTenNumbers(Array(10 - data.length).fill(2));
    });

    socket.on("connect_error", (error) => {
      console.log(error);
    });
  }, []);

  useEffect(() => {}, [liveBettingTable]);

  return (
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
                    <div className="row-bet-wrapper" key={index}>
                      <li
                        className={
                          message.cashout_multiplier
                            ? "table-row-green"
                            : "table-row-blue"
                        }
                      >
                        <div className="col col-1">{message.the_username} </div>
                        <div className="col col-2">{message.bet_amount}</div>
                        <div className="col col-3">
                          {message.cashout_multiplier
                            ? message.cashout_multiplier
                            : "--"}
                        </div>
                        <div className="col col-4">
                          {message.profit ? message.profit.toFixed(2) : "--"}
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
                <div className="row-bet-wrapper" key={index}>
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
  );
}
