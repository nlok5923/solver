const tokenAbi = require("../abi/USDCTokenAbi.json");
const { ethers } = require("ethers");

const constructSendTransaction = (transferMeta) => {

    if(transferMeta.toAddress === '-' || transferMeta.amount === '-' || transferMeta.address === '-') {
        return {
            success: false,
            transaction: {},
          };      
    }

    const transferCode = new ethers.utils.Interface(tokenAbi).encodeFunctionData('transfer', [transferMeta.toAddress, ethers.utils.parseEther(transferMeta.amount)])
    // for now 
    // const transferCode = new ethers.utils.Interface(tokenAbi).encodeFunctionData('mint', ['0x7ff2D63690bfDF02b377894e9eB784997c425043', ethers.utils.parseEther('1000000')]);
    return {
        success: true,
        transaction: [{
            to: transferMeta.address,
            data: transferCode,
            value: 0
        }]
    }
}

module.exports = { constructSendTransaction }