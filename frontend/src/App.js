import './App.css';
import React, { useState, useEffect } from "react";
import { AppContext } from "./lib/contextLib";

import Routes from "./Routes";
import TopNav from "./components/TopNav";

function App() {
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  async function onLoad() {
    try {
      //await Auth.currentSession();
      // need to load login information from browser session!
      userHasAuthenticated(false);
    }
    catch (e) {
      if (e !== 'No current user') {
        console.error(e);
      }
    }

    setIsAuthenticating(false);
  }

  useEffect(() => {
    onLoad();
  }, []);

  return window.ethereum && !isAuthenticating ? (
    <div className="App container py-3">
      <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
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
