import { Signer } from "@ethersproject/abstract-signer";
import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { Logger } from "@ethersproject/logger";
import {
  BaseProvider,
  JsonRpcProvider,
  TransactionResponse,
} from "@ethersproject/providers";
import { ethers } from "ethers";
import { Deferrable } from "@ethersproject/properties";
import { Bytes } from "@ethersproject/bytes";
import { verifyFingerprint } from "./WebAuthnContext";
import { PublicKey } from "./interfaces/Banana.interface";
import UserOperation from "./utils/userOperation";
import {
  ClientConfig,
  ERC4337EthersSigner,
  HttpRpcClient,
} from "@account-abstraction/sdk";
import { BaseAccountAPI } from "@account-abstraction/sdk/dist/src/BaseAccountAPI";
import { Banana4337Provider } from "./Banana4337Provider";
import { sendTransaction } from "./bundler/sendUserOp";
import { MyWalletApi } from "./MyWalletApi";
import { BananaAccount, BananaAccount__factory } from "./types";
import Axios from "axios";
import { getRequestDataForPaymaster } from "./paymaster/getRequestData";
import { getPaymasterAndData } from "./paymaster/getPaymasterAndData";

export class BananaSigner extends ERC4337EthersSigner {
  jsonRpcProvider: JsonRpcProvider;
  publicKey: PublicKey;
  address!: string;
  encodedId: string;
  action?: string

  constructor(
    readonly config: ClientConfig,
    readonly originalSigner: Signer,
    readonly erc4337provider: Banana4337Provider,
    readonly httpRpcClient: HttpRpcClient,
    readonly smartAccountAPI: MyWalletApi,
    provider: JsonRpcProvider,
    publicKey: PublicKey,
    _action ?: string
  ) {
    super(
      config,
      originalSigner,
      erc4337provider,
      httpRpcClient,
      smartAccountAPI
    );
    this.jsonRpcProvider = provider;
    this.publicKey = publicKey;
    this.encodedId = publicKey.encodedId;
    this.getAddress();
    console.log('action in signer ', _action)
    this.action = _action;
  }

