import React from "react";
import "./userData.css";

export default function UserData() {
  return (
    <React.Fragment>
      <div className="modal-backdrop show"></div>
      {/* <div
        role="dialog"
        aria-modal="true"
        className="_modal_v0hfg_192 _modal_qf1u8_19 modal"
        tabindex="-1"
        style={{ display: "block" }}
      > */}
      <div className="modal-dialog modal-lg">
        <div className="modla-content">
          <div className="_modalHeader_v0hfg_222 _modalHeader_qf1u8_40 modal-header">
            <div className="modal-title h4">Account</div>
            <button type="button" className="close">
              <span aria-hidden="true">x</span>
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="_modalBody_v0hfg_237 _modalBody_qf1u8_46 modal-body">
            <div>
              <div>
                <nav className="nav nav-tabs nav-justified _nav_124in_1">
                  <a
                    className="_link_ohkz3_18 _active_ohkz3_38"
                    href="/account/overview"
                  >
                    <span>Overview</span>
                  </a>
                  <a
                    className="_link_ohkz3_18 _active_ohkz3_38"
                    href="/account/stats"
                  >
                    <span>Stats</span>
                  </a>
                  <a
                    className="_link_ohkz3_18 _active_ohkz3_38"
                    href="/account/security"
                  >
                    <span>Security</span>
                  </a>
                  <a
                    className="_link_ohkz3_18 _active_ohkz3_38"
                    href="/account/settings"
                  >
                    <span>Settings</span>
                  </a>
                </nav>
              </div>
              <div className="_container_1s9hu_18">
                <header className="_userHeader_v0hfg_122">
                  <div className="_header_n1e38_1">
                    <h3>Srikant1131</h3>
                  </div>
                </header>
                <div className="_container_nxoy3_19">
                  <h5>Breakdown</h5>
                  <div className="table-responsive">
                    <table className="_breakdownTable_nxoy3_23 _historyTable_v0hfg_86 table table-sm table-hover">
                      <tbody>
                        <tr>
                          <td>
                            <a href="/cashier/deposit/history">Deposits</a>
                          </td>
                          <td>
                            <a href="/cashier/deposit/history">0 bits</a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <a href="/cashier/withdraw/history">Withdrawls</a>
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
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </React.Fragment>
  );
}
