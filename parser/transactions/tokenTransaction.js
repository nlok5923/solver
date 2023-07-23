const tokenAbi = require("../abi/USDCTokenAbi.json");
const { ethers } = require("ethers");

const constructSendTransaction = (transferMeta) => {

    if(transferMeta.toAddress === '-' || transferMeta.amount === '-') {
        return {
            success: false,
            transaction: {},
          };      
    }

    if(transferMeta.address === '-') {
        return {
            success: true,
            context: `This transaction would transfer ${transferMeta.amount} amount of matic token from your ethereum account to ${transferMeta.toAddress} ethereum account.` ,
            transaction: [{
                to: transferMeta.toAddress,
                value: ethers.utils.parseEther(transferMeta.amount),
                data: '0x'
            }]
        }
    }

    const transferCode = new ethers.utils.Interface(tokenAbi).encodeFunctionData('transfer', [transferMeta.toAddress, ethers.utils.parseEther(transferMeta.amount)])
    // for now 
    // const transferCode = new ethers.utils.Interface(tokenAbi).encodeFunctionData('mint', ['0x7ff2D63690bfDF02b377894e9eB784997c425043', ethers.utils.parseEther('1000000')]);
    return {
        success: true,
        context: `This transaction would transfer ${transferMeta.amount} of USDC token from your ethereum account to ${transferMeta.toAddress}.` ,
        transaction: [{
            to: transferMeta.address,
            data: transferCode,
            value: 0
        }]
    }
}

module.exports = { constructSendTransaction }