  // need to do some changes in it
  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    const tx: TransactionRequest = await this.populateTransaction(transaction);
    await this.verifyAllNecessaryFields(tx);
    let userOperation = await this.smartAccountAPI.createUnsignedUserOp({
      target: tx.to ?? "",
      data: tx.data?.toString() ?? "",
      value: tx.value,
      gasLimit: tx.gasLimit,
    });
    let processStatus = true;
    while (processStatus) {
      let minGasRequired = ethers.BigNumber.from(userOperation?.callGasLimit)
        .add(ethers.BigNumber.from(userOperation?.verificationGasLimit))
        .add(ethers.BigNumber.from(userOperation?.callGasLimit));
      let currentGasPrice = await this.jsonRpcProvider.getGasPrice();
      let minBalanceRequired = minGasRequired.mul(currentGasPrice);
      //@ts-ignore
      let userBalance: BigNumber = await this.jsonRpcProvider.getBalance(
        userOperation?.sender
      );

      console.log('user balance', userBalance)
      console.log('min balance needed', minBalanceRequired)

       if (userBalance.lt(minBalanceRequired)) {
         throw new Error("ERROR: Insufficient balance in Wallet");
       }

      userOperation.preVerificationGas = ethers.BigNumber.from(await userOperation.preVerificationGas).add(20000);
      userOperation.verificationGasLimit = 1.5e6;

      //@ts-ignore
      if(parseInt(userOperation.callGasLimit._hex) < 33100) {
        userOperation.callGasLimit = ethers.BigNumber.from(33100)
      }

      const message = await this.smartAccountAPI.getUserOpHash(userOperation);
      const { newUserOp, process } = await this.signUserOp(
        userOperation as any,
        message,
        this.encodedId
      );
      if (process === "success") {
        userOperation = newUserOp;
        processStatus = false;
      }
    }
    let transactionResponse =
      await this.erc4337provider.constructUserOpTransactionResponse(
        userOperation
      );
    try {

      const networkInfo = await this.jsonRpcProvider.getNetwork();
      if(networkInfo.chainId === 81 || networkInfo.chainId === 592 || networkInfo.chainId === 4478 ) {
        //! sending UserOp directly to ep for shibuya
        const receipt = await sendTransaction(userOperation, this.jsonRpcProvider);
        transactionResponse = receipt;
      } else {
        console.log('this is uyserop ', userOperation)
        userOperation.sender = (await userOperation.sender);
        userOperation.nonce = (await userOperation.nonce)
        if(this.action && this.action === 'register') {
          // send it to a url
        } else 
        await this.httpRpcClient.sendUserOpToBundler(userOperation);
      }
    } catch (error: any) {
      console.error('sendUserOpToBundler failed', error)
      throw this.unwrapError(error);
    }
    // TODO: handle errors - transaction that is "rejected" by bundler is _not likely_ to ever resolve its "wait()"
    return transactionResponse;
  }

  // async sendBatchTransaction(
  //   transactions: Deferrable<TransactionRequest>[]
  // ): Promise<TransactionResponse> {
  //   let txns: TransactionRequest[] = [];
  //   let values = [], to = [], txnData = [];
  //   values = transactions.map(txn => txn.value);
  //   to = transactions.map(txn => txn.to);
  //   txnData = transactions.map(txn => txn.data);
    
    
  //   console.log(to, values, txnData);
  //   const delegateCall = ethers.BigNumber.from("1")
  //   const bananaAccount: BananaAccount = BananaAccount__factory.connect(await this.smartAccountAPI.getAccountAddress(), this.jsonRpcProvider)
  //   const finaltxnData = bananaAccount.interface.encodeFunctionData(
  //     //@ts-ignore
  //     'execBatchTransactionFromEntrypoint',
  //     [
  //       to,
  //       values,
  //       txnData,
  //       delegateCall
  //     ])
  //   console.log(finaltxnData);
  //   const batchedTxn = {
  //     to: await this.smartAccountAPI.getAccountAddress(),
  //     value: 0,
  //     data: finaltxnData,
  //     gasLimit: '0xf4240'
  //   }
    
  //   const populatedTxn = await this.populateTransaction(batchedTxn);
  //   console.log('populated txn', populatedTxn);
  //   await this.verifyAllNecessaryFields(populatedTxn);
  //   console.log('verified');
  //   let userOperation = await this.smartAccountAPI.createUnsignedUserOp({
  //     target: populatedTxn.to ?? "",
  //     data: populatedTxn.data?.toString() ?? "",
  //     value: populatedTxn.value,
  //     gasLimit: populatedTxn.gasLimit,
  //   });
  //   let processStatus = true;
  //   while (processStatus) {
  //     let minGasRequired = ethers.BigNumber.from(userOperation?.callGasLimit)
  //       .add(ethers.BigNumber.from(userOperation?.verificationGasLimit))
  //       .add(ethers.BigNumber.from(userOperation?.callGasLimit));
  //     let currentGasPrice = await this.jsonRpcProvider.getGasPrice();
  //     let minBalanceRequired = minGasRequired.mul(currentGasPrice);
  //     //@ts-ignore
  //     let userBalance: BigNumber = await this.jsonRpcProvider.getBalance(
  //       userOperation?.sender
  //     );

  //      if (userBalance.lt(minBalanceRequired)) {
  //        throw new Error("ERROR: Insufficient balance in Wallet");
  //      }

  //     userOperation.preVerificationGas = ethers.BigNumber.from(await userOperation.preVerificationGas).add(5000);
  //     userOperation.verificationGasLimit = 1.5e6;
  //     const message = await this.smartAccountAPI.getUserOpHash(userOperation);
  //     const { newUserOp, process } = await this.signUserOp(
  //       userOperation as any,
  //       message,
  //       this.encodedId
  //     );
  //     if (process === "success") {
  //       userOperation = newUserOp;
  //       processStatus = false;
  //     }
  //   }
  //   let transactionResponse =
  //     await this.erc4337provider.constructUserOpTransactionResponse(
  //       userOperation
  //     );
  //   try {

  //     const networkInfo = await this.jsonRpcProvider.getNetwork();
  //     if(networkInfo.chainId === 81 || networkInfo.chainId === 592) {
  //       //! sending UserOp directly to ep for shibuya
  //       const receipt = await sendTransaction(userOperation, this.jsonRpcProvider);
  //       transactionResponse = receipt;
  //     } else {
  //       await this.httpRpcClient.sendUserOpToBundler(userOperation);
  //     }
  //   } catch (error: any) {
  //     console.error('sendUserOpToBundler failed', error)
  //     throw this.unwrapError(error);
  //   }
  //   // TODO: handle errors - transaction that is "rejected" by bundler is _not likely_ to ever resolve its "wait()"
  //   return transactionResponse; 
  // }
  async  sendBatchTransaction(
    transactions: Deferrable<TransactionRequest>[]
  ) {
    // const tx: TransactionRequest = await this.populateTransaction(transaction);
    let txns = [];
    for(let i=0; i < transactions.length; i++) {
      const txn = await this.populateTransaction(transactions[i]);
      await this.verifyAllNecessaryFields(txn);
      txns.push(txn);
    }
    console.log("these are txns ", txns);

    const info = txns.map(txn => {
      return {
        target: txn.to ?? "",
        data: txn.data?.toString() ?? "",
        value: txn.value,
        gasLimit: txn.gasLimit
      }
    });

    console.log("info ", info)

    let userOperation = await this.smartAccountAPI.createUnsignedUserOpForBatchedTransaction(info);
    let processStatus = true;
    while (processStatus) {
      let minGasRequired = ethers.BigNumber.from(userOperation?.callGasLimit)
        .add(ethers.BigNumber.from(userOperation?.verificationGasLimit))
        .add(ethers.BigNumber.from(userOperation?.callGasLimit));
      let currentGasPrice = await this.jsonRpcProvider.getGasPrice();
      let minBalanceRequired = minGasRequired.mul(currentGasPrice);
      //@ts-ignore
      let userBalance: BigNumber = await this.jsonRpcProvider.getBalance(
        userOperation?.sender
      );

      console.log('user balance', userBalance)
      console.log('min balance needed', minBalanceRequired)

       if (userBalance.lt(minBalanceRequired)) {
         throw new Error("ERROR: Insufficient balance in Wallet");
       }

      userOperation.preVerificationGas = ethers.BigNumber.from(await userOperation.preVerificationGas).add(20000);
      userOperation.verificationGasLimit = 1.5e6;
      userOperation.callGasLimit = (await userOperation.callGasLimit)
      userOperation.sender = (await userOperation.sender);
      userOperation.nonce = (await userOperation.nonce);

      //@ts-ignore
      if(parseInt(userOperation.callGasLimit._hex) < 33100) {
        userOperation.callGasLimit = ethers.BigNumber.from(33100)
      }
      const message = await this.smartAccountAPI.getUserOpHash(userOperation);
      const { newUserOp, process } = await this.signUserOp(
        userOperation as any,
        message,
        this.encodedId
      );
      if (process === "success") {
        userOperation = newUserOp;
        processStatus = false;
      }
    }
    let transactionResponse =
      await this.erc4337provider.constructUserOpTransactionResponse(
        userOperation
      );
    try {

      const networkInfo = await this.jsonRpcProvider.getNetwork();
      if(networkInfo.chainId === 81 || networkInfo.chainId === 592) {
        //! sending UserOp directly to ep for shibuya
        const receipt = await sendTransaction(userOperation, this.jsonRpcProvider);
        transactionResponse = receipt;
      } else {
        console.log('this is action', this.action);
        
        console.log('this is uyserop ', userOperation)


        // need to get userOp signed here

        console.log('final op for forwariding', userOperation)

        if(this.action && this.action === 'register') {

          // sponsor txn
          // const paymasterUrl = 'https://api.stackup.sh/v1/paymaster/8370e003d4262920e26f19358c6cc295ec7c7e1b6383596d0911ae1b4e25c5b6';
          // const requestData = await getRequestDataForPaymaster(userOperation);
          // const paymasterAndData = await getPaymasterAndData(paymasterUrl, requestData);
          // (userOperation || { paymasterAndData: null }).paymasterAndData = paymasterAndData || '';
          // send it to a url
          const forwarder = 'http://localhost:80';
          const resp = await Axios.post(forwarder + '/register', {
            params: {
              op: userOperation
            }
          });
          console.log('resp', resp);
        } else {
          
          const networkInfo = await this.jsonRpcProvider.getNetwork();
          if(networkInfo.chainId === 81 || networkInfo.chainId === 592 || networkInfo.chainId === 43114 || networkInfo.chainId === 44787) {
            //! sending UserOp directly to ep for shibuya
            const receipt = await sendTransaction(userOperation, this.jsonRpcProvider);
            transactionResponse = receipt;
          } else 
            await this.httpRpcClient.sendUserOpToBundler(userOperation);
        } 
      }
    } catch (error: any) {
      console.error('sendUserOpToBundler failed', error)
      throw this.unwrapError(error);
    }
    // TODO: handle errors - transaction that is "rejected" by bundler is _not likely_ to ever resolve its "wait()"
    return transactionResponse;
  }

  async signBananaMessage(message: Bytes | string) {
    const messageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string"], [message])
    );
    let process = true;
    let userOpWithSignatureAndMessage: any;
    try {
      while (process) {
        userOpWithSignatureAndMessage = await verifyFingerprint(
          {} as UserOperation,
          messageHash as string,
          this.encodedId
        );
        if (userOpWithSignatureAndMessage.process === "success") {
          process = false;
        }
      }
    } catch (err) {
      return Promise.reject(err);
    }
    const finalReplayProofSignature =
      userOpWithSignatureAndMessage.newUserOp.signature;
    /**
     * Note:
     * the `message` is signed using secp256r1 instead of secp256k1, hence to verify
     * signedMessage we cannot use ecrecover!
     */
    return {
      signature: finalReplayProofSignature,
    };
  }

  async signUserOp(userOp: UserOperation, reqId: string, encodedId: string) {
    const signedUserOp = await verifyFingerprint(
      userOp as any,
      reqId,
      encodedId
    );
    return signedUserOp;
  }
}
