import { MUMBAI_RPC, OPTIMISM_TESTNET_RPC, GOERLI_RPC } from "../Constants"
import { ethers } from "ethers"

export const NetworkAddressChecker = async (address: string) => {
    let isMumbai = false, isArbitrumTestnet = false, isOptimismTestnet = false, isGoerliTestnet = false;
    // mumbai check 
    const mumbaiProvider = new ethers.providers.JsonRpcProvider(MUMBAI_RPC);
    const mumbaiCodeStatus = await mumbaiProvider.getCode(address);
    if (mumbaiCodeStatus === '0x') {
        console.log("Mumbai status ", mumbaiCodeStatus);
        isMumbai = true;
    }

    // arbitrum testnet check
    // commenting it as we don't have production bundler for this network
    // const arbitrumTestnetProvider = new ethers.providers.JsonRpcProvider(ARBITRUM_TESTNET_RPC);
    // const arbitrumTestnetCodeStatus = await arbitrumTestnetProvider.getCode(address);
    // if (arbitrumTestnetCodeStatus === '0x') {
    //     console.log("Arbitrum status ", arbitrumTestnetCodeStatus);
    //     isArbitrumTestnet = true;
    // }

    // goerli testnet check
    const goerliTestnetProvider = new ethers.providers.JsonRpcProvider(GOERLI_RPC);
    const goerliTestnetCodeStatus = await goerliTestnetProvider.getCode(address);
    if (goerliTestnetCodeStatus === '0x') {
        console.log("Goerli status ", goerliTestnetCodeStatus);
        isGoerliTestnet = true;
    }

    // optimism testnet check
    const optimismTestnetProvider = new ethers.providers.JsonRpcProvider(OPTIMISM_TESTNET_RPC);
    const optimismTestnetCodeStatus = await optimismTestnetProvider.getCode(address);
    if (optimismTestnetCodeStatus === '0x') {
        console.log("Optimism status ", optimismTestnetCodeStatus);
        isOptimismTestnet = true;
    }

    return isMumbai && isOptimismTestnet && isGoerliTestnet;
}
