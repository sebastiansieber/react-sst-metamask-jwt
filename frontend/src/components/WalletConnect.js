import { useEthers, useEtherBalance, useLookupAddress } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

function WalletConnect() {
    const { activateBrowserWallet, account } = useEthers();
    const etherBalance = useEtherBalance(account);
    const ens = useLookupAddress();

    function authenticate() {
        console.log("activateBrowserWallet");
        activateBrowserWallet();
    }

    return account ? (
        <p>
            <p>Wallet: {account && account}</p>
            <p>ENS: {ens && ens}</p>
            <p>Balance: {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH</p>
        </p>
    ) : (
        <button type="button" onClick={authenticate}>Login</button>
    );

}

export default WalletConnect;
