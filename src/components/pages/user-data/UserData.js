/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket-io-connection/socket";
import Axios from "axios";
import "./userData.css";

export default function UserData() {
  // const [showModal, setShowModal] = useState(true);
  const [user, setUser] = useState({});
  const API_BASE = "https://playnwin.fun/api";

  // Socket.io setup
  useEffect(() => {
    socket.on("userData", function (data) {});

    Axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    socket.on("connect_error", (error) => {
      console.log(error);
    });
  }, []);

  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  };

  const getUser = async () => {
    try {
      const res = await Axios({
        method: "GET",
        withCredentials: true,
        url: API_BASE + "/user",
      });
      // console.log(res.data);
      if (res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.log(error);
      // setErrorMessage(error.response.data.customError);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <React.Fragment>
      {/* <div className="modal-backdrop show"></div> */}
      <div
        role="dialog"
        aria-modal="true"
        className="_modal_v0hfg_192 _modal_qf1u8_19 modal"
        tabIndex="-1"
        style={{ display: "block" }}
        aria-hidden="true"
      >
        {/* <div className="modal-dialog modal-lg"> */}
        <div className="modal-content">
          {/* <div className="_modalHeader_v0hfg_222 _modalHeader_qf1u8_40 modal-header">
            </div> */}
          <div className="_modalBody_v0hfg_237 _modalBody_qf1u8_46 modal-body">
            {/* <div> */}
            <div>
              <nav className="nav nav-tabs nav-justified _nav_124in_1">
                <a
                  className="_link_ohkz3_18 _active_ohkz3_38"
                  // href="/account/overview"
                  href="/"
                >
                  <span>Overview</span>
                </a>
                <a
                  className="_link_ohkz3_18 _active_ohkz3_38"
                  // href="/account/stats"
                  href="/"
                >
                  <span>Game Statics</span>
                </a>
                <a
                  className="_link_ohkz3_18 _active_ohkz3_38"
                  // href="/account/security"
                  href="/"
                >
                  <span>Security</span>
                </a>
                <a
                  className="_link_ohkz3_18 _active_ohkz3_38"
                  // href="/account/settings"
                  href="/"
                >
                  <span>Settings</span>
                </a>
              </nav>
            </div>
            <div className="_container_1s9hu_18">
              <header className="_userHeader_v0hfg_122">
                <div className="_header_n1e38_1">
                  <h4>{user.username}</h4>
                </div>
              </header>
              <div className="_container_nxoy3_19">
                {/* <h5>Breakdown</h5> */}
                <hr></hr>
                <div className="table-responsive">
                  <table className="_breakdownTable_nxoy3_23 _historyTable_v0hfg_86 table table-sm table-hover">
                    <tbody>
                      <tr>
                        <td>
                          {/* <a href="/cashier/deposit/history">Id</a> */}Id
                        </td>
                        <td>
                          {/* <a href="/cashier/deposit/history">{user._id}</a> */}
                          {user._id}
                        </td>
                      </tr>
                      <tr>
                        <td>Sponser Id</td>
                        <td>{user.sponserId}</td>
                      </tr>
                      <tr>
                        <td>Level</td>
                        <td>{user.role}</td>
                      </tr>
                      {/* <tr>
                        <td>
                          <a href="/cashier/withdraw/history">SponserId</a>
                        </td>
                        <td className="_negativeAmount_nxoy3_54">
                          <a href="/cashier/withdraw/history">0 bits</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a href="/cashier/tip/history">Incoming Tips</a>
                        </td>
                        <td>
                          <a href="/cashier/tip/history">0 bits</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <a href="/cashier/tip/history">Outgoing Tips</a>
                        </td>
                        <td className="_negativeAmount_nxoy3_54">
                          <a href="/cashier/tip/history">0 bits</a>
                        </td>
                      </tr>
                      <tr>
                        <td>Game Profit</td>
                        <td className="">0 bits</td>
                      </tr>
                      <tr>
                        <td>Balance</td>
                        <td className="">0 bits</td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* </div> */}
            <button type="button" className="btn btn-primary" onClick={goBack}>
              Go To Home
            </button>
          </div>
        </div>
      </div>
      {/* </div> */}
    </React.Fragment>
  );
}
