import React, { useEffect, useState } from "react";
import "./Prompt.css";
import { Banana, Chains } from "../../sdk/index";
import "@rainbow-me/rainbowkit/styles.css";
import { ethers } from "ethers";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../shared/Loader/Loader";
import ModalComponent from "../shared/Modal/Modal";
import { Button, Dropdown, Space } from "antd";
import StakingArtifact from "../abi/Staking.json";
import { bundleAndSend } from "../../bundler/bundleAndSend";
import { createAttestation } from '../../attest/createAttestation'
import { useLazyQueryWithPagination } from '@airstack/airstack-react';
import { ERC20TokensQueryPolygon } from "../../query";
import TokenSection from "../tokens/Token";
import ChatIconModal from "../Chats/Chats";

const PromptComponent = () => {
  const items = [
    {
      key: Chains.mumbai,
      label: (
        <h4 onClick={() => setCurrentChain(Chains.mumbai)}> Polygon Mumbai </h4>
      ),
    },
    {
      key: Chains.polygonMainnet,
      label: (
        <h4 onClick={() => setCurrentChain(Chains.polygonMainnet)}>Polygon</h4>
      ),
    },
    {
      key: Chains.gnosis,
      label: (
        <h4 onClick={() => setCurrentChain(Chains.gnosis)}>Polygon</h4>
      ),
    },
  ];

  // const prices = await getUSDCUSDTCurrentPrice()


  const [walletAddress, setWalletAddress] = useState("");
  const [bananaSdkInstance, setBananSdkInstance] = useState(null);
  const [transactions, setTransactions] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [walletInstance, setWalletInstance] = useState(null);
  const [output, setOutput] = useState("Welcome to Banana Demo");
  const [intent, setIntent] = useState("");
  const [confirmModa, setConfirmModal] = useState(false);
  const [currentChain, setCurrentChain] = useState(Chains.mumbai);
  const [txnType, setTxnType] = useState("");
  const [tokens, setTokens] = useState({
    polygon: []
  });

  const [fetch, { data: data, loading, pagination }] =
  useLazyQueryWithPagination(ERC20TokensQueryPolygon);

  useEffect(() => {
    if ('0x288d1d682311018736B820294D22Ed0DBE372188') {
      setTokens({
        polygon: []
      });
      fetch({
        owner: '0x288d1d682311018736B820294D22Ed0DBE372188',
        limit: 20
      });
    }
    /*
      Even though ERC20 tokens are not dependant on tokenType, we added tokenType to the dependency array to force a refetch when tokenType changes.
      Without this, the tokens list would be unable to fetch additional pages since the window scroll height would be too great (too many ERC20 items).
      InfiniteScroll depends on the window scroll height, if the height is too high, user will have to scroll to the bottom to initiate a pagination call.
    */
  }, [fetch, walletAddress]);

  useEffect(() => {
    if (data) {
      setTokens(existingTokens => ({
        polygon: [
          ...existingTokens.polygon,
          ...(data?.polygon?.TokenBalance || [])
        ]
      }));

      console.log('this is data of polygon ', data);
    }
  }, [data]);

  useEffect(() => {
    getBananaInstance();
  }, []);

  useEffect(() => {
    getBananaInstance();
  }, [currentChain]);

  const SERVER_URL = "http://localhost:81";

  const getBananaInstance = () => {
    const bananaInstance = new Banana(currentChain);
    setBananSdkInstance(bananaInstance);
  };

  const createWallet = async () => {
    setIsLoading(true);
    const wallet = await bananaSdkInstance.createWallet();
    setWalletInstance(wallet);
    const address = await wallet.getAddress();
    setWalletAddress(address);
    setOutput("Wallet Address: " + address);
    setIsLoading(false);
  };

  const connectWallet = async () => {
    const walletName = bananaSdkInstance.getWalletName();
    if (walletName) {
      setIsLoading(true);
      const wallet = await bananaSdkInstance.connectWallet(walletName);
      setWalletInstance(wallet);
      const address = await wallet.getAddress();
      setWalletAddress(address);
      setOutput("Wallet Address: " + address);
      setIsLoading(false);
    } else {
      createWallet();
    }
  };

  const sendTransaction = async () => {
    setConfirmModal(false);
    console.log('this is txn type ', txnType);
    const signer = walletInstance.getSigner();
    if(txnType === 'bridge') {
      await bundleAndSend(transactions);
      toast.success("Transaction successfull !!");
    } else {
      let txnResp;
      console.log("transactions formed ", transactions);
      
      if((currentChain !== 137 && currentChain !== 100) && txnType === 'swap') {
        toast.error('Swap is not supported on testnets');
        setIsLoading(false);
        return;
      }
  
      if (transactions.length === 1) {
        const finalTxn = {
          ...transactions[0],
          gasLimit: "0x55555",
        };
        txnResp = await signer.sendTransaction(finalTxn);
        console.log("response from txn", txnResp);
      } else {
        console.log("here we are ", transactions);
        const txns = transactions.map((txn) => {
          return {
            ...txn,
            gasLimit: "0xF4240",
          };
        });
  
        console.log("these are txns", txns);
        const txnResp = await signer.sendBatchTransaction(txns);
        console.log("response from bvatched txn", txnResp);
      }

    }

    toast.success("Transaction successfull !!");
    setIsLoading(false);
  };

  const generateTransactions = async () => {
    setIsLoading(true);
    const res = await Axios.get(SERVER_URL + "/solve", {
      params: {
        intent: intent,
        userAddress: walletAddress,
        chain: currentChain
      },
    });
    const transactions = JSON.parse(res.data.transactions);
    setTransactions(transactions.transaction);
    setTxnType(transactions.type);
    setConfirmModal(true);
  };

  return (
    <div>
      <Loader isLoading={isLoading}>
        <Toaster />
        <div className="rainbow-div">
          <div className="rainbow-btn">
            {walletAddress ? (
              <div>
                <TokenSection tokens={tokens.polygon} />
              <p> {walletAddress}</p>
              {/* <ChatIconModal walletAddress={walletAddress} signer={walletInstance.getSigner()}  /> */}
                </div>
            ) : (
              <div>
                <Dropdown
                  menu={{
                    items,
                  }}
                  placement="bottom"
                >
                  <Button>{currentChain}</Button>
                </Dropdown>
                <button className="connect-btn" onClick={() => connectWallet()}>
                  Connect
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="prompt">
          <div className="content">
            <input
              className="inputField"
              type="text"
              placeholder="Enter your intent"
              onChange={(e) => setIntent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") generateTransactions();
              }}
            />
            <button
              className="executeButton"
              onClick={() => { 
                generateTransactions()
                // await createAttestation(walletAddress, intent); 
              }}
            >
              Execute
            </button>

            <ModalComponent
              transaction={transactions}
              isModalOpen={confirmModa}
              doTransaction={() => sendTransaction()}
            />
          </div>
        </div>
      </Loader>
    </div>
  );
};

export default PromptComponent;


