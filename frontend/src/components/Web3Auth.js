import Web3 from "web3";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import Status from "./Status";
import Button from "react-bootstrap/Button";

import { useAppContext } from "../lib/contextLib";
import { setLocalUser } from "../lib/localAuth";

function Web3Auth() {
    const { isAuthenticated, userHasAuthenticated } = useAppContext();
    const [address, setAddress] = useState(null);

    const [isLoading, setLoading] = useState(false);
    const history = useHistory();
    const web3 = new Web3(Web3.givenProvider);

    // Listen to account changes in MetaMask
    async function checkAccountChange() {
        const ethereum = window.ethereum;
        if (ethereum) {
            ethereum.on('accountsChanged', adr => {
                console.log("AccountsChanged");
                console.log(adr[0]);
                if (adr[0] == null)
                    setAddress(null)
                else
                    setAddress(adr[0].toLowerCase());
            })
        }
    }

    // Trigger MetaMask to connect
    async function connectMetaMask() {
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
        return await web3.eth.personal.sign(n, address, "1xion");
    }

    // Authenticate user with backend
    async function identify() {
        setLoading(true);

        console.log("isAuthenticated: " + isAuthenticated);

        if (!isAuthenticated) {
            try {
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

                console.log("JWT:");
                console.log(res);
                if (res.auth = true) {
                    setLocalUser(res.token);
                    userHasAuthenticated(true);
                }
            } catch (e) {
                console.error(e);
            }
        }
        setLoading(false);
    }

    // Constructor to check if wallet is already connected and start listener for account changes
    useEffect(() => {
        console.log("Constructor");
        async function getAddress() {
            try {
                let adr = await web3.eth.getAccounts();
                console.log(adr[0]);
                if (adr[0] == null)
                    setAddress(null)
                else
                    setAddress(adr[0].toLowerCase());
            } catch (e) {
                history.push("/");
                console.error(e.message);
            }
        }
        getAddress();
        checkAccountChange();
    }, []);

    useEffect(() => {
        console.log("AddressChangedHook:");
        console.log(address);
        if (address == null) {
            userHasAuthenticated(false);
            history.push("/");
        } else {
            console.log("Authenticate:");
            console.log(address);
            identify();
            userHasAuthenticated(true);
            history.push("/private");
        }
        checkAccountChange();
    }, [address]);

    // Render output
    return address ? (
        <div>
            <Status address={address} isLoading={isLoading} />
            <p>{address}</p>
        </div>
    ) : (
        <div>
            <Status address={address} isLoading={isLoading} />
            <Button onClick={connectMetaMask}>Connect</Button>
        </div>
    );
}

export default Web3Auth;
