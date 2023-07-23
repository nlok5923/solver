// optimism forwarder

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers')
const singletonAbi = require('./static/singletonAbi.json')
const { forwarder } = require('./forwardOps')
require('dotenv').config();

let ops = [];

const sender = process.env.SENDER_ADDRESS;
const webSocketUrl = process.env.WSS_OPT_GOERLI;
// 'wss://cold-virulent-spree.matic.discover.quiknode.pro/79b77a73c0f39fa9e941ceedf0d769fef93bc29f/'
// process.env.WSS_OPT_GOERLI;
console.log(sender, webSocketUrl)
const singletonAddress = '0xb0c3F912540e703d5DB1681B5B7075c60a46F2d3';

const provider = new ethers.providers.WebSocketProvider(
    webSocketUrl
);

const singletonContract = new ethers.Contract(sender, singletonAbi.abi, provider);
singletonContract.on("TokenReceivedEvent", (tokenSymbol, sourceAddress, amount, sourceChain) => {
    console.log('listening to events ', sourceAddress);
    if(sourceAddress === sender || sourceAddress == "0x288d1d682311018736B820294D22Ed0DBE372188") {
        // forward ops 
        console.log('these are ops ', ops)
        const op = ops.filter(op => op.sender === sender);
        ops = [];

        console.log('this is op ', op)
        // forwarded ops
        forwarder(op);
    }
})

const corsOptions = {
    origin:
     '*',
    credentials: true,
    optionSuccessStatus: 200,
  };

const app = express();
app.use(express.json());
app.use(cors(corsOptions));


// forwarding steps

/**
 * get userOp and get registers it's sender address
 * start listening for event on it's sender address
 * once received tokenReceived event
 * forward the op 
 * in sdk add flag for register if the flag is enabled the userOp will come to the forwarder
 */

app.post('/register', (req, res) => {
    // console.log('req, res' , req, res);
    // console.log(req.body)
    // console.log(req.body.params.op)
    ops.push(req.body.params.op);
    console.log('registred op', req.body.params.op);
    forwarder(ops)
    res.status(200).send({
        data: 'ok'
    })
});

app.listen("80", (req, res) => {
    console.log("Listening your req...");
});