// @ts-nocheck
import { BigNumber, BigNumberish } from 'ethers'
import { arrayify, hexConcat } from 'ethers/lib/utils'
import { Signer } from '@ethersproject/abstract-signer'
import { BaseApiParams } from '@account-abstraction/sdk/dist/src/BaseAccountAPI'
import { SimpleAccountAPI } from '@account-abstraction/sdk'
import { BananaAccount__factory, BananaAccountProxyFactory__factory} from './types/factories'
import { ethers } from 'ethers'
import { BananaSigner } from './BananaSigner'
import { BananaAccount } from './types'
import { EntryPoint, EntryPoint__factory } from '@account-abstraction/contracts'
import { UserOperationStruct } from './types/BananaAccount'
import { TransactionDetailsForUserOp } from './interfaces/Banana.interface'

/**
 * constructor params, added no top of base params:
 * @param owner the signer object for the wallet owner
 * @param factoryAddress address of contract "factory" to deploy new contracts (not needed if wallet already deployed)
 * @param index nonce value used when creating multiple wallets for the same owner
 */
export interface MyWalletApiParams extends BaseApiParams {
  owner: Signer
  factoryAddress?: string
  index?: number
  _qValues: [string, string]
  _singletonTouchIdSafeAddress: string
  _ownerAddress: string
  _fallBackHandler: string
  _saltNonce: string
  _encodedIdHash: string
}

