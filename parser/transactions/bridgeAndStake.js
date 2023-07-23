const { supportedTokenToStake } = require('../contants')
const BananaAccount = require('../abi/BananaAccount.json')
const { ethers } = require("ethers");
const { AxelarQueryAPI, Environment, EvmChain, GasToken } = require('@axelar-network/axelarjs-sdk')
const WMATIC = require('../abi/WMATIC.json')

const getGasFee = async () => {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

    // Calculate how much gas to pay to Axelar to execute the transaction at the destination chain
    const gasFee = await api.estimateGasFee(
      EvmChain.POLYGON,
      EvmChain.AVALANCHE,
      GasToken.MATIC,
      1000000,
      3,
    );

    return gasFee;
}

const contructBridgeTransactionForStaking = async (stakingData) => {
    const relayerFee = await getGasFee();
    const wmaticAvalance = '0xB923E2374639D0605388D91CFedAfCeCE03Cfd8f'
    const avalancheStaking = '0x65f0dAC1129b1406Ae8c96752b729e4bd4355Ef8';

    const crossChainTransactionData = new ethers.utils.Interface(BananaAccount.abi).encodeFunctionData(
        'crossChainTransact',
        ['WMATIC',
        'Avalanche',
        stakingData.userAddress,
        ethers.utils.parseEther(stakingData.amount),
        '0x']
    );

    return {
        success: true,
        context: `This transaction will first bridge your ${stakingData.amount} amount of WMATIC token to Avalanche blockchain and then it will stake your ${stakingData.amount} token into Aave Staking contract which is avalaible on Avalanche as after research we found out it is currently giving max APY (5.69%) on staked assets.`,
        transaction: [
            {
                to: stakingData.userAddress,
                value: relayerFee,
                data: crossChainTransactionData,
                gasLimit: '0x55555'
            },
            {
                to: wmaticAvalance,
                value: 0,
                gasLimit: '0x55555',
                data: new ethers.utils.Interface(WMATIC).encodeFunctionData(
                'transfer',
                [avalancheStaking, ethers.utils.parseEther(stakingData.amount)])
            }
        ]
    }
}

module.exports = { contructBridgeTransactionForStaking }