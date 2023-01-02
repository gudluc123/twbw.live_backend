import React from "react";
import Modal from "../modal/Modal";

export default function AddFund() {
  return (
    <div>
      {" "}
      <Modal //trigger={openModalLogin} setTrigger={setOpenModalLogin}
      >
        <div className="login-modal">
          <div>
            {/* {authResponseMessage ? (
              <p className="err-msg">{authResponseMessage
              }</p>
            ) : (
              ""
            )} */}
            <h1>Login</h1>
          </div>
          <div className="form-group">
            <label>Username: </label>
            <input
              placeholder="Enter your username"
              onChange={(e) =>e //setLoginUsername(e.target.value)
              }
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              placeholder="Enter your password"
              onChange={(e) =>e //setLoginPassword(e.target.value)
              }
            />
          </div>
          <div>
            <button className="modal-submit" //onClick={login}
            >
              Submit
            </button>
            <br />
          </div>
        </div>
      </Modal>
    </div>
  );
}
