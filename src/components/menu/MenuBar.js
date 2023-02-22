/* eslint-disable no-unused-vars */
import React from 'react';
import { menuItems } from './MenuData';

function MenuBar(props) {
  return (
    <div className="menu-bar">
      <ul>
        {props.items.map((item) => (
          <li key={item.id}>
            <a href={item.link}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuBar;