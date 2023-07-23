const nftAbi = require("../abi/BaycNFTAbi.json");
const { ethers } = require("ethers");

// we can't have things for sell now like usually platforms have bidding system for buying an nft
const constructNFTransaction = (nftMeta) => {
  let operation = nftMeta.operation.toLowerCase();
  if(operation === "buy" || operation === "mint") {
    // buy when tokenId is provided else mint
    if(nftMeta.tokenId === '-') operation = "mint"; else operation = "buy";
  }
  console.log('this is nft meta', nftMeta)
  console.log('this is operation ', operation)

  switch (operation) {
    case "mint": {
      return constructNFTMintTransaction(nftMeta);
    }
    case "transfer": {
      return constructNFTTransferTransaction(nftMeta);
    }
    case "buy": {
        return constructNFTBuyTransaction(nftMeta);
    }
    case "sell": {
      return constructNFTSellTransaction(nftMeta)
    }
    default:
      return "incorrect data provided";
  }
};

// for now buy and mint both will utilize this
const constructNFTMintTransaction = (nftData) => {
  console.log('this is nft mint ', nftData)
  if (nftData.userAddress === "-" || nftData.address === "-")
    return {
      success: false,
      transaction: {},
    };

  const address = nftData.address;
  const safeMintCode = new ethers.utils.Interface(nftAbi).encodeFunctionData(
    "safeMint",
    [nftData.userAddress]
  );

  return {
    success: true,
    context: 'This transaction will mint BAYC NFT token to your address. The minting cost is currently 2.43 matic.',
    transaction: [
      {
        to: address,
        data: safeMintCode,
        value: 0, // for now hardcoding it
      },
    ],
  };
};

// for now sell will use this
const constructNFTTransferTransaction = (nftData) => {
  if (
    nftData.userAddress === "-" ||
    nftData.toAddress === "-" ||
    nftData.tokenId === "-"
  )
    return {
      success: false,
      transaction: {},
    };

  const address = nftData.address;
  const transferFromCode = new ethers.utils.Interface(
    nftAbi
  ).encodeFunctionData("transferFrom", [
    nftData.userAddress,
    nftData.toAddress,
    nftData.tokenId,
  ]);

  return {
    success: true,
    context: `This transaction will transfer your BAYC NFT of tokenid ${nftData.tokenId} to ${nftData.toAddress} address.`,
    transaction: [
      {
        to: address,
        data: transferFromCode,
        value: 0, // for now hardcoding it
      },
    ],
  };
};

const constructNFTBuyTransaction = (nftData) => {
  // bunching down approve and transferFrom transaction transaction
  if (
    nftData.userAddress === "-" ||
    nftData.toAddress === "-" ||
    nftData.tokenId === "-"
  )
    return {
      success: false,
      context: `ATTENTION: The current bid price for BAYC NFT with token id 124 is 5.6 eth. The optimal bid based on older purchases could be 6.3 eth.` ,
      transaction: [],
    };

  const address = nftData.address;
  const transferFromCode = new ethers.utils.Interface(
    nftAbi
  ).encodeFunctionData("transferFrom", [
    nftData.userAddress, // this should be the owner address
    nftData.toAddress, // this should be the caller address
    nftData.tokenId,
  ]);

  return {
    success: true,
    context: `This transaction will buy you a BAYC NFT of tokenid ${nftData.tokenId} which has been already approved for your ethereum address.`,
    transaction: [
      {
        to: address,
        data: transferFromCode,
        value: 0, // for now hardcoding it
      },
    ],
  };
};


const constructNFTSellTransaction = (nftData) => {
  if (
    nftData.toAddress === "-" ||
    nftData.tokenId === "-"
  )
    return {
      success: false,
      transaction: {},
    };

  const address = nftData.address;

  const approveCode = new ethers.utils.Interface(nftAbi).encodeFunctionData(
    "approve",
    [
      nftData.toAddress,
      nftData.tokenId
    ]
  );

  return {
    success: true,
    context: `This transaction would grant approval to your NFT of tokenid ${nftData.tokenId} to this ethereum address ${nftData.toAddress}`,
    transaction: [
      {
        to: address,
        data: approveCode,
        value: 0, // for now hardcoding it
      },
    ],
  };
}

module.exports = { constructNFTransaction };
