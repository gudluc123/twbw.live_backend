import React, { useState, useEffect } from "react";
import { socket } from "../../socket-io-connection/socket";

export default function GameHistory() {
  const [crashHistory, setCrashHistory] = useState([]);
  const [roundIdList, setRoundIdList] = useState([]);

  // Socket.io setup
  useEffect(() => {
    socket.on("crash_history", function (data) {
      // console.log(data);
      setCrashHistory(data);
    });

    socket.on("get_round_id_list", function (data) {
      // console.log(data);
      setRoundIdList(data);
    });

    socket.on("connect_error", (error) => {
      console.log(error);
    });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  return (
    <div className="grid-elements">
      Game History
      <div className="container-crash-history">
        <ul className="history-table">
          <li className="history-table-header">
            <div className="col col-1">Game Id</div>
            <div className="col col-2">Result Card</div>
            {/* <div className="col col-3">Streak</div> */}
          </li>
          {crashHistory && crashHistory
            // .slice(0, 25)
            // .reverse()
            .map((crash, index, array) => {
              return (
                <div className="row-history-wrapper" key={index}>
                  <li
                    className={crash >= 2 ? "table-row-blue" : "table-row-red"}
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
  );
}
