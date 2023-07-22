import { Bytes, ethers } from "ethers";
import { EntryPoint__factory, EntryPoint } from "@account-abstraction/contracts";
import { MyPaymasterApi } from "./MyPayMasterApi";
import { MyWalletApi } from "./MyWalletApi";
import { HttpRpcClient } from "@account-abstraction/sdk/dist/src/HttpRpcClient";
import { ERC4337EthersProvider } from "@account-abstraction/sdk";
import { Chains, getClientConfigInfo, getChainSpecificAddress, getChainSpecificConfig  } from "./Constants";
import { registerFingerprint } from "./WebAuthnContext";
import { BananaSigner } from "./BananaSigner";
import { BananaCookie } from "./BananaCookie";
import {
  setUserCredentials,
  getUserCredentials,
  checkIsWalletNameExist
} from "./Controller";
import {
  PublicKey,
  ClientConfig,
  UserCredentialObject,
  ChainConfig
} from "./interfaces/Banana.interface";
import { BananaAccount, BananaAccountProxyFactory } from './types'
import { BananaAccount__factory, BananaAccountProxyFactory__factory} from './types/factories'
import { JsonRpcProvider } from "@ethersproject/providers";
import { Network } from "@ethersproject/providers";
import { Wallet } from "./BananaWallet"
import { Banana4337Provider } from "./Banana4337Provider";
import { walletNameInput } from "./utils/walletNameInput";
import { getKeccakHash } from "./utils/getKeccakHash";
import { encode } from "./utils/base64url-arraybuffer";

export class Banana {
  Provider: ClientConfig;
  SCWContract!: ethers.Contract;
  TouchIdSafeWalletContract!: ethers.Contract;
  accountApi!: MyWalletApi;
  httpRpcClient!: HttpRpcClient;
  publicKey!: PublicKey;
  bananaSigner!: BananaSigner;
  jsonRpcProvider!: ethers.providers.JsonRpcProvider;
  walletAddress!: string;
  bananaProvider!: Banana4337Provider;
  cookieObject!: UserCredentialObject;
  cookie: BananaCookie;
  walletIdentifier!: string;
  jsonRpcProviderUrl: string;
  addresses: ChainConfig;
  network: Chains
  action?: string
  #isUserNameRequested = false

  constructor(readonly chain: Chains, readonly _action?: string) {
    this.action = _action;
    console.log('this is action', this.action)
    this.Provider = getClientConfigInfo(chain);
    this.addresses = getChainSpecificAddress(chain)
    this.jsonRpcProviderUrl = getChainSpecificConfig(chain).jsonRpcUrl;
    this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(
      this.jsonRpcProviderUrl
    );
    this.cookie = new BananaCookie();
    this.network = chain;
  }

  /**
   * @method getTouchIdSafeWalletContractProxyFactory
   * @params { Signer | JsonRpcProvider } signerOrProvider
   * @returns { BananaAccountProxyFactory } TouchIdSafeWalletContractProxyFactory
   * create factory contract instance for factory contract factory types.
   */
  private getTouchIdSafeWalletContractProxyFactory = (signerOrProvider: JsonRpcProvider ): BananaAccountProxyFactory => {
    const TouchIdSafeWalletContractProxyFactory: BananaAccountProxyFactory = BananaAccountProxyFactory__factory.connect(
      this.addresses.TouchIdSafeWalletContractProxyFactoryAddress,
      signerOrProvider
    );
    return TouchIdSafeWalletContractProxyFactory;
  }

  /**
   * @method setCookieAfterAddressCreation
   * @params { string } walletIdentifier
   * @returns none
   * Set cookie to local and global storage after wallet creation.
   */
  private setCookieAfterAddressCreation = async (walletIdentifier: string, saltNonce: number) => {
    this.cookieObject = {
      q0: this.publicKey.q0,
      q1: this.publicKey.q1,
      walletAddress: this.walletAddress,
      initcode: false,
      encodedId: this.publicKey.encodedId,
      username: walletIdentifier,
      saltNonce: saltNonce.toString() //! Need to make changes to the mapper code for this additional property
    };
    // saving cookie correspond to user Identifier in cookie
    this.cookie.setCookie(
      "bananaUser",
      JSON.stringify(walletIdentifier)
    );
    this.cookie.setCookie(
      walletIdentifier,
      JSON.stringify(this.cookieObject)
    );
    const setCredentialsStatus = await setUserCredentials(
      walletIdentifier,
      this.cookieObject
    );
    if(!setCredentialsStatus.success)
    throw new Error("Error: db update failure");
  }

