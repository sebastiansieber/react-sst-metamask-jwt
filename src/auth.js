//import * as uuid from "uuid";
import handler from "./util/handler";
import dynamoDb from "./util/dynamodb";
import * as ethUtil from "ethereumjs-util";

export const login = handler(async (event) => {
    const data = JSON.parse(event.body);
    const crypto = require("crypto");

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            publicAddress: data.id,
            //nonce: uuid.v1(),
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
    const publicAddress = ethUtil.bufferToHex(addressBuffer).toUpperCase();

    console.log(publicAddress);
    console.log(address);

    if (publicAddress === address) {
        return result.Item;
    } else {
        throw new Error("User not verified.");
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
