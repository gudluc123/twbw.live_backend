/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./p2p.css";

function P2PTransfer() {
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  const history = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Perform transfer logic here
  };

  return (
    <React.Fragment>
      <h4>
        <u>
          <b>P2P Transfer</b>
        </u>
      </h4>
      <Link
        color="light"
        // outline
        className="float-end"
        onClick={() => history(-1)}
      >
        <span>Go Back</span>
      </Link>
      <div className="container-fluid" style={{ marginTop: "7%" }}>
        <div className="row">
          <div
            className="col-md-6 m-auto m-0"
            style={{ border: "1px solid #dbdfea", height: "auto" }}
          >
            <div
              className="innerBox d-flex justify-content-center align-items-center"
              style={{ height: "100px", padding: "3rem" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 90 90"
                width="100px"
                height="70px"
              >
                <rect
                  width="55"
                  height="39"
                  x="9"
                  y="21"
                  fill="#fff"
                  stroke="#6576ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  rx="6"
                  ry="6"
                ></rect>
                <path
                  fill="none"
                  stroke="#c4cefe"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 44L25 44"
                ></path>
                <path
                  fill="none"
                  stroke="#c4cefe"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M30 44L38 44"
                ></path>
                <path
                  fill="none"
                  stroke="#c4cefe"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M42 44L50 44"
                ></path>
                <path
                  fill="none"
                  stroke="#c4cefe"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 50L36 50"
                ></path>
                <rect
                  width="15"
                  height="8"
                  x="16"
                  y="31"
                  fill="#c4cefe"
                  rx="1"
                  ry="1"
                ></rect>
                <path
                  fill="#fff"
                  stroke="#6576ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M76.79 72.87L32.22 86.73a6 6 0 01-7.47-4L17 57.71a6 6 0 014-7.51l44.52-13.86a6 6 0 017.48 4l7.73 25.06a6 6 0 01-3.94 7.47z"
                ></path>
                <path
                  fill="#6576ff"
                  d="M75.27 47.3L19.28 64.71 17.14 57.76 73.12 40.35 75.27 47.3z"
                ></path>
                <path
                  fill="#c4cefe"
                  d="M30 77.65l-1.9-6.79a1 1 0 01.69-1.23l4.59-1.3a1 1 0 011.23.7l1.9 6.78a1 1 0 01-.67 1.19l-4.59 1.3a1 1 0 01-1.25-.65zM41.23 74.48l-1.9-6.78a1 1 0 01.67-1.23l4.58-1.3a1 1 0 011.23.69l1.9 6.78a1 1 0 01-.71 1.24l-4.58 1.29a1 1 0 01-1.19-.69zM52.43 71.32l-1.9-6.79a1 1 0 01.69-1.23l4.59-1.3a1 1 0 011.19.7l1.9 6.78a1 1 0 01-.69 1.23L53.66 72a1 1 0 01-1.23-.68z"
                ></path>
                <ellipse
                  cx="55.46"
                  cy="19.1"
                  fill="#fff"
                  stroke="#6576ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  rx="16.04"
                  ry="16.1"
                ></ellipse>
                <ellipse
                  cx="55.46"
                  cy="19.1"
                  fill="#e3e7fe"
                  rx="12.11"
                  ry="12.16"
                ></ellipse>
                <text
                  fill="#6576ff"
                  fontFamily="Nunito-Black, Nunito Black"
                  fontSize="16.12"
                  transform="matrix(.99 0 0 1 50.7 23.72)"
                >
                  $
                </text>
              </svg>
              <div className="col-5" style={{ fontWeight: "bolder" }}>
                <p className="mb-0">
                  <u>Deposit Wallet</u>
                </p>
                <span>150</span>
              </div>

              <div className="col-5" style={{ fontWeight: "bolder" }}>
                <p className="mb-0">
                  <u>Income Wallet</u>
                </p>
                <span>150</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div
            className="col-md-6 m-auto mt-5 p-5"
            style={{ border: "1px solid #dbdfea" }}
          >
            <form className="is-alter">
              <div className="form-group">
                <label className="form-label">Transferred to User ID</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  placeholder="Enter User ID"
                />
              </div>
              <div className="form-group">
                <div className="form-group">
                  <label className="form-label">Amount to be Transferred</label>
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    placeholder="amount to be transfer"
                  />
                </div>
              </div>
              {/* <div className="form-group">
              <div className="form-group">
                <label className="form-label">Transaction Passsword</label>
                <input
                  className="form-control"
                  type="text"
                  name="name"
                  placeholder="enter transaction password"
                />
              </div>
            </div> */}
              <div className="form-group">
                <button className="btn btn-primary">
                  P2P Fund Transfer Now
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default P2PTransfer;
