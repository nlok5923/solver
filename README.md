# Bob the Solver

An implementation of Infrastructure for intent based transactions with Account abstraction

# Demo Video [here](https://youtu.be/lsfHYsocZjI)


# Contracts

```
    case Chains.celoTestnet: 
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0xeDba372c904298b79D421a70d9D448E822Bc697E",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };

    case Chains.mantleTestnet:
      return {
        Elliptic: "0x652D29F01fdF8d0c20F78f51bAc9B173B3a76a9B",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x9C0A83154846725446EF3907DaAb41951d2635A1",
        TouchIdSafeWalletContractSingletonAddress:
          "0x824Eae34D5bB73FE97969dc80f01c5baf0D3f8D6",
        fallBackHandlerAddress: "0x4314e106c276413814a01A1618B06c39161fc290",
      }
    case Chains.gnosis:
      return {
        Elliptic: "0xC29fDf5544312E23d9cDa9fB67388d040Fdbf434",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          // "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
          "0xDcA01E080a8984830f1f2292d5c723d38223563C",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
```

