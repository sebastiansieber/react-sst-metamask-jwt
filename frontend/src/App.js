import './App.css';
import React, { useState, useEffect, useRef } from "react";

import { AppContext } from "./lib/contextLib";
import { isLocalUser } from "./lib/localAuth";

import Routes from "./Routes";
import TopNav from "./components/TopNav";

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const initial = useRef(false);

  useEffect(() => {
    console.log("Constructor");
    try {
      if (isLocalUser()) {
        initial.current = true;
        console.log("setAuthenticated true");
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch (e) {
      if (e !== 'No current user') {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    console.log("isAuthenticated changed: " + isAuthenticated + " - initial: " + initial.current);
    if (initial.current)
      initial.current = false;
    else
      setIsAuthenticating(false);
  }, [isAuthenticated]);

  return window.ethereum && !isAuthenticating ? (
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
