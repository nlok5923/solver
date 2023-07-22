// sample abi for encoding transaction
const abi = [
  {
    inputs: [],
    name: "returnStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// extracting signer from the wallet
const signer = walletInstance.getSigner();

// sample contract whose stake function we would invoke
const stakeAddress = "0x8b370128A84bc2Df7fF4813675e294b1ae816178";

// creating transaction for the stake function
const tx = {
  gasLimit: "0x55555",
  to: stakeAddress,
  value: ethers.utils.parseEther("100"),
  data: new ethers.utils.Interface(abi).encodeFunctionData("stake", []),
};

// sending the transaction
const txn = await signer.sendTransaction(tx);
