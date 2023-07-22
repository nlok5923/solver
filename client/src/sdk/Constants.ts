import { ClientConfig } from "@account-abstraction/sdk";
import {
  ChainConfig,
  ChainSpecificConfig,
} from "./interfaces/Banana.interface";

export const BANANA_APP = "https://bananawallet.xyz";
// export const BANANA_APP = 'http://localhost:3001';
export const BANANA_SERVER = "https://banana-server.xyz";
// export const BANANA_SERVER = 'http://localhost:80';
export const OPTIMISM_TESTNET_RPC =
  "https://opt-goerli.g.alchemy.com/v2/Q37EPFzF1O8kJt4oTob4ytwuUFTW0Gas";
export const MUMBAI_RPC =
  "https://polygon-mumbai.g.alchemy.com/v2/cNkdRWeB8oylSQJSA2V3Xev2PYh5YGr4";
export const GOERLI_RPC =
  "https://eth-goerli.g.alchemy.com/v2/IaVkSX3wU98rK7vpVyFgIryaaHfYpoST";
export const GNOSIS_RPC = "https://rpc.gnosischain.com/";
export const CHIADO_TESTNET_RPC = "https://rpc.chiado.gnosis.gateway.fm";
export const SHIBUYA_TESTNET_RPC = "https://evm.shibuya.astar.network";
export const POLYGON_MAINNET_RPC = "https://polygon-mainnet.g.alchemy.com/v2/M6obmh9NhecgkyNlK0G00anwrpBnjzwA";
export const ASTAR_MAINNET_RPC = "https://astar.public.blastapi.io";
export const FUJI = 'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc';
export const CELO_TESTNET_RPC = 'https://alfajores-forno.celo-testnet.org';
export const MANTLE_TESTNET_RPC = 'https://rpc.testnet.mantle.xyz'
export const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const BUNDLER_EOA_PUBLIC_KEY =
  "0xFBd25f4F9de58B72F5e652B51625D3fCD761dec5"; 
export const BUNDLER_EOA_PRIVATE_KEY =
  "409816806d2f48f7cdd75d3e3804334ba1aab00e9aa6d039ffe2376200c9119d";
export const BENEFICIARY = "0xF9ca16Fb8D6F38d36505961dAd69d2011C4695cF";

export enum Chains {
  goerli = 5,
  mumbai = 80001,
  polygonMainnet = 137,
  optimismTestnet = 420,
  gnosis = 100,
  chiadoTestnet = 10200,
  shibuyaTestnet = 81,
  astar = 592,
  fuji = 43113,
  celoTestnet = 44787,
  mantleTestnet = 5001,
}

export function getClientConfigInfo(chain: Chains): ClientConfig {
  switch (chain) {
    case Chains.goerli:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl:
          "https://api.pimlico.io/v1/goerli/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445", // goerli bundler
      };
    case Chains.mumbai:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl:
          "https://api.pimlico.io/v1/mumbai/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445",
      };
    case Chains.optimismTestnet:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl:
          "https://api.pimlico.io/v1/optimism-goerli/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445", // optimism bundler
      };
    case Chains.gnosis:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl:
          "https://api.pimlico.io/v1/gnosis/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445",
      };
    case Chains.chiadoTestnet:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl:
          "https://api.pimlico.io/v1/chiado-testnet/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445",
      };
    case Chains.shibuyaTestnet:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl: SHIBUYA_TESTNET_RPC,
      };
    case Chains.polygonMainnet:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl: "https://api.pimlico.io/v1/polygon/rpc?apikey=1849c85d-46c8-4bee-8a6d-d6a0cba4d445",
      };
    case Chains.astar:
      return {
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        bundlerUrl: ASTAR_MAINNET_RPC
      };
    case Chains.fuji:
      return {
        entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        bundlerUrl: 'https://api.stackup.sh/v1/node/19849775238e4e502afa29a1d6c55aa3f0fbba5cf1933a901cd7963e3715baae'
      }
    case Chains.celoTestnet:
      return {
        entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        bundlerUrl: CELO_TESTNET_RPC
      }
    case Chains.mantleTestnet:
      return {
        entryPointAddress: '0x68078F35eedFf6A6a9521A323F3e45dfaba1C4CF',
        bundlerUrl: MANTLE_TESTNET_RPC
      }
  }
}

