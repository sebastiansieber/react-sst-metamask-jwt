import Web3 from "web3";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import Loading from "./Loading";

import { useAppContext } from "../lib/contextLib";

function Web3Auth() {
    const [address, setAddress] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [web3] = useState(new Web3(Web3.givenProvider || "wss://mainnet.infura.io/ws/v3/5eb86e74f5d545548bc82d1da2c60197"));
    const { userHasAuthenticated } = useAppContext();
    const history = useHistory();

    // Listen to account changes in MetaMask
    async function checkAccountChange() {
        const ethereum = window.ethereum;
        if (ethereum) {
            ethereum.on('accountsChanged', adr => {
                if (adr[0] == null) {
                    setAddress(null);
                    userHasAuthenticated(false);
                    history.push("/");
                } else {
                    setAddress(adr[0].toLowerCase());
                    userHasAuthenticated(true);
                    history.push("/private");
                }
            })
        }
    }

    // Trigger login with MetaMask
    async function login() {
        try {
            await web3.eth.requestAccounts();
        } catch (e) {
            if (e.code === 4001) {
                // EIP-1193 userRejectedRequest error (4001)
                console.log('Please connect to wallet.');
            } else {
                console.error(e);
            }
        }
    }

    // Trigger MetaMask to sign nonce
    async function signNonce(n) {
        console.log(n);
        return await web3.eth.personal.sign(n, address, "1xion");
    }

    // Authenticate user with backend
    async function identify() {
        try {
            setLoading(true);
            let response = await API.post("1xion", "/auth/login", {
                body: {
                    id: address
                }
            });

            let nonce = response.nonce.toString();
            let signed = await signNonce(nonce);

            let res = await API.post("1xion", "/auth/verify", {
                body: {
                    address: address,
                    signature: signed,
                }
            });

            console.log(res);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    }

    // Constructor to check if wallet is already connected and start listener for account changes
    useEffect(() => {
        async function getAddress() {
            try {
                let adr = await web3.eth.getAccounts();
                if (adr[0] != null) {
                    setAddress(adr[0].toLowerCase());
                    userHasAuthenticated(true);
                    history.push("/private");
                }
            } catch (e) {
                history.push("/");
                console.error(e.message);
            }
        }
        getAddress();
        checkAccountChange();
    }, [web3.eth]);

    // Render output
    return address ? (
        <div>
            <Loading isLoading={isLoading} />
            <p>{address}</p>
            <button onClick={identify}>Identify</button>
        </div>
    ) : (
        <div>
            <button onClick={login}>Login</button>
        </div>
    );
}

export default Web3Auth;
