const Axios = require('axios')
const { ethers } = require('ethers')
const SPENDER_1INCH = '0x1111111254eeb25477b68fb85ed929f73a960582' // by default approval would go to this address

const approveUrl = (chain) => `https://api.1inch.io/v5.0/${chain}/approve/transaction`;
const swapUrl = (chain) => `https://api.1inch.io/v5.0/${chain}/swap`;

const isERC20 = (token) => token === 'USDC' || token === 'USDT';

const constructSwapTransaction = (swapData) => {
  console.log('this is swap data', swapData);
  const pair = swapData.pair;

  if(isERC20(pair[0])) return constructERC20SwapTransaction(swapData);
  else return constructNormalSwapTransaction(swapData);
}

const constructNormalSwapTransaction = async (swapData) => {
  let transactions = [];

  const chain = swapData.chain;
    // swap transction
  let swapTransactionResp = await Axios.get(swapUrl(chain), {
    params: {
      fromTokenAddress: swapData.tokenAddress1,
      toTokenAddress: swapData.tokenAddress2,
      amount: ethers.utils
      .parseUnits(swapData.amount, 18)
      .toString(),
      fromAddress: swapData.userAddress,
      slippage: 5, // hardcoding it for now
      disableEstimate: true,
      destReceiver: swapData.userAddress
    }
  });

  const swapTxn = {
    to: swapTransactionResp.data.tx.to,
    value: swapTransactionResp.data.tx.value,
    data: swapTransactionResp.data.tx.data
  }

  transactions.push(swapTxn);

  console.log('thesre are txns ', transactions)

  return {
    success: true,
    context: `This transactions would swap your ${swapData.amount} of matic token against ${swapData.pair[1]} token.`,
    transaction: transactions
  };
}

const constructERC20SwapTransaction = async (swapData) => {
  /**
   * Data we need
   * 1. token pair // default to USDC and USDT
   * 2. token amount // by user
   */

  const chain = swapData.chain;

  let transactions = [];
  console.log('this is swap data ', swapData);

  // first give approval to 1inch router for the transaction
  let approvalTxnResp = await Axios.get(approveUrl(chain), {
    params: {
      tokenAddress: swapData.tokenAddress1,
      amount: ethers.utils
      .parseUnits(swapData.amount, 6)
      .toString()
    }
  });

  transactions.push(approvalTxnResp.data);
  // console.log(approvalTxnResp.data);
  console.log('these are params ', {
    fromTokenAddress: swapData.tokenAddress1,
    toTokenAddress: swapData.tokenAddress2,
    amount: ethers.utils
    .parseUnits(swapData.amount, 6)
    .toString(),
    fromAddress: swapData.userAddress,
    slippage: 40, // hardcoding it for now
    disableEstimate: true,
    // destReceiver: swapData.userAddress
  })
  // swap transction
  let swapTransactionResp = await Axios.get(swapUrl(chain), {
    params: {
      fromTokenAddress: swapData.tokenAddress1,
      toTokenAddress: swapData.tokenAddress2,
      amount: ethers.utils
      .parseUnits(swapData.amount, 6)
      .toString(),
      fromAddress: swapData.userAddress,
      slippage: 40, // hardcoding it for now
      disableEstimate: true,
      // destReceiver: swapData.userAddress
    }
  })

  console.log(swapTransactionResp)

  const swapTxns = {
    to: swapTransactionResp.data.tx.to,
    value: swapTransactionResp.data.tx.value,
    data: swapTransactionResp.data.tx.data,
    gasPrice: swapTransactionResp.data.tx.gasPrice
  }

  transactions.push(swapTxns);

  return {
    success: true,
    context: `The first transaction would take approval for ${swapData.amount} of ${swapData.pair[0]} token and then it would swap ${swapData.amount} of ${swapData.pair[0]} token for best rates`,
    transaction: transactions
  }
}

module.exports = { constructSwapTransaction }