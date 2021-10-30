import { ethers } from "ethers";
import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import Status from "./Status";
import Button from "react-bootstrap/Button";

import { useAppContext } from "../lib/contextLib";
import { removeLocalUser, setLocalUser, isLocalUser } from "../lib/localAuth";

function Web3Auth() {
    const { isAuthenticated, setAuthenticated } = useAppContext();
    const [address, setAddress] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const initRun = useRef(true);

    const history = useHistory();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Trigger MetaMask to connect
    async function connectMetaMask() {
        const ethereum = window.ethereum;

        try {
            await ethereum.request({method: 'eth_requestAccounts'});
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
        return await signer.signMessage(ethers.utils.arrayify(n));
    }

    // Authenticate user with backend
    async function handleLogin() {
        setLoading(true);

        if (isLocalUser()) {
            setAuthenticated(true);
        } else {
            if (!isAuthenticated) {
                try {
                    let response = await API.post("1xion", "/auth/nonce", {
                        body: {
                            id: address
                        }
                    });

                    let nonce = response.nonce.toString();
                    let signed = await signNonce(nonce);

                    let res = await API.post("1xion", "/auth/login", {
                        body: {
                            address: address,
                            signature: signed,
                        }
                    });

                    if (res.auth === true) {
                        setLocalUser(res.token);
                        setAuthenticated(true);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
        history.push("/private");
        setLoading(false);
    }

    function handleLogout() {
        setAddress(null);
        setAuthenticated(false);
        removeLocalUser();
        history.push("/");
    }

    // Constructor to check if wallet is already connected and start listener for account changes
    useEffect(() => {
        const ethereum = window.ethereum;

        // Listen to account changes in MetaMask
        async function checkAccountChange() {
            if (ethereum) {
                ethereum.on('accountsChanged', adr => {
                    setAddress(adr[0]);
                })
            }
        }

        async function getAddress() {
            try {
                let adr = await provider.listAccounts();
                if (adr[0] == null)
                    setAddress(null)
                else
                    setAddress(adr[0].toLowerCase());
            } catch (e) {
                console.error(e.message);
            }
        }

        getAddress();
        checkAccountChange();
    }, []);

    // Whenever address changes
    useEffect(() => {
        if (initRun.current) {
            initRun.current = false;
        } else {
            if (address && (address.length > 0))
                handleLogin();
            else
                handleLogout();
        }
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
