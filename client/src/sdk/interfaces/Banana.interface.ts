import { BigNumberish, BytesLike } from 'ethers';
import UserOperation from '../utils/userOperation'
export interface ClientConfig {
    bundlerUrl: string;
    entryPointAddress: string;
}

export interface PublicKey {
    q0: string;
    q1: string;
    encodedId: string;
}

export interface UserCredentialObject {
    q0: string;
    q1: string;
    walletAddress: string;
    initcode: boolean;
    encodedId: string;
    username: string
    saltNonce: string
}

export interface CookieObject {
    q0: string;
    q1: string;
    scwAddress: string;
    initContract: boolean;
}

export interface ChainConfig {
    Elliptic: string;
    TouchIdSafeWalletContractProxyFactoryAddress: string;
    TouchIdSafeWalletContractSingletonAddress: string;
    fallBackHandlerAddress: string;
}

export interface TransactionDetailsForUserOp {
    target: string
    data: string
    value?: BigNumberish
    gasLimit?: BigNumberish
    maxFeePerGas?: BigNumberish
    maxPriorityFeePerGas?: BigNumberish
}

export interface ChainSpecificConfig {
    jsonRpcUrl: string
}

export interface ConnectOptions {
    networkId: string | number
}

export enum RequestType {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE'
};