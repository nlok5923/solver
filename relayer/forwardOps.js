const { ethers } = require("ethers")
const { EntryPoint__factory } = require("@account-abstraction/contracts")
const entrypointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
require('dotenv').config();

const forwarder = async (op) => {
    console.log(process.env.RPC_OPT_GOERLI)
    console.log(process.env.BUNDLER_PRIVATE_KEY)
    console.log(process.env.BUNDLER_EOA_KEY)
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_OPT_GOERLI);
    const wallet = new ethers.Wallet(process.env.BUNDLER_PRIVATE_KEY, provider)
    const entrypoint = EntryPoint__factory.connect(entrypointAddress, provider);
    const txnCall = await entrypoint.populateTransaction.handleOps(op, process.env.BUNDLER_EOA_KEY);
    
    const txn = {
        to: entrypointAddress,
        from: process.env.BUNDLER_EOA_KEY,
        data: txnCall.data,
        gasLimit: '0x989680'
    }

    try {
        const txnReceipt = await wallet.sendTransaction(txn);
        console.log('txn r4eceiupot ',txnReceipt);
        (await txnReceipt).wait();
        // return txnReceipt;
    } catch (err) {
        console.log(err);
    }
}

module.exports = { forwarder };