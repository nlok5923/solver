import * as Type from './solidity-types'

export default interface UserOperation {
  sender: Type.address
  nonce: Type.uint256
  initCode: Type.bytes
  callData: Type.bytes
  callGasLimit: Type.uint256
  verificationGasLimit: Type.uint256
  preVerificationGas: Type.uint256
  maxFeePerGas: Type.uint256
  maxPriorityFeePerGas: Type.uint256
  paymasterAndData: Type.bytes
  signature: Type.bytes
}