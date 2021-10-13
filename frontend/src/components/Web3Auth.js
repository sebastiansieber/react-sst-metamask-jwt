import Web3 from "web3";
import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import Loading from "./Loading";

function Web3Auth() {
    const [address, setAddress] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [web3] = useState(new Web3(Web3.givenProvider || "wss://mainnet.infura.io/ws/v3/5eb86e74f5d545548bc82d1da2c60197"));

    async function checkAccountChange() {
        const ethereum = window.ethereum;
        if (ethereum) {
            ethereum.on('accountsChanged', accounts => {
                if (accounts[0] == null)
                    setAddress(null);
                else
                    setAddress(accounts[0].toUpperCase());
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

    async function identify() {
        try {
            setLoading(true);
            let response = await API.post("1xion", "/auth/login", {
                body: {
                    id: address
                }
            });
            console.log(response);
            
            let signed = await signNonce(response.nonce);
            console.log(signed);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    }

    async function getNonce() {
        try {
            let url = "/auth/nonce/" + address;
            let n = await API.get("1xion", url);
        } catch (e) {
            console.error(e);
        }
    }

    async function signNonce(n) {
        return await web3.eth.personal.sign(n, address, "password!");
    }

    useEffect(() => {
        async function getAddress() {
            try {
                let adr = await web3.eth.getAccounts();
                if (adr[0] != null)
                    setAddress(adr[0].toUpperCase());
            } catch (e) {
                console.error(e.message);
            }
        }
        getAddress();
        checkAccountChange();
    }, [web3.eth]);

    return address ? (
        <div>
            <Loading isLoading={isLoading} />
            <p>{address}</p>
            <button onClick={getNonce}>Nonce</button>
            <button onClick={identify}>Identify</button>
        </div>
    ) : (
        <div>
            <button onClick={loginWithEth}>Login</button>
            <p>{process.env.REACT_APP_API_URL}</p>
        </div>
    );
}

export default Web3Auth;
