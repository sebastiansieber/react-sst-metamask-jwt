import handler from "./util/handler";
import dynamoDb from "./util/dynamodb";
import * as ethUtil from "ethereumjs-util";
import jwt from "jsonwebtoken";
import cookie from "cookie";

function createToken(address) {
    let payload = {
        publicAddress: address
    };

    let options = {
        expiresIn: process.env.JWT_EXPIRES_IN
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

function serializeToken(token) {
    return cookie.serialize("jwt", token, {
        secure: false, // need to check that
        httpOnly: true,
        path: "/",
    });
}

/*function clearCookie() {
    return "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}*/

function getUserFromToken(token) {
    //const secret = Buffer.from(process.env.JWT_SECRET, "base64");
    //return jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    return jwt.verify(token, process.env.JWT_SECRET);
}

export function check() {
    return false;
}

export const secure = handler(async () => {
    return("Super secure API endpoint.")
});

export const verify = handler(async (event) => {
    try {
        const data = JSON.parse(event.body);
        return getUserFromToken(data.token);
    } catch (e) {
        throw new Error("JWT must be provided.");
    }
});

export async function me(event) {
    //const address = getUserFromToken(event.headers.Authorization);
    const address = event.pathParameters.id
    let statusCode, headers, body;

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            publicAddress: address,
        },
    };

    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    body = result.Item;
    statusCode = 200;
    headers = {
        "Set-Cookie": serializeToken(createToken(address)),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    };

    return {
        statusCode,
        body: JSON.stringify(body),
        headers: headers,
    };
}

export const nonce = handler(async (event) => {
    const data = JSON.parse(event.body);
    const crypto = require("crypto");

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            publicAddress: data.id,
            nonce: "0x" + crypto.randomBytes(16).toString('hex'),
            lastLogin: Date.now(),
        },
    };

    await dynamoDb.put(params);
    return params.Item;
});

export const login = handler(async (event) => {
    const data = JSON.parse(event.body);
    const address = data.address;
    const signature = data.signature;

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            publicAddress: address,
        },
    };

    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    const msg = result.Item.nonce;

    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const publicAddress = ethUtil.bufferToHex(addressBuffer);

    if (publicAddress === address) {
        const token = createToken(address);
        return ({
            auth: true,
            token: token
        });
    } else {
        return ({
            auth: false,
            token: ''
        });
    }
});
