import React from "react";
import { Route, Routes } from "react-router-dom";
import "./css/App.css";
import { ROUTES } from "./const";

export default function App() {
  return (
    <React.Fragment>
      <div className="App">
        <Routes>
          {ROUTES.map(({ path, page }, index) => {
            return <Route path={path} key={index} element={page} />;
          })}
        </Routes>
      </div>
    </React.Fragment>
  );
}
