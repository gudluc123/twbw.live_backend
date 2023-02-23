import React, { useState } from "react";
import "./navbar.css";
// import Logo from "../Images/logo.png";
import menu from "../../images/menu.png";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [show, setshow] = useState(false);
  return (
    <div className="navbar">
      <div className="logo">
        {/* <img src={Logo} alt="" /> */}
      </div>

      <div className="mainBar">
        <div className={show ? "D-bolck" : "D-none"}>
          <div className="nav-list">
            <ul>
              <li>
                <NavLink  to="/" activeclassname="active_comp">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink  to="/about" activeclassname="active_comp">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink  to="/contact" activeclassname="active_comp">
                  Contact Us
                </NavLink>
              </li>
              {/* <li>
                <NavLink  to="/login" activeclassname="active_comp">
                  Login
                </NavLink>
              </li> */}
            </ul>
          </div>
        </div>
      </div>

      <div className="logo2">
        <img src={menu} alt="" onClick={(e) => setshow(!show)} />
      </div>
    </div>
  );
};

export default Navbar;
