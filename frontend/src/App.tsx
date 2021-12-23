import React from "react";

import WalletConnector from "./WalletConnector";
import PlantList from "./PlantList";

import "./App.css";

const App = () => {
  return (
    <div className="App">
      <WalletConnector />
      <PlantList />
    </div>
  );
};

export default App;
