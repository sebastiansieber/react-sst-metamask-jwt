import handler from "./util/handler";
import dynamoDb from "./util/dynamodb";
import * as ethUtil from "ethereumjs-util";
import jwt from 'jsonwebtoken';

const createToken = (publicAddress) => {
    return new Promise((resolve, reject) => {

        let payload = {
            publicAddress: publicAddress
        };

        let options = {
            expiresIn: process.env.JWT_EXPIRES_IN
        };

        jwt.sign(payload, process.env.JWT_SECRET, options, (error, token) => {
            if (error) reject(error);
            resolve(token);
        });

    });
};

export const login = handler(async (event) => {
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

export const verify = handler(async (event) => {
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
        //return result.Item;
    } else {
        //throw new Error("User not verified.");
        return ({
            auth: false,
            token: ''
        });
    }
});

export const nonce = handler(async (event) => {
    const params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            publicAddress: event.pathParameters.id,
        },
    };

    const result = await dynamoDb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    return result.Item;
});
