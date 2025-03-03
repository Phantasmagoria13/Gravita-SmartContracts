const targetNetwork = "goerli"
const DEPLOY_GRVT_CONTRACTS = false
const OUTPUT_FILE = "./mainnetDeployment/goerliDeploymentOutput.json"
const GAS_PRICE = 20_000_000_000 // 20 Gwei
const TX_CONFIRMATIONS = 1
const ETHERSCAN_BASE_URL = "https://goerli.etherscan.io/address"

const externalAddrs = {
	// --- Collateral ---
	// CBETH_ERC20: "0xE0a45669496A4753c65d5832b49D087F712d7fef", // PLUTO mock token
	// RETH_ERC20: "0xebEfF29547F501Daf5E3dA4917c79b427B499C88", // MOON mock token
	RETH_ERC20: "0x178E141a0E3b34152f73Ff610437A7bf9B83267A", // Goerli RETH token
	WETH_ERC20: "0x2df77eE5a6FcF23F666650ed53bE071E7288eCb6", // STAR mock token
	WSTETH_ERC20: "0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f", // wstETH on Goerli
	// WSTETH_ERC20: "0x40cb9640581298c748C2181f7A36f60B55BF9132", // MARS mock token
	// --- Price Feed Aggregators ---
	// CHAINLINK_CBETH_USD_ORACLE: "0x9A104C235C4604a5f0dBB06B5A491d728a8809e9", // mock aggregator 1
	CHAINLINK_RETH_USD_ORACLE: "0xbC204BDA3420D15AD526ec3B9dFaE88aBF267Aa9", // mock aggregator 2
	CHAINLINK_WETH_USD_ORACLE: "0xC526a88daEEa6685E4D46C99512bEB0c85a8b1c7", // mock aggregator 3
	CHAINLINK_WSTETH_USD_ORACLE: "0x045DA0FB992a3a6354f48E1Ae271eE937678baC8", // mock aggregator 4
}

const gravitaAddresses = {
	ADMIN_WALLET: "0x19596e1D6cd97916514B5DBaA4730781eFE49975",
	TREASURY_WALLET: "0x19596e1D6cd97916514B5DBaA4730781eFE49975",
	DEPLOYER_WALLET: "0x19596e1D6cd97916514B5DBaA4730781eFE49975",
}

const beneficiaries = {
	// CORE TEAM
	"0x19596e1D6cd97916514B5DBaA4730781eFE49975": 2_100_000,
	"0x1e0573136e42F7896870dB0f2bBE76e24852915b": 2_100_000,
	"0xaE87d7c9637CF723d0D52a49Bfa024eC98c17657": 2_100_000,
	"0x87209dc4B76b14B67BC5E5e5c0737E7d002a219c": 210_000,
	// ANGELS
	"0x9c5083dd4838e120dbeac44c052179692aa5dac5": 1_000_000,
	"0x238eDaB57c91D1DB2f05FE85295B5F32d355567c": 600_000,
	"0x50664edE715e131F584D3E7EaAbd7818Bb20A068": 400_000,
	"0x73fF7a576e99c94a5BA3647ddfBacB5E27DDee8c": 200_000,
}

module.exports = {
	externalAddrs,
	gravitaAddresses,
	beneficiaries,
	OUTPUT_FILE,
	GAS_PRICE,
	TX_CONFIRMATIONS,
	ETHERSCAN_BASE_URL,
	targetNetwork,
	DEPLOY_GRVT_CONTRACTS,
}

