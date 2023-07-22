// for fetching price
async function fetchQuote(one, two, tokenOneAmount) {
    try {
      const res = await axios.get(
        `https://api.1inch.io/v5.0/${activeChainId}/quote/`,
        {
          params: {
            fromTokenAddress: one.address,
            toTokenAddress: two.address,
            amount: tokenOneAmount.toString(),
          },
        }
      );
      console.log(res.data);
      setEstimatedGas(res.data.estimatedGas);
      return res.data.toTokenAmount;
    } catch (error: any) {
      if (error.response.data.statusCode == 400) {
        setErrorMsg(error.response.data.description);
      } else {
        setErrorMsg("");
      }
    }
  }

  async function fetchDexSwap() {
    console.log(selectedAccount?.smartAccountAddress);
    if (
      !tokenOneAmount ||
      !isConnected ||
      (parseFloat(tokenOneAmount) > parseFloat(balanceOne) &&
        parseFloat(tokenOneAmount) > parseFloat(swBalanceOne)) ||
      !wallet ||
      !selectedAccount?.smartAccountAddress
    )
      return;
    const id = toast.loading("⏳ Preparing meta transaction...", {
      theme: "dark",
      position: "bottom-left",
    });
    try {
      setIsLoading(true);

      if (parseFloat(swBalanceOne) >= parseFloat(tokenOneAmount)) {
        toast.update(id, {
          render: "Preparing Swap now ...",
          type: "info",
          isLoading: true,
          theme: "dark",
          icon: "⏳",
        });
        const allowance = await axios.get(
          `https://api.1inch.io/v5.0/${activeChainId}/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${selectedAccount?.smartAccountAddress}`
        );
        console.log(allowance);
        let smartAccount = wallet;

        /*         console.log(
          //@ts-ignore
          await smartAccount.isDeployed(activeChainId),
          smartAccount.address
        ); */
        //@ts-ignore
        /*         if (!(await smartAccount.isDeployed(activeChainId))) {
          console.log("deploying");
          await smartAccount.deployWalletUsingPaymaster();
        } */
        const txs = [];
        if (
          tokenOne.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" &&
          Number(allowance.data.allowance) <
            //@ts-ignore
            Number(parseFloat(tokenOneAmount * 10 ** tokenOne.decimals))
        ) {
          const approve = await axios.get(
            `https://api.1inch.io/v5.0/${activeChainId}/approve/transaction?tokenAddress=${
              tokenOne.address
            }&amount=${ethers.utils
              .parseUnits(tokenOneAmount, tokenOne.decimals)
              .toString()}`
          );

          const tx1 = {
            to: approve.data.to,
            data: approve.data.data,
          };
          txs.push(tx1);
        }

        const query =
          activeChainId != 137
            ? `https://api.1inch.io/v5.0/${activeChainId}/swap?fromTokenAddress=${
                tokenOne.address
              }&toTokenAddress=${tokenTwo.address}&amount=${ethers.utils
                .parseUnits(tokenOneAmount, tokenOne.decimals)
                .toString()}&fromAddress=${
                selectedAccount.smartAccountAddress
              }&destReceiver=${address}&slippage=${slippage}&disableEstimate=true`
            : `https://api.1inch.io/v5.0/${activeChainId}/swap?fromTokenAddress=${
                tokenOne.address
              }&toTokenAddress=${tokenTwo.address}&amount=${ethers.utils
                .parseUnits(tokenOneAmount, tokenOne.decimals)
                .toString()}&fromAddress=${address}&slippage=${slippage}&disableEstimate=true`;

        console.log(query);

        const tx = await axios.get(query);
        console.log(tx.data);

        const tx2 = {
          to: tx.data.tx.to,
          data: tx.data.tx.data,
          value: tx.data.tx.value,
        };
        console.log(tx2);
        txs.push(tx2);

        console.log("txs", txs);
        const txResponse = await smartAccount.sendTransactionBatch({
          transactions: txs,
        });

        console.log('this is transaction response ', txResponse)

        toast.update(id, {
          render: "Sending transaction...",
          type: "info",
          isLoading: true,
          theme: "dark",
          icon: "⏳",
        });
        const txHash = await txResponse.wait();
        console.log("txHash", txHash);
        setIsLoading(false);
        getSmartAccountBalance();
        setTokenOneAmount(null);
        setTokenTwoAmount(null);

        toast.update(id, {
          render: "Transaction Successful ",
          type: "success",
          isLoading: false,
          icon: "👏",
          autoClose: 5000,
          hideProgressBar: false,
          pauseOnHover: true,
          progress: undefined,
          theme: "dark",
        });
        return;
      }
      //@ts-ignore
      // biconomy object creation
      const biconomy = new Biconomy(window.ethereum, {
        //@ts-ignore
        apiKey: apiList[`${activeChainId}`].meta_tx,
        debug: true,
        strictMode: true,
        contractAddresses: [tokenOne.address],
        // list of contract address you want to enable gasless on
      });

      // The first argument of the Biconomy class is an EIP 1193 type provider that has to be passed.
      // If there is a type mismatch you'll have to set the type of the provider as
      // External Provider
      /*       type ExternalProvider = {
        isMetaMask?: boolean;
        isStatus?: boolean;
        host?: string;
        path?: string;
        sendAsync?: (
          request: { method: string; params?: Array<any> },
          callback: (error: any, response: any) => void
        ) => void;
        send?: (
          request: { method: string; params?: Array<any> },
          callback: (error: any, response: any) => void
        ) => void;
        request?: (request: {
          method: string;
          params?: Array<any>;
        }) => Promise<any>;
      }; */

      await biconomy.init();
      // To create contract instances you can do:
      const contractInstance = new ethers.Contract(
        //@ts-ignore
        tokenOne.address,
        tokenOne.address == "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
          ? tokenABI.abi
          : tokenOne.isNonces
          ? tokenABI.abi3
          : tokenABI.abi2,
        //@ts-ignore
        biconomy.ethersProvider
      );
      let nonce;
      if (tokenOne.isNonces) {
        nonce = await contractInstance.nonces(address);
      } else {
        nonce = await contractInstance.getNonce(address);
      }

      let contractInterface = new ethers.utils.Interface(
        tokenOne.address == "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
          ? tokenABI.abi
          : tokenOne.isNonces
          ? tokenABI.abi3
          : tokenABI.abi2
      );

      let functionSignature = contractInterface.encodeFunctionData("transfer", [
        selectedAccount.smartAccountAddress,
        ethers.utils.parseUnits(tokenOneAmount, tokenOne.decimals).toString(),
      ]);

      let message;
      let dataToSign;
      const deadline: number = parseInt(
        (Date.now() / 1000 + 30 * 60).toFixed(0)
      );
      let signature;
      if (!tokenOne.isPermit) {
        message = {
          nonce: parseInt(nonce),
          //@ts-ignore
          from: ethers.utils.getAddress(address),
          functionSignature: functionSignature,
        };
        dataToSign = JSON.stringify({
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
          },
          domain: tokenOne.domainData,
          primaryType: "MetaTransaction",
          message: message,
        });

        signature = await provider?.signTypedData({
          //@ts-ignore
          account: ethers.utils.getAddress(address),
          //@ts-ignore
          domain: tokenOne.domainData,
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
          },
          message: message,
          primaryType: "MetaTransaction",
        });
        /* 
        signature = await provider.send("eth_signTypedData_v3", [
          //@ts-ignore
          ethers.utils.getAddress(address),
          dataToSign,
        ]); */
      } else {
        message = {
          // @ts-ignore
          owner: ethers.utils.getAddress(address),
          spender: selectedAccount.smartAccountAddress,
          value: ethers.utils
            .parseUnits(tokenOneAmount, tokenOne.decimals)
            .toString(),
          nonce: parseInt(nonce),
          deadline: deadline,
        };
        const Permit = [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ];
        dataToSign = JSON.stringify({
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            Permit: Permit,
          },
          domain: tokenOne.domainData,
          primaryType: "Permit",
          message: message,
        });

        signature = await provider?.signTypedData({
          //@ts-ignore
          account: ethers.utils.getAddress(address),
          //@ts-ignore
          domain: tokenOne.domainData,
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            Permit: Permit,
          },
          primaryType: "Permit",
          message: message,
        });

        /*         signature = await provider.send("eth_signTypedData_v4", [
          //@ts-ignore
          ethers.utils.getAddress(address),
          dataToSign,
        ]); */
      }

      /*       const DOMAIN_SEPARATOR =
        "0x" +
        eth_sig_utils.TypedDataUtils.hashStruct(
          "EIP712Domain",
          domainData,
          // @ts-ignore
          domainType,
          SignTypedDataVersion.V4
        ).toString("hex"); */

      /*       const META_TRANSACTION_TYPEHASH = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(
                  "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
                )
              ); */
      /*       const DOMAIN_SEPARATOR = ethers.utils.solidityKeccak256(
        ["bytes"],
        [
          ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "bytes32", "bytes32", "uint256", "address"],
            [
              ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(
                  "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                )
              ),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Revolt 2 Earn")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1")),
              137,
              tokenOne.address,
            ]
          ),
        ]
      );
      console.log("DOMAIN_SEPARTOR", DOMAIN_SEPARATOR); */

      const recovered = await recoverTypedSignature({
        data: JSON.parse(dataToSign),
        //@ts-ignore
        signature: signature,
        version: SignTypedDataVersion.V4,
      });

      console.log(
        "recovered",
        ethers.utils.getAddress(recovered),
        //@ts-ignore
        ethers.utils.getAddress(address) === ethers.utils.getAddress(recovered),
        //@ts-ignore
        ethers.utils.getAddress(address)
      );
      //@ts-ignore
      let { r, s, v } = getSignatureParameters(signature);
      /* 
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(dataToSign),
        signature
      );
      const signerCheck = recoveredAddress == address; // => true
      console.log("SIGNER CHECK: ", signerCheck, recoveredAddress, address); */
      let data;
      if (!tokenOne.isPermit) {
        data =
          await contractInstance.populateTransaction.executeMetaTransaction(
            //@ts-ignore
            ethers.utils.getAddress(address),
            functionSignature,
            r,
            s,
            v
          );
      } else {
        data = await contractInstance.populateTransaction.permit(
          //@ts-ignore
          ethers.utils.getAddress(address),
          selectedAccount.smartAccountAddress,
          ethers.utils.parseUnits(tokenOneAmount, tokenOne.decimals).toString(),
          deadline, // 3O MINUTES Deadline
          v,
          r,
          s
        );
      }

      let txParams = {
        data: data?.data,
        to: tokenOne.address,
        //@ts-ignore
        from: ethers.utils.getAddress(address),
        signatureType: "EIP712_SIGN",
      };

      const bicoProvider = await biconomy.provider;
      //@ts-ignore
      const tx1 = await bicoProvider.send("eth_sendTransaction", [txParams]);
      console.log("tx1", tx1);
      toast.update(id, {
        render: "Preparing Swap now ...",
        type: "info",
        isLoading: true,
        theme: "dark",
        icon: "⏳",
      });

      biconomy.on("txMined", async (data: any) => {
        console.log(data);
        await timeout(2000);
        const allowance = await axios.get(
          `https://api.1inch.io/v5.0/${activeChainId}/approve/allowance?tokenAddress=${tokenOne.address}&walletAddress=${selectedAccount?.smartAccountAddress}`
        );
        console.log(allowance);
        let smartAccount = wallet;
        const txs = [];
        const amount = tokenOne.tax
          ? ethers.utils
              .parseUnits(tokenOneAmount, tokenOne.decimals)
              .sub(
                ethers.utils
                  .parseUnits(tokenOneAmount, tokenOne.decimals)
                  .mul(ethers.BigNumber.from(tokenOne.tax))
                  .div(100)
              )
              .sub(1)
              .toString()
          : ethers.utils
              .parseUnits(tokenOneAmount, tokenOne.decimals)
              .sub(1)
              .toString();
        if (tokenOne.isPermit) {
          const data = contractInterface.encodeFunctionData("transferFrom", [
            //@ts-ignore
            ethers.utils.getAddress(address),
            selectedAccount.smartAccountAddress,
            ethers.utils
              .parseUnits(tokenOneAmount, tokenOne.decimals)
              .sub(1)
              .toString(),
          ]);
          const trxFrom = {
            to: tokenOne.address,
            data: data,
          };
          txs.push(trxFrom);
          /* 
          const transferFromTx = await smartAccount.sendTransaction({
            transaction: trxFrom,
          });
          await transferFromTx.wait(); */
        }

        if (
          tokenOne.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" &&
          ethers.BigNumber.from(allowance.data.allowance).lt(amount)
        ) {
          const approve = await axios.get(
            `https://api.1inch.io/v5.0/${activeChainId}/approve/transaction?tokenAddress=${tokenOne.address}&amount=${amount}`
          );

          const tx1 = {
            to: approve.data.to,
            data: approve.data.data,
          };
          txs.push(tx1);
          console.log("not approved");
        }
        const query =
          activeChainId != 137
            ? `https://api.1inch.io/v5.0/${activeChainId}/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${amount}&fromAddress=${selectedAccount.smartAccountAddress}&destReceiver=${address}&slippage=${slippage}&disableEstimate=true`
            : `https://api.1inch.io/v5.0/${activeChainId}/swap?fromTokenAddress=${tokenOne.address}&toTokenAddress=${tokenTwo.address}&amount=${amount}&fromAddress=${address}&slippage=${slippage}&disableEstimate=true`;

        const tx = await axios.get(query);

        console.log(tx.data);

        const tx2 = {
          to: tx.data.tx.to,
          data: tx.data.tx.data,
          value: tx.data.tx.value,
        };
        console.log(tx2);
        txs.push(tx2);
        if (activeChainId != 137) {
          smartAccount.on("txHashGenerated", (response: any) => {
            console.log("txMined event received via emitter", response);
            setIsLoading(false);
            getSmartAccountBalance();
            setTokenOneAmount(null);
            setTokenTwoAmount(null);
            toast.dismiss(id);
            toast("Transaction Successful", {
              type: "success",
              position: "bottom-left",
              autoClose: 5000,
              isLoading: false,
              icon: "👏",
              hideProgressBar: false,
              pauseOnHover: true,
              progress: undefined,
              theme: "dark",
            });
          });
        }
        console.log(smartAccount.getConfig().activeNetworkId);
        const txResponse = await smartAccount.sendTransactionBatch({
          transactions: txs,
        });
        console.log('this is txn response ', txResponse);

        toast.update(id, {
          render: "Sending transaction...",
          type: "info",
          isLoading: true,
          theme: "dark",
          icon: "⏳",
        });
        if (activeChainId == 137) {

          // hash property of txnResponse contains UserOpHash when using with standard bundlers
          const userOpHash = txResponse.hash;

          // wait untill userOp succeeds
          const isTransactionSuccessful = await isUserOpSucceed(userOpHash); 
          console.log('UserOp success response', isTransactionSuccessful);

          setIsLoading(false);
          getSmartAccountBalance();
          setTokenOneAmount(null);
          setTokenTwoAmount(null);

          toast.update(id, {
            render: "Transaction Successful ",
            type: "success",
            isLoading: false,
            icon: "👏",
            autoClose: 5000,
            hideProgressBar: false,
            pauseOnHover: true,
            progress: undefined,
            theme: "dark",
          });
        }
      });
    } catch (e: any) {
      console.log(e);
      setIsLoading(false);
      toast.update(id, {
        render: "Transaction Failed" + e.message,
        theme: "dark",
        type: "error",
        isLoading: false,
        icon: "❌",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }