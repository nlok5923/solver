import { ethers } from "ethers";

export const getKeccakHash = (key: string) => {
   const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(key));
   return hash;
}