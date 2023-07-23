const Context = {
  NFT: "nft",
  SWAP: "swap",
  TRANSFER: "transfer",
  BRIDGE: "bridging",
};

const nftContext = {
  context: Context.NFT,
  corpus: [
    "NFT",
    "Non-fungible-Token",
    "Crypto-Collectible",
    "Digital-Asset",
    "ERC-721",
    "ERC-1155",
    "Digital Ownership",
    "Crypto Art",
    "Metadata",
    "Ownership Rights",
    "Digital Marketplace",
    "Digital Scarcity",
    "Community",
    "art",
    "rare",
    "ownership",
    "opensea",
    "rarrible",
    "looksrare",
  ],
};

const swapContext = {
  context: Context.SWAP,
  corpus: [
    "swap",
    "exchange",
    "trade",
    "token-swap",
    "token-exchange",
    "atomic swap",
    "liquidity",
    "liquidity pool",
    "pool",
    "slippage",
    "routing",
    "DEX",
    "AMM",
    "automated market maker",
    "marketplace",
    "order book",
    "liquidity provider",
    "pair",
    "trade pair",
    "price impact",
    "trade execution",
    "front-running",
    "uniswap",
    "1inch",
    "paraswap",
    "quickswap",
    "sushiswap",
    "balancor",
  ],
};

const bridgingContext = {
  context: Context.BRIDGE,
  corpus: [
    "bridge",
    "cross-chain",
    "interoperability",
    "token bridge",
    "cross-border",
    "cross-platform",
    "blockchain bridge",
    "pegged",
    "wrapped",
    "cross-network",
    "lock",
    "unlock",
    "transfer",
    "chainlink",
    "oracle",
    "multichain",
    "cross-asset",
    "decentralized bridge",
    "bridge contract",
    "axelar",
    "connext",
    "wormhole",
    "ronin",
    "multichain",
  ],
};

const transferContext = {
  context: Context.TRANSFER,
  corpus: [
    "transfer",
    "send",
    "transaction",
    "payment",
    "transaction hash",
    "receiver",
    "sender",
    "wallet",
    "address",
    "amount",
    "balance",
    "confirmations",
    "gas",
    "fee",
    "block",
    "confirm",
    "blockchain",
    "confirmation time",
    "peer-to-peer",
    "cryptocurrency",
    "token",
    "crypto",
    "on-chain",
  ],
};

const ONE_WORD_ANS = "please answer in 1 word";
const INFO_NOT_AVALAIBLE = "if you think this information is not avalaible in the statement please ans with -";

/**
 * What need
 * 1. NFT name
 * 2. NFT contract address
 * 3. User balance
 * 4. NFT action (buy / sell)
 * 5. TokenId of the NFT the user wants to buy
 * Incase we don't have all these information we will prompt user that about incomplete prompt
 */

const nftInfoExtracter = [
  {
    id: 1,
    question: `The given statement talks about which NFT ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`,
  },
  {
    id: 2,
    question: `About which operation does the given statement talks about buy or sell if it is buying return answer as "buy" or if it is about selling return answer as "sell" ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`,
  },
  {
    id: 3,
    question: `What is the tokenid of NFT user want's to buy ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`,
  },
  {
    id: 4,
    question: `What is the ethereum address of user in case if the statement says to transfer NFT to someone ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`
  }
];

const swapInfoExtractor = [
  {
    id: 1,
    question: `The given statement talks which tokens to swap. Please answer it in the form of array of strings please only include the token name into the array also ${INFO_NOT_AVALAIBLE}`,
  },
  {
    id: 2,
    question: `From the given statement how much token user want to swap ${ONE_WORD_ANS} also also ${INFO_NOT_AVALAIBLE}`,
  },
];

const supportedTokenSwap = [
  {
    pair: ['USDC', 'USDT'],
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  {
    pair: ['MATIC', 'USDC'],
    'MATIC': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  {
    pair: ['MATIC', 'USDT'],
    'MATIC': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  }
]

const supportedTokenSwapGnosis = [
  {
    pair: ['XDAI', 'USDC'],
    'XDAI': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'USDC': '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
  },
  {
    pair: ['XDAI', 'USDT'],
    'XDAI': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'USDT': '0x4ECaBa5870353805a9F068101A40E0f32ed605C6'
  }
];

const supportedNFTs = [
    {
        name: 'BAYC',
        address: '0x9C5cbC32aE78Af01b20eC3db51b68E9957ff50cf'
    }
]

const supportTokenSend = [
    {
        name: "USDC",
        address: '0x38f1268012bb69776f7026B584BC5BD833265790'
    },
    {
        name: "USDT",
        address: '0x12098e85e9c28Aa034de6dCEeBAAF0bf22670b46'
    }
]

const sendTokenInfoExtractor = [
    {
        id: 1,
        question: `In the given statement which token users wants to send ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`,
    },
    {
        id: 2,
        question: `In the given statement how many tokens the user wants to send ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`
    },
    {
        id: 3,
        question: `In the given statement to which ethereum address user wants to send token ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`
    }
];

// for now in bridging only Wmatic is supported
const supportedTokenToStake = [
  {
    name: 'WMATIC',
    address: '0xB923E2374639D0605388D91CFedAfCeCE03Cfd8f'
  }
]

const bridgeInfoExtractor = [
  {
    id: 1,
    question: `In the given statements how many tokens (amount) the users want to stake. ${ONE_WORD_ANS} also ${INFO_NOT_AVALAIBLE}`
  }
]


// for now we would whitelist all the NFT related information
module.exports = {
  nftContext,
  bridgingContext,
  swapContext,
  transferContext,
  nftInfoExtracter,
  swapInfoExtractor,
  supportedNFTs,
  supportedTokenSwap,
  supportTokenSend,
  sendTokenInfoExtractor,
  supportedTokenToStake,
  bridgeInfoExtractor,
  supportedTokenSwapGnosis
};