  /**
   * @method createSignerAndCookieObject
   * @params { string } walletIdentifier
   * @returns none
   * Create cookie object and create secure enclave based transaction signer for user's wallet.
   */
  private createSignerAndCookieObject = async (walletIdentifier: string) => {
    const walletName = this.cookie.getCookie("bananaUser");
    if (!!walletName) {
      this.cookieObject = this.cookie.getCookie(walletName);
      if (this.cookieObject) {
        const q0Value = this.cookieObject.q0;
        const q1Value = this.cookieObject.q1;
        const encodedId = this.cookieObject.encodedId;
        this.publicKey = {
          q0: q0Value,
          q1: q1Value,
          encodedId: encodedId,
        };
        this.walletIdentifier = walletName;
        // this.createBananaSignerInstance();
        return;
      } else {
        const walletCreds = await getUserCredentials(walletIdentifier);
        // get and check cred here
        // else of below if should not be triggered as we are already getting wallet name from cookie means the creds are initialized
        if (!!walletCreds) {
          this.cookieObject = walletCreds;
          const q0Value = this.cookieObject.q0;
          const q1Value = this.cookieObject.q1;
          const encodedId = this.cookieObject.encodedId;
          this.publicKey = {
            q0: q0Value,
            q1: q1Value,
            encodedId: encodedId,
          };
          this.walletIdentifier = walletName;
          // this.createBananaSignerInstance();
          return;
        }
      }
    } else {
      // when nothing in cookie or cred is there but with no username in that case fetching key from user provided walletname
      const walletCreds = await getUserCredentials(walletIdentifier);
      if (!!walletCreds) {
        this.cookieObject = walletCreds;
        const q0Value = this.cookieObject.q0;
        const q1Value = this.cookieObject.q1;
        const encodedId = this.cookieObject.encodedId;
        this.publicKey = {
          q0: q0Value,
          q1: q1Value,
          encodedId: encodedId,
        };
        this.walletIdentifier = walletIdentifier;
        return;
      }
      // he must have sent the username for registering wallet
    }
    this.walletIdentifier = walletIdentifier;
    this.publicKey = await registerFingerprint();
  };

  getAddress(): string {
    const uncompressedPublicKey = `0x04${this.publicKey.q0.slice(2)}${this.publicKey.q1.slice(2)}`;
    return ethers.utils.computeAddress(uncompressedPublicKey)
  }

  getUsernameRequestStatus(): boolean {
    return this.#isUserNameRequested;
  }

  /**
   * @method getBananaProvider
   * @params none
   * @returns { ERC4337EthersProvider } bananaProvider
   * create ERC4337Provider instance of user's smart contract wallet. Used as BananaProvider.
   */
  getBananaProvider = async (): Promise<Banana4337Provider> => {
    if (this.bananaProvider) return this.bananaProvider;

    let network: Network = await this.jsonRpcProvider.getNetwork();

    const entryPoint: EntryPoint = EntryPoint__factory.connect(
      this.Provider.entryPointAddress,
      this.jsonRpcProvider
    );

    const TouchIdSafeWalletContractProxyFactory: BananaAccountProxyFactory = this.getTouchIdSafeWalletContractProxyFactory(this.jsonRpcProvider)

    const TouchIdSafeWalletContractProxyFactoryAddress: string = TouchIdSafeWalletContractProxyFactory.address;

    const myPaymasterApi: MyPaymasterApi = new MyPaymasterApi();

    const smartWalletAPI: MyWalletApi = new MyWalletApi({
      provider: this.jsonRpcProvider,
      entryPointAddress: this.Provider.entryPointAddress,
      accountAddress: this.walletAddress,
      owner: this.jsonRpcProvider.getSigner(),
      factoryAddress: TouchIdSafeWalletContractProxyFactoryAddress,
      paymasterAPI: myPaymasterApi,
      _qValues: [this.publicKey.q0, this.publicKey.q1],
      _singletonTouchIdSafeAddress: this.addresses.TouchIdSafeWalletContractSingletonAddress,
      _ownerAddress: this.getAddress(),
      _fallBackHandler: this.addresses.fallBackHandlerAddress,
      _saltNonce: this.cookieObject.saltNonce,
      _encodedIdHash: getKeccakHash(this.publicKey.encodedId)
    });

    this.accountApi = smartWalletAPI;

    const httpRpcClient: HttpRpcClient = new HttpRpcClient(
      this.Provider.bundlerUrl,
      this.Provider.entryPointAddress,
      network.chainId
    );

    this.httpRpcClient = httpRpcClient;
    console.log('setting action ', this.action)
    this.bananaProvider = await new Banana4337Provider(
      network.chainId,
      this.Provider,
      this.jsonRpcProvider.getSigner(),
      this.jsonRpcProvider,
      httpRpcClient,
      entryPoint,
      smartWalletAPI,
      this.publicKey,
      this.jsonRpcProvider,
      this.action
    ).init();

    return this.bananaProvider;
  };

