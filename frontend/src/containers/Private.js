import React, { useState } from "react";
import { API } from "aws-amplify";
import "./Private.css";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

export default function Private() {
    const [user, setUser] = useState(null);

    async function verify() {
        const token = localStorage.getItem('currentUser');

        try {
            let res = await API.post("1xion", "/auth/verify", {
                body: {
                    token: token
                }
            });
            setUser(res.publicAddress);

        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="Private">
            <div className="lander">
                <h1>Private</h1>
                <Alert variant="primary">
                    <Button onClick={verify}>Verify JWT</Button><div>{user}</div>
                </Alert>
            </div>
        </div>
    );
}