/**
 * An implementation of the BaseWalletAPI using the MyWallet contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
export class MyWalletApi extends SimpleAccountAPI {
  EllipticCurveAddress: string
  qValues: [string, string]
  singletonTouchIdSafeAddress: string
  ownerAddress: string
  fallBackHandleraddress: string
  saltNonce: string
  encodedIdHash: string
  constructor(params: MyWalletApiParams) {
    super(params)
    this.qValues = params._qValues
    this.singletonTouchIdSafeAddress = params._singletonTouchIdSafeAddress
    this.ownerAddress = params._ownerAddress
    this.fallBackHandleraddress = params._fallBackHandler
    this.saltNonce = params._saltNonce
    this.encodedIdHash = params._encodedIdHash
  }

  /**
   *
   * @param requestId - the has that your wallet must sign
   * @returns the string that will used in userOp.signature & will be send to validateUserOp in your wallet's function
   */
  async signRequestId(requestId: string): Promise<string> {
    return await this.owner.signMessage(arrayify(requestId))
  }

  async _getAccountContract (): Promise<BananaAccount> {
    if (this.accountContract == null) {
      this.accountContract = BananaAccount__factory.connect(await this.getAccountAddress(), this.provider)
    }
    return this.accountContract
  }

  getTouchIdSafeWalletContractInitializer = (): string => {
    const TouchIdSafeWalletContractSingleton: BananaAccount = BananaAccount__factory.connect(
      this.singletonTouchIdSafeAddress,
      this.provider
    );
    const TouchIdSafeWalletContractQValuesArray: Array<string> = [this.qValues[0], this.qValues[1]];
    //@ts-ignore
    const TouchIdSafeWalletContractInitializer = TouchIdSafeWalletContractSingleton.interface.encodeFunctionData('setupWithEntrypoint',
    [
      [this.ownerAddress],                            // owners 
      1,                                              // thresold will remain fix 
      "0x0000000000000000000000000000000000000000",   // to address 
      "0x",                                           // modules setup calldata
      this.fallBackHandleraddress,                    // fallback handler
      "0x0000000000000000000000000000000000000000",   // payment token
      0,                                              // payment 
      "0x0000000000000000000000000000000000000000",   // payment receiver
      this.entryPointAddress,                         // entrypoint
      this.encodedIdHash,                             // hash of encoded id
      // @ts-ignore
      TouchIdSafeWalletContractQValuesArray           // q values 
    ]);

    return TouchIdSafeWalletContractInitializer
  };

  /**
   * @method getTouchIdSafeWalletContractInitCode
   * @params none
   * @returns { string } TouchIdSafeWalletContractInitCode
   * create initCode for TouchIdSafeWalletContract
   * 
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode (): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== '') {
        this.factory = BananaAccountProxyFactory__factory.connect(this.factoryAddress, this.provider)
      } else {
        throw new Error('no factory to get initCode')
      }
    }
    return hexConcat([
      this.factory.address,
      this.factory.interface.encodeFunctionData('createProxyWithNonce', [this.singletonTouchIdSafeAddress, this.getTouchIdSafeWalletContractInitializer(), this.saltNonce])
    ])
  }

  async getNonce (): Promise<BigNumber> {
    if (await this.checkAccountPhantom()) {
      return BigNumber.from(0)
    }
    const entryPoint: EntryPoint = EntryPoint__factory.connect(
      this.entryPointAddress,
      this.provider
    );
    return await entryPoint.getNonce(this.getAccountAddress(), 0);
  }

  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute (target: string, value: BigNumberish, data: string): Promise<string> {
    const accountContract = await this._getAccountContract()
    const delegateCall = ethers.BigNumber.from("0")
    return accountContract.interface.encodeFunctionData(
      'execTransactionFromEntrypoint',
      [
        target,
        value,
        data,
        delegateCall
      ])
  }

  async encodeBatchExecute(info): Promise<string> {
    const accountContract = await this._getAccountContract()
    const delegateCall = ethers.BigNumber.from("0")
    const target = info.map(data => data.target);
    const value = info.map(data => data.value);
    const data = info.map(data => data.data);
    return accountContract.interface.encodeFunctionData(
      'execBatchTransactionFromEntrypoint',
      [
        target,
        value,
        data,
        delegateCall
      ])
  }

  async encodeUserOpCallDataAndGasLimitForBatchedTransaction (detailsForUserOp: TransactionDetailsForUserOp): Promise<{ callData: string, callGasLimit: BigNumber }> {
    function parseNumber (a: any): BigNumber | null {
      if (a == null || a === '') return null
      return BigNumber.from(a.toString())
    }

    // const value = parseNumber(detailsForUserOp.value) ?? BigNumber.from(0)
    detailsForUserOp.map(op =>  parseNumber(op.value) ?? BigNumber.from(0))
    // const callData = await this.encodeExecute(detailsForUserOp.target, value, detailsForUserOp.data)
    const callData = await this.encodeBatchExecute(detailsForUserOp);
    let callGasLimit;
    try {
      callGasLimit = parseNumber(detailsForUserOp.gasLimit) ?? await this.provider.estimateGas({
        from: this.entryPointAddress,
        to: this.getAccountAddress(),
        data: callData
      })
    } catch (err) {
      callGasLimit = ethers.BigNumber.from(1e6);
      console.log('getting error here', err);
    }
    
    return {
      callData,
      callGasLimit
    }
  }
//   async encodeUserOpCallDataAndGasLimitForBatchedTransaction(detailsForUserOp) {
//     var _a, _b;
//     function parseNumber(a) {
//         if (a == null || a === '')
//             return null;
//         return ethers_1.BigNumber.from(a.toString());
//     }
//     // const value = (_a = parseNumber(detailsForUserOp.value)) !== null && _a !== void 0 ? _a : ethers_1.BigNumber.from(0);
//     const callData = await this.encodeExecute(detailsForUserOp.target, value, detailsForUserOp.data);
//     const callGasLimit = (_b = parseNumber(detailsForUserOp.gasLimit)) !== null && _b !== void 0 ? _b : await this.provider.estimateGas({
//         from: this.entryPointAddress,
//         to: this.getAccountAddress(),
//         data: callData
//     });
//     return {
//         callData,
//         callGasLimit
//     };
// }

  async createUnsignedUserOpForBatchedTransaction(info: TransactionDetailsForUserOp[]): Promise<UserOperationStruct>  {
    const {
      callData,
      callGasLimit
    } = await this.encodeUserOpCallDataAndGasLimitForBatchedTransaction(info)
    console.log('this is calldata and allgaslimit', callData, callGasLimit)
    const initCode = await this.getInitCode()

    const initGas = await this.estimateCreationGas(initCode)
    const verificationGasLimit = BigNumber.from(await this.getVerificationGasLimit())
      .add(initGas)

    let {
      maxFeePerGas,
      maxPriorityFeePerGas
    } = info
    if (maxFeePerGas == null || maxPriorityFeePerGas == null) {
      const feeData = await this.provider.getFeeData()
      if (maxFeePerGas == null) {
        maxFeePerGas = feeData.maxFeePerGas ?? undefined
      }
      if (maxPriorityFeePerGas == null) {
        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? undefined
      }
    }

    const partialUserOp: any = {
      sender: this.getAccountAddress(),
      nonce: info.nonce ?? this.getNonce(),
      initCode,
      callData,
      callGasLimit,
      verificationGasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymasterAndData: '0x'
    }

    let paymasterAndData: string | undefined
    if (this.paymasterAPI != null) {
      // fill (partial) preVerificationGas (all except the cost of the generated paymasterAndData)
      const userOpForPm = {
        ...partialUserOp,
        preVerificationGas: await this.getPreVerificationGas(partialUserOp)
      }
      paymasterAndData = await this.paymasterAPI.getPaymasterAndData(userOpForPm)
    }
    partialUserOp.paymasterAndData = paymasterAndData ?? '0x'
    return {
      ...partialUserOp,
      preVerificationGas: this.getPreVerificationGas(partialUserOp),
      signature: ''
    }
}

  async signUserOpHash (userOpHash: string): Promise<string> {
    return await this.owner.signMessage(arrayify(userOpHash))
  }

  async getAccountAddress (): Promise<string> {
    const TouchIdSafeWalletContractProxyFactory: BananaAccountProxyFactory = BananaAccountProxyFactory__factory.connect(
      this.factoryAddress,
      this.provider
    );
    const TouchIdSafeWalletContractInitializer = this.getTouchIdSafeWalletContractInitializer();
    const TouchIdSafeWalletContractAddress = await TouchIdSafeWalletContractProxyFactory.getAddress(this.singletonTouchIdSafeAddress, this.saltNonce, TouchIdSafeWalletContractInitializer);
    return TouchIdSafeWalletContractAddress
  }
}