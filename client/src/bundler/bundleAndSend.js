import { ethers } from "ethers";
import { Banana, Chains } from "../sdk/index";

export const bundleAndSend = async (txns) => {
  // console.log(txns);

  // const chains = new Set(txns.map(txn => txn.chain));
  // let txnChainWise = new Map();

  // let allChains = []
  // chains.forEach((value) => {
  //     allChains.push(value)
  // });

  // allChains.map(chain => txnChainWise.set(chain, []));

  // console.log(allChains)
  // console.log(chains)

  // let bridgeTxn;
  // for(let i=0; i < txns.length; i++) {
  //     if(txns[i].type === 'normal') {
  //         let existingTxns = txnChainWise.get(txns[i].chain);
  //         txnChainWise.set(txns[i].chain, [...existingTxns, txns[i].txn]);
  //     } else {
  //         bridgeTxn = txns[i].txn;
  //     }
  // };

  // console.log(txnChainWise)

  console.log("all txns ", txns);

  const bananaInstanceMumbai = new Banana(Chains.mumbai);
  // after bridging
  const bananaInstanceAvalanche = new Banana(Chains.fuji, "register");

  const walletName = bananaInstanceMumbai.getWalletName();

  const walletMumbai = await bananaInstanceMumbai.connectWallet(walletName);
  const walletAvalanche = await bananaInstanceAvalanche.connectWallet(
    walletName
  );

  const signerMumbai = walletMumbai.getSigner();
  const signerAvalanche = walletAvalanche.getSigner();

  // console.log([...txnChainWise.get("80001"), bridgeTxn])
  // const txnMumbaiResp = await signerMumbai.sendBatchTransaction([...txnChainWise.get("80001"), bridgeTxn]);
  // const txnOptimismResp = await signerAvalanche.sendBatchTransaction([...txnChainWise.get("420")]);

  const mumbaiTxn = txns[0];
  mumbaiTxn.value = ethers.utils.parseEther(
    String(Number(mumbaiTxn.value) / 10 ** 18)
  );
  console.log("mumbai txn ", mumbaiTxn);

  let avalancheTxn = txns[1];
  console.log(avalancheTxn);

  const txnMumbaiResp = await signerMumbai.sendBatchTransaction([mumbaiTxn]);
  const txnAvalamnche = await signerAvalanche.sendBatchTransaction([
    avalancheTxn,
  ]);

  console.log(txnMumbaiResp);
  console.log(txnAvalamnche);
};
