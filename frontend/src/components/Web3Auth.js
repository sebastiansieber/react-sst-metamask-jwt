import Web3 from "web3";
import React, { useState, useEffect } from "react";

function Web3Auth() {
    const [address, setAddress] = useState(null);
    const [web3] = useState(new Web3(Web3.givenProvider || "wss://mainnet.infura.io/ws/v3/5eb86e74f5d545548bc82d1da2c60197"));

    async function checkAccountChange() {
        const ethereum = window.ethereum;
        if (ethereum) {
            ethereum.on('accountsChanged', accounts => {
                setAddress(accounts[0]);
                console.log("account change", accounts[0]);
            })
        }
    }

    async function loginWithEth() {
        try {
            await web3.eth.requestAccounts();
        } catch (e) {
            if (e.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to wallet.');
            } else {
                console.error(e);
            }
        }
    }

    async function signNonce() {
        let signed = await web3.eth.personal.sign("Hello world", address, "password!");
        console.log(signed);

        web3.eth.personal.ecRecover("Hello world", signed).then(console.log);
    }

    useEffect(() => {
        async function getAddress() {
            try {
                let adr = await web3.eth.getAccounts();
                setAddress(adr[0]);
            } catch (e) {
                console.error(e.message);
            }
        }
        getAddress();
        checkAccountChange();
    }, [web3.eth]);

    return address ? (
        <div>
            <p>{address}</p>
            <button onClick={signNonce}>Sign</button>
        </div>
    ) : (
        <div>
            <button onClick={loginWithEth}>Login</button>
        </div>
    );
}

export default Web3Auth;
