// 1. tokenize statements // -
// 2. check for the connected words to find the statement purpose // -
// 3. find the relevant words out of the statement (nft name, token name)
// 4. Get the predefined metadata for the selected entity.
// 5. Contruct the transaction

// train word 2 vec model on the given txt file and the find the similarity
const {
  nftInfoExtracter,
  supportedNFTs,
  swapInfoExtractor,
  sendTokenInfoExtractor,
  supportTokenSend,
  supportedTokenSwap,
  bridgeInfoExtractor,
  supportedTokenSwapGnosis
} = require("./contants");
const { getResponse } = require('./gpt/llm')
const { isWordSimilar, isPairSimilar } = require('./utils/similarity')
const { constructNFTransaction } = require('./transactions/nftTransactions');
const { constructSendTransaction } = require("./transactions/tokenTransaction");
const { constructSwapTransaction } = require('./transactions/swapTransaction')
const { contructBridgeTransactionForStaking } = require('./transactions/bridgeAndStake')

const transpiler = async (currentStep, classifier, userAddress, chain) => {

  console.log('this is chain ', chain)
  console.log('this is chain ', typeof chain)
  console.log('this is chain ', chain === 137)
  const context = classifier.classify(currentStep);
  console.log('step context ', context);

  // polygon mainnet and gnosis
  if (context === "swap") {
    const swapInfo = [];
    
    for(let i = 0; i < swapInfoExtractor.length; i++) {
      const resp = await getResponse(swapInfoExtractor[i].question, currentStep);
      if(i === 0) 
      swapInfo.push(JSON.parse(resp))
      else
      swapInfo.push(resp);
    };

    console.log(swapInfo)

    let swapMeta;
    // order would always be correct in supportedTokenSwap
    
    if(chain === "137") {
      console.log('we are here ', chain);
    swapMeta = supportedTokenSwap.filter(pair => isPairSimilar(pair.pair, swapInfo[0]));
    console.log('these are supportred tokens ', supportedTokenSwap);
    }
    else 
    swapMeta = supportedTokenSwapGnosis.filter(pair => isPairSimilar(pair.pair, swapInfo[0]));

    if(swapMeta.length === 0) return "Insufficient details for swap";
    console.log('this is swap meta ', swapMeta);
    
    const swapTransactionMeta = {
      pair: swapMeta[0].pair,
      tokenAddress1: swapMeta[0][swapMeta[0].pair[0]],
      tokenAddress2: swapMeta[0][swapMeta[0].pair[1]],
      amount: swapInfo[1],
      userAddress,
      chain
    };

    const resp = await constructSwapTransaction(swapTransactionMeta);
    console.log(' this is resp ', resp);
    return { ...resp, type: 'swap' };

  } else if (context === "nft_buy" || context === "nft_sell") { // only on polygon testnet
    // nftInfoExtracter
    console.log('extracting info');

    const nftInfo = [];

    for(let i=0; i < nftInfoExtracter.length; i++) {
        const resp = await getResponse(nftInfoExtracter[i].question, currentStep);
        nftInfo.push(resp);
    }

    // 0 -> name 
    // 1 -> operation
    // 2 -> tokenId
    // 3 -> to  
    const nftMeta = supportedNFTs.filter(data => isWordSimilar(data.name, nftInfo[0]));

    if(nftMeta.length === 0) return "Insufficient details for nft operation";

    const nftTransactionData = {
        name: nftMeta[0].name,
        address: nftMeta[0].address,
        operation: nftInfo[1],
        tokenId: nftInfo[2],
        toAddress: nftInfo[3],
        userAddress
    }

    const resp = constructNFTransaction(nftTransactionData);
    console.log('this is resp', resp);

    return { ...resp, type: 'normal' };
  } else if(context === 'transfer') { // polygon testnet
    console.log('extracting transfer info');

    const tokenSendInfo = [];
    for(let i=0; i < sendTokenInfoExtractor.length; i++) {
        const resp = await getResponse(sendTokenInfoExtractor[i].question, currentStep);
        tokenSendInfo.push(resp);
    }

    // 0 -> name
    // 1 -> amount
    // 2 -> to address
    const sendTokenMeta = supportTokenSend.filter(data => isWordSimilar(data.name, tokenSendInfo[0]));

    if(sendTokenMeta.length === 0) return "Insufficient details for transfer";

    const sendTransactionData = {
        address: sendTokenMeta[0].address,
        name: sendTokenMeta[0].name,
        amount: tokenSendInfo[1],
        toAddress: tokenSendInfo[2]
    };

    console.log("sendTransactionData", sendTransactionData);
    const sendTransactionResp = constructSendTransaction(sendTransactionData);
    console.log('sendTransactionResp', sendTransactionResp);

    return { ...sendTransactionResp, type: 'normal'};
  } else if(context === 'staking') { // mumbai -> avalanche
    let tokenAmount = 0;
    // 0 -> token amount 
    tokenAmount = await getResponse(bridgeInfoExtractor[0].question, currentStep);

    if(tokenAmount === '-') {
      return {
        success: false,
        transactions: []
      }
    }

    const bridgeTransactionData = {
      amount: tokenAmount,
      userAddress
    }

    console.log('bridge data ', bridgeTransactionData);

    let bridgeTxnResp = await contructBridgeTransactionForStaking(bridgeTransactionData);
    console.log('txn ', bridgeTxnResp);
    return { ...bridgeTxnResp, type: 'bridge' };
  }
};

module.exports = { transpiler }

