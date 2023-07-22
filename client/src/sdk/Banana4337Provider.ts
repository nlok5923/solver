import { EntryPoint } from "@account-abstraction/contracts";
import {
  ClientConfig,
  ERC4337EthersProvider,
  HttpRpcClient,
} from "@account-abstraction/sdk";
import { BaseAccountAPI } from "@account-abstraction/sdk/dist/src/BaseAccountAPI";
import { BaseProvider, JsonRpcProvider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { BananaSigner } from "./BananaSigner";
import { PublicKey } from "./interfaces/Banana.interface";
import { MyWalletApi } from "./MyWalletApi";

export class Banana4337Provider extends ERC4337EthersProvider {
  readonly signer: BananaSigner;

  constructor(
    readonly chainId: number,
    readonly config: ClientConfig,
    readonly originalSigner: Signer,
    readonly originalProvider: BaseProvider,
    readonly httpRpcClient: HttpRpcClient,
    readonly entryPoint: EntryPoint,
    readonly smartAccountAPI: MyWalletApi,
    readonly publicKey: PublicKey,
    readonly jsonRpcProvider: JsonRpcProvider,
    readonly action?: string
  ) {
    super(
      chainId,
      config,
      originalSigner,
      originalProvider,
      httpRpcClient,
      entryPoint,
      smartAccountAPI
    );
    console.log('got action in provider ',action)
    this.signer = new BananaSigner(
      config,
      originalSigner,
      this,
      httpRpcClient,
      smartAccountAPI,
      jsonRpcProvider,
      publicKey,
      action
    );
  }

  getSigner(): BananaSigner {
    return this.signer;
  }
}
