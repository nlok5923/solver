
import { BananaSigner } from "./BananaSigner";
import { Chains } from "./Constants";
import { Banana4337Provider } from "./Banana4337Provider";
import { ERC4337EthersSigner } from "@account-abstraction/sdk";
import { BananaCookie } from "./BananaCookie";

//! Need to work on disconnect and isconnected method
export interface WalletProvider {
    getAddress(): Promise<string>
    getChainId(): Promise<number>
    getProvider(): Banana4337Provider | undefined
    getSigner(): BananaSigner
    isConnected(): boolean // to check if wallet connected or not
    //! Not supported yet
    // on<K extends keyof ProviderEventTypes>(event: K, fn: ProviderEventTypes[K]): void
    // once<K extends keyof ProviderEventTypes>(event: K, fn: ProviderEventTypes[K]): void  
  }

export class Wallet implements WalletProvider {
    readonly walletAddress: string
    readonly walletProvider: Banana4337Provider
    readonly chainId: Chains
    cookie!: BananaCookie

    constructor(
        walletAddress: string,
        walletProvider: Banana4337Provider,
        chainId: Chains
    ) {
        this.walletAddress = walletAddress;
        this.walletProvider = walletProvider;
        this.chainId = chainId;
        this.cookie = new BananaCookie();
    }

    getProvider() {
        return this.walletProvider;
    } 

    getSigner() {
        return this.walletProvider.getSigner();
    }

    async getChainId(): Promise<number> {
        return this.chainId;
    }

    getAddress(): Promise<string> {
        return Promise.resolve(this.walletAddress)
    }

    // for us wallet connection means there should be a cookie in browser
    isConnected() {
        const walletName = this.cookie.getCookie("bananaUser");
        return walletName != '';
    }
}