  /**
   * @method getTouchIdSafeWalletContractInitializer
   * @params none
   * @returns { string } TouchIdSafeWalletContractInitializer
   * create initializer which is callData for setupWithEntrypoint function
   */

  private getTouchIdSafeWalletContractInitializer = (): string => {
    const TouchIdSafeWalletContractSingleton: BananaAccount = BananaAccount__factory.connect(
      this.addresses.TouchIdSafeWalletContractSingletonAddress,
      this.jsonRpcProvider
    );
    const TouchIdSafeWalletContractQValuesArray: Array<string> = [this.publicKey.q0, this.publicKey.q1];
    //@ts-ignore
    const TouchIdSafeWalletContractInitializer = TouchIdSafeWalletContractSingleton.interface.encodeFunctionData('setupWithEntrypoint',
    [
      [this.getAddress()], // owners 
      1,                                              // thresold will remain fix 
      "0x0000000000000000000000000000000000000000",   // to address 
      "0x",                                           // modules setup calldata
      this.addresses.fallBackHandlerAddress,          // fallback handler
      "0x0000000000000000000000000000000000000000",   // payment token
      0,                                              // payment 
      "0x0000000000000000000000000000000000000000",   // payment receiver
      this.Provider.entryPointAddress,                // entrypoint
      getKeccakHash(this.publicKey.encodedId),
      // @ts-ignore
      TouchIdSafeWalletContractQValuesArray,          // q values 
    ]);

    return TouchIdSafeWalletContractInitializer
  };

  /**
   * @method createWallet
   * @param { string } walletIdentifier
   * @returns 
   * sucess: returns { status: success, address: walletAddress }
   * error: returns { status: error, address: "" }
   * setup signers and provider along with it create walletmetadata corresponding to the new wallet request.
   */

  createWallet = async (): Promise<Wallet> => {
      this.#isUserNameRequested = true;
      const walletIdentifier = await walletNameInput();
      await this.createSignerAndCookieObject(walletIdentifier);
      this.walletIdentifier = walletIdentifier
      const TouchIdSafeWalletContractProxyFactory = this.getTouchIdSafeWalletContractProxyFactory(this.jsonRpcProvider);
      const TouchIdSafeWalletContractInitializer = this.getTouchIdSafeWalletContractInitializer();
      let saltNonce = 0;
      let isAddressUnique = false;
      let TouchIdSafeWalletContractAddress

      while(!isAddressUnique) {
        TouchIdSafeWalletContractAddress = await TouchIdSafeWalletContractProxyFactory.getAddress(this.addresses.TouchIdSafeWalletContractSingletonAddress, saltNonce.toString(), TouchIdSafeWalletContractInitializer);
        isAddressUnique = true;
        //! No need to check address for now 
        // await NetworkAddressChecker(TouchIdSafeWalletContractAddress)
        if(!isAddressUnique)
        saltNonce++;
      }

      if(TouchIdSafeWalletContractAddress) {
        this.walletAddress = TouchIdSafeWalletContractAddress;
      }
      this.setCookieAfterAddressCreation(walletIdentifier, saltNonce);
      this.bananaProvider = await this.getBananaProvider();
      this.postCookieChecks(walletIdentifier);
      //! for now our wallet is chainSpecific
      return new Wallet(this.walletAddress, this.bananaProvider, this.network);
  }

