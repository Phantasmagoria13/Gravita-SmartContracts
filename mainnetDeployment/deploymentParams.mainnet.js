const targetNetwork = "mainnet";

const externalAddrs = {
  CHAINLINK_ETHUSD_PROXY: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
  CHAINLINK_BTCUSD_PROXY: "0x6ce185860a4963106506C203335A2910413708e9",
  CHAINLINK_OHM_PROXY: "0x761aaeBf021F19F198D325D7979965D0c7C9e53b",
  CHAINLINK_OHM_INDEX_PROXY: "0x48C4721354A3B29D80EF03C65E6644A37338a0B1",
  CHAINLINK_FLAG_HEALTH: "0x3C14e07Edd0dC67442FA96f1Ec6999c57E810a83",

  WETH_ERC20: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  RETH_ERC20: "",
  STETH_ERC20: "",
}

const WETHParameters = {
  MCR: "1750000000000000000",
  CCR: "2200000000000000000",
  PERCENT_DIVISOR: 33,
  BORROWING_FEE_FLOOR: 125
}


const gravitaAddresses = {
  ADMIN_WALLET: "0x4A4651B31d747D1DdbDDADCF1b1E24a5f6dcc7b0",
  TREASURY_WALLET: "0x2e7108e381e9acab03aa1b4819aacb50d2964532", // to be passed to GRVTToken as the GRVT multisig address
  DEPLOYER_WALLET: "0x87209dc4B76b14B67BC5E5e5c0737E7d002a219c" // Mainnet REAL deployment address
}

// Beneficiaries for lockup contracts. 
const beneficiaries = {
  //CORE TEAM
  "0x56b421C0aAcA80be6447B7C330222C5A1CE27D4f": 2_100_000,
  "0x1e0573136e42F7896870dB0f2bBE76e24852915b": 2_100_000,
  "0xaE87d7c9637CF723d0D52a49Bfa024eC98c17657": 2_100_000,

  //ANGELS
  "0x9c5083dd4838e120dbeac44c052179692aa5dac5": 1_000_000,
  "0x238eDaB57c91D1DB2f05FE85295B5F32d355567c": 600_000,
  "0x50664edE715e131F584D3E7EaAbd7818Bb20A068": 400_000,
  "0x73fF7a576e99c94a5BA3647ddfBacB5E27DDee8c": 200_000,
  "0x84740F97Aea62C5dC36756DFD9F749412534220E": 200_000,
  "0xd1BB2B2871730BC8EF4D86764148C8975b22ce1E": 40_000,
  "0xd193806c88661b72b74fc9295049ca523b17d791": 40_000,
  "0x5Ce7D83f7Aaac17a0Ad40540B37fC7a0b688FF44": 40_000,
  "0x5E12035d7B1EF1eBf0747c2967C3FB15c5A1102b": 40_000,
  "0x1bdeB77243DF30a65eF3b455E78E24dEbb8cd4b5": 40_000,
  "0xF8F21FfaC3136302af863455864B754c690a4A87": 40_000,
  "0xC45d45b54045074Ed12d1Fe127f714f8aCE46f8c": 40_000,
  "0x0c5a2c72c009252f0e7312f5a1ab87de02be6fbe": 280_000,
  "0xd7d9b4f521640cfefb4279ebca256ae8cdf97e55": 200_000,
  "0x8355248d7a9eb953e9e8e65efdf6b7d3e118eb59": 200_000,
  "0xdec0b52b61465fbe2116e2b997d6fe79bb344990": 40_000,
  "0x1202fBA35cc425c07202BAA4b17fA9a37D2dBeBb": 40_000,
  "0x6D3A2D0beA5a89a2F047473875497e414Ce11382": 40_000,
  "0x72A916702BD97923E55D78ea5A3F413dEC7F7F85": 80_000,
  "0xCa4556244c602b7aF051784c7e83b2070600F88E": 80_000,
  "0x9002F6a9882cB922128a3b34FB56BDc5FdB00163": 120_000,
  "0x7417cc585602d8e225b26e395a1efe40ec4a74a9": 120_000,
  "0xd93ca8a20fe736c1a258134840b47526686d7307": 100_000,
  "0x9de9fBc5DFa267610e7d8ba137FB4fe18cE39900": 100_000,
  "0x6af4a7b0cd9ff7ec82d15d4d662be5a874fa7a48": 100_000,
  "0x5015370cbacbbc97a13239e04dd23b4b0925ec63": 100_000,
  "0xd177031ea95177ebdbb3bfdcebf9bd09d08462fc": 80_000,
  "0xf0d66807004b4080e02026b50da1d3b214d2b4b6": 80_000,
  "0x75d4bdbf6593ed463e9625694272a0ff9a6d346f": 40_000,
  "0x57524e25EC15DdF60D1812062ac56f56610626dB": 40_000,
  "0x3cdfd2e8bc356054646cb2c91046c98be1a8ed61": 40_000,
  "0x5fc4684985c72fc9040b046bc3e2ef0e40992674": 100_000,
  "0x5f350bf5fee8e254d6077f8661e9c7b83a30364e": 40_000,
  "0x28391d08338847aa636d0cef50418ebad740a3de": 40_000,
  "0x2c55B7F6a84Df4d1Ce2D954b741B81568Aeb0552": 40_000,
  "0xcafaba406f29c584abdfea1d6338cbd1c4b6cc34": 40_000,
  "0x4cde7b68b9edac0a630259cd6b2712a18493286f": 40_000,
  "0x534105565F9E7fB227D5F2A9aDb9755eb49bFCC4": 40_000,
  "0xa5595fB3b9E2caE9075D61c5a1c5A6F5A862A1B1": 40_000,
  "0x6067e32439c70f9549ccb31fa858598b54c48899": 40_000,
  "0x191b6dcC45beBA5A4eF4F801c456048437f62e7f": 20_000,
  "0xEA44Fa9aBed34d2768Dc3FD0305c25bC8bb2CAA9": 20_000,
  "0x8f7f78a5e8834A3eCf798A72DfF6923318105C6B": 20_000,
  "0x78915ceb50028538e57d83f3b7d7064bf57b191f": 40_000,
  "0x7fCAf93cc92d51c490FFF701fb2C6197497a80db": 100_000,
  "0xbFeE463b73A6eCd009DF216fe5920f5Af678807B": 160_000
}


const REDEMPTION_SAFETY = 14;
const DEPLOY_GRVT_CONTRACTS = false;

const OUTPUT_FILE = './mainnetDeployment/mainnetDeploymentOutput.json'

const delay = ms => new Promise(res => setTimeout(res, ms));
const waitFunction = async () => {
  return delay(90000) // wait 90s
}

const GAS_PRICE = 25000000000
const TX_CONFIRMATIONS = 3 // for mainnet

const ETHERSCAN_BASE_URL = 'https://arbiscan.io/address'

module.exports = {
  externalAddrs,
  gravitaAddresses,
  beneficiaries,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
  ETHERSCAN_BASE_URL,
  REDEMPTION_SAFETY,
  DEPLOY_GRVT_CONTRACTS,
  WETHParameters: WETHParameters,
  targetNetwork
};