export function getChainSpecificAddress(chain: Chains): ChainConfig {
  switch (chain) {
    case Chains.goerli: //mi
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.fuji: //mi
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          // "0xeDba372c904298b79D421a70d9D448E822Bc697E",
          "0xDcA01E080a8984830f1f2292d5c723d38223563C",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.celoTestnet: //mi
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0xeDba372c904298b79D421a70d9D448E822Bc697E",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.optimismTestnet: // mi
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
        // "0xc4499d4709013a0189dB55aFcfA0f37c4BaE5bCd",
        // "0xC3BA94d2a314030a15c8070b57cd91fD53bd5611",
        // "0x4cf1c08470602F1D5c33516085640E5645AF889E",
        // "0x18E3a76b7B2BA375F916f640028b811aFACf4f15",
          // "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
          // "0x2C6565E11d3aA6944C12951Ed23e98827A0A7019",
          // "0x69bf6C757D211FAb03cf5669Abe8290bDC7d25F6",
          // "0xC5ea1f607F67a66885852eEd51a5d10A4a19DE49",
          // "0xb0c3F912540e703d5DB1681B5B7075c60a46F2d3",
          "0xDcA01E080a8984830f1f2292d5c723d38223563C",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.mumbai: // mi
      return {
        Elliptic: "0xEA4d16E741E76E7a93b8f46650537855149efc48",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          // "0xcd264d127fABE7363Ebc3f0b85f86626E1e74128",
          // "0x2C6565E11d3aA6944C12951Ed23e98827A0A7019",
          // "0xc4499d4709013a0189dB55aFcfA0f37c4BaE5bCd",
          // "0xC3BA94d2a314030a15c8070b57cd91fD53bd5611",
          // "0x4cf1c08470602F1D5c33516085640E5645AF889E",
          // "0x69bf6C757D211FAb03cf5669Abe8290bDC7d25F6",
          // "0xC5ea1f607F67a66885852eEd51a5d10A4a19DE49",
          // "0xb0c3F912540e703d5DB1681B5B7075c60a46F2d3",
          // "0xeDba372c904298b79D421a70d9D448E822Bc697E",
          "0xDcA01E080a8984830f1f2292d5c723d38223563C",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
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
    case Chains.chiadoTestnet:
      return {
        Elliptic: "0x200E1d8BC6d3F6ddB5a26bbbC5b839f2D5213407",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.shibuyaTestnet:
      return {
        Elliptic: "0x3f0dD0521518cd0c6833eD2622aDe9a813f7E56e",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
      };
    case Chains.polygonMainnet: 
      return {
        Elliptic: "0xd223a0D7cD198a5d448DeEdE81c63a3Ad4f244FC",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
        "0xDcA01E080a8984830f1f2292d5c723d38223563C",
          // "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
        fallBackHandlerAddress: "0xac1c08a5a59cEA20518f7201bB0dda29d9454eb0",
     };
    case Chains.astar:
    return {
        Elliptic: "0x652D29F01fdF8d0c20F78f51bAc9B173B3a76a9B",
        TouchIdSafeWalletContractProxyFactoryAddress:
          "0x8e5ffc77D0906618A8Ed73dB34f92Ea0251B327b",
        TouchIdSafeWalletContractSingletonAddress:
          "0x6f4D71B05140a1DD6D328e0C58216edD1590654e",
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
  }
}

// enabling multi network infra for arbitrum, mumbai, optimism
export function getChainSpecificConfig(chain: Chains): ChainSpecificConfig {
  switch (chain) {
    case Chains.goerli:
      return {
        jsonRpcUrl: GOERLI_RPC,
      };
    case Chains.optimismTestnet:
      return {
        jsonRpcUrl: OPTIMISM_TESTNET_RPC,
      };
    case Chains.mumbai:
      return {
        jsonRpcUrl: MUMBAI_RPC,
      };
    case Chains.gnosis:
      return {
        jsonRpcUrl: GNOSIS_RPC,
      };
    case Chains.chiadoTestnet:
      return {
        jsonRpcUrl: CHIADO_TESTNET_RPC,
      };
    case Chains.shibuyaTestnet:
      return {
        jsonRpcUrl: SHIBUYA_TESTNET_RPC,
      };
    case Chains.polygonMainnet:
      return {
        jsonRpcUrl: POLYGON_MAINNET_RPC
      };
    case Chains.astar:
      return {
        jsonRpcUrl: ASTAR_MAINNET_RPC,
      };
    case Chains.fuji:
      return {
        jsonRpcUrl: FUJI
      }
    case Chains.celoTestnet:
      return {
        jsonRpcUrl: CELO_TESTNET_RPC
      }
    case Chains.mantleTestnet:
      return {
        jsonRpcUrl: MANTLE_TESTNET_RPC
      }
  }
}