  /**
   * @method connectWallet
   * @param { string } walletIdentifier
   * @returns 
   * sucess: returns { status: success, address: walletAddress }
   * error: returns { status: error, address: "" }
   * setup providers and signers at the sdk end in case user's already has a wallet created before.
   */

  connectWallet = async (walletIdentifier: string) => {
    await this.createSignerAndCookieObject(walletIdentifier)
    this.bananaProvider = await this.getBananaProvider();
    this.walletAddress = this.cookieObject.walletAddress;
    this.postCookieChecks(walletIdentifier);
    return new Wallet(this.walletAddress, this.bananaProvider, this.network);
  }

  /**
   * @method resetWallet
   * @param none
   * @returns { string } walletName
   * method to remove current wallet metadata from browser
   */

  resetWallet = () => {
    try {
      const walletName = this.cookie.getCookie("bananaUser");
      this.cookie.deleteCookie(walletName);
      this.cookie.deleteCookie("bananaUser");
      this.#isUserNameRequested = false;
      return { success: true }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  /**
   * @method getWalletName
   * @param none
   * @returns { string } walletName
   * method to getWalletName stored in user's cookie storage against bananaUser key
   */

  getWalletName = () => {
    const walletName = this.cookie.getCookie("bananaUser");
    return walletName;
  };

  /**
   * @method getOwnerAddress
   * @param { string } walletName
   * @returns { string } eoaAddress
   * method to return the hardware address for a specific walletName.
   */

  getEOAAddress = async () => {
    const walletMetaData = await getUserCredentials(this.walletIdentifier);
    return [walletMetaData.q0, walletMetaData.q1];
  }

  /**
   * @method verify
   * @param { string } signaure, { string } messageSigned, { string } eoaAddress
   * @returns { boolean } isVerified
   * method to verify message against signature
   */

  //! for now assigned eoaAddress as any type
  verifySignature = async (signature: string, message: string, eoaAddress: any): Promise<boolean> => {

    const bananaAccount: BananaAccount = BananaAccount__factory.connect(this.walletAddress, this.jsonRpcProvider);
    const abiDecode = ethers.utils.defaultAbiCoder;
    const decoded = abiDecode.decode(['uint', 'uint', 'bytes', 'string', 'string', 'bytes32'], signature);
    const rHex = decoded[0]._hex;
    const sHex = decoded[1]._hex;
    const authenticatorData = decoded[2];
    const clientDataJSONPre = decoded[3];
    const clientDataJSONPost = decoded[4];

    const messageHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string"], [message])
    );

    let isSignatureValid = false;

    try {
      const textEncoder = new TextEncoder();
      const base64RequestId = encode(textEncoder.encode(messageHash).buffer)
      const clientDataJSON = `${clientDataJSONPre}${base64RequestId}${clientDataJSONPost}`;
      const concatenatedData = ethers.utils.concat([authenticatorData, ethers.utils.sha256(ethers.utils.toUtf8Bytes(clientDataJSON))]);
      const messageToBeSigned = ethers.utils.sha256(concatenatedData);
      isSignatureValid = await bananaAccount.verifySignature(messageToBeSigned, [rHex, sHex], eoaAddress);
    } catch (err) {
      console.log(err)
      return false;
    }
    return isSignatureValid;
  }

  /**
   * @method postCookieChecks
   * @param { string } walletIdentifier
   * @returns none
   * handles cookie update
   */

  private postCookieChecks = async (walletIdentifier: string) => {
    // check for username
    const walletName = this.cookie.getCookie("bananaUser");
    if (!!walletName) {
      this.cookie.setCookie(walletName, JSON.stringify(this.cookieObject));
      return;
    }
    this.cookie.setCookie("bananaUser", JSON.stringify(walletIdentifier));
    this.cookie.setCookie(walletIdentifier, JSON.stringify(this.cookieObject));
  };


  /**
   * @method isWalletNameUnique
   * @param { string } walletName
   * @returns { boolean } isWalletNameTaken
   * check isWalletName user is giving is already taken or not
   */

  isWalletNameUnique = async (walletName: string) => {
    try {
      const isWalletNameTaken = await checkIsWalletNameExist(walletName);
      return isWalletNameTaken;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}