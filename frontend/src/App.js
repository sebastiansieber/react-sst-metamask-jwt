import './App.css';

//import WalletConnect from './components/WalletConnect';
//import Web3Connect from './components/Web3Connect';
import Web3Auth from './components/Web3Auth';

function App() {
  return window.ethereum ? (
    <div>
      <Web3Auth />
    </div>
  ) : (
    <div>
      <span>No Ethereum wallet detected.</span>
    </div>
  );
}

export default App;
