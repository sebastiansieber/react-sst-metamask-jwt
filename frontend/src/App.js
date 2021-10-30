import './App.css';
import React, { useState } from "react";

import { AppContext } from "./lib/contextLib";

import Routes from "./Routes";
import TopNav from "./components/TopNav";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (window.ethereum) ? (
    <div className="App container py-3">
      <AppContext.Provider value={{ isAuthenticated, setAuthenticated }}>
        <TopNav />
        <Routes />
      </AppContext.Provider>
    </div>
  ) : (
    <div>
      <span>No Ethereum wallet detected.</span>
    </div>
  );
}

export default App;
