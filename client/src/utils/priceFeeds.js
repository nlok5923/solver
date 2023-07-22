import { ethers } from "ethers"
import { POLYGON_MAINNET_RPC } from "../sdk" 

const aggregatorV3InterfaceABI = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "description",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
      name: "getRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "latestRoundData",
      outputs: [
        { internalType: "uint80", name: "roundId", type: "uint80" },
        { internalType: "int256", name: "answer", type: "int256" },
        { internalType: "uint256", name: "startedAt", type: "uint256" },
        { internalType: "uint256", name: "updatedAt", type: "uint256" },
        { internalType: "uint80", name: "answeredInRound", type: "uint80" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "version",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ]

export const getUSDCUSDTCurrentPrice = async () => {
 const USDTUSDAddress = '0x0A6513e40db6EB1b165753AD52E80663aeA50545'
 const USDCUSDAddress = '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7';
 
 const provider = new ethers.providers.JsonRpcProvider(POLYGON_MAINNET_RPC);

 const priceFeedUSDT = new ethers.Contract(USDTUSDAddress, aggregatorV3InterfaceABI, provider)
 const priceFeedUSDC = new ethers.Contract(USDCUSDAddress, aggregatorV3InterfaceABI, provider);

 const USDTPrice = await priceFeedUSDT.latestRoundData();
 const USDCPrice = await priceFeedUSDC.latestRoundData();
 console.log(USDCPrice)
 return [
    {
        token: 'USDC',
        price: parseInt(USDCPrice.answer._hex) / 10 ** 8
    },
    {
        token: 'USDT',
        price: parseInt(USDTPrice.answer._hex) / 10 ** 8
    }
 ];
}