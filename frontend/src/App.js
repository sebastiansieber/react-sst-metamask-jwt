import './App.css';
import Routes from "./Routes";
import TopNav from "./components/TopNav";

function App() {
  return window.ethereum ? (
    <div className="App container py-3">
      <TopNav />
      <Routes />
    </div>
  ) : (
    <div>
      <span>No Ethereum wallet detected.</span>
    </div>
  );
}

export default App;
