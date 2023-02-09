/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { socket } from "../../socket-io-connection/socket";
import Axios from "axios";
import moment from "moment";

export default function ChatMessage() {
  const [userData, setUserData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageToTextBox, setMessageToTextBox] = useState("");
  const API_BASE = "https://playnwin.fun/api";

  // Socket.io setup
  useEffect(() => {
    socket.on("receive_message_for_chat_box", (data) => {
      get_chat_history();
    });

    socket.on("connect_error", (error) => {
      console.log(error);
    });

    Axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("twbwToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

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

  useEffect(() => {
    getUser();
    // let getChatHistoryTimer = //setTimeout(() =>
    get_chat_history();
    // //  , 1000);

    // return () => {
    //   clearTimeout(getChatHistoryTimer);
    // };
  }, []);

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

  const handleKeyDownChat = (e) => {
    if (e.key === "Enter") {
      send_message_to_chatbox();
    }
  };

  return (
    <div className="grid-elements">
      Chat <br />
      <div className="chat-box-wrapper">
        <div className="chat-box-rectangle">
          {chatHistory ? (
            <>
              {chatHistory.map((message, index) => {
                return (
                  <div className="individual-chat-message" key={index}>
                    <span className="message_top">{message.the_username}</span>
                    <span className="message_top_time">
                      {/* {message.the_time} -&nbsp;
                      {message.the_date} */}
                      {moment(message.time).format("YYYY-MM-DD, HH:mm")}
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
  );
}
