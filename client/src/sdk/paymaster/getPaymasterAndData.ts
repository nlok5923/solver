import { ethers } from "ethers";

export const getPaymasterAndData = async (paymasterUrl: string, requestData: any) => {
    try {
        console.log(' this is req data ', requestData);
        const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(paymasterUrl)
        const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", requestData);
        console.log(' this is sponsor result ', sponsorUserOperationResult);
        return sponsorUserOperationResult.paymasterAndData;
    } catch (err) {
        console.log(err);
        throw err;
    }
}