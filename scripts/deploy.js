require('dotenv').config();

const { ethers } = require('hardhat');

const IS_PRODUCTION = true;
const NFT_WORLDS_ERC721_ADDRESS = '0xBD4455dA5929D5639EE098ABFaa3241e9ae111Af';
const IPFS_GATEWAY = 'https://routing.nftworlds.com/ipfs/';

async function main() {
  const {
    ETHEREUM_GOERLI_WEBSOCKET_URL,
    ETHEREUM_GOERLI_ACCOUNT,
    ETHEREUM_MAINNET_WEBSOCKET_URL,
    ETHEREUM_MAINNET_ACCOUNT,
  } = process.env;

  const { Wallet } = ethers;
  const { WebSocketProvider } = ethers.providers;

  const ethereumProvider = (IS_PRODUCTION)
    ? new WebSocketProvider(ETHEREUM_MAINNET_WEBSOCKET_URL)
    : new WebSocketProvider(ETHEREUM_GOERLI_WEBSOCKET_URL);

  const ethereumWallet = (IS_PRODUCTION)
    ? new Wallet(`0x${ETHEREUM_MAINNET_ACCOUNT}`, ethereumProvider)
    : new Wallet(`0x${ETHEREUM_GOERLI_ACCOUNT}`, ethereumProvider);

  const NFTWorldsServerRouterFactory = await ethers.getContractFactory('NFT_Worlds_Server_Router', ethereumWallet);

  // Deploy Ethereum
  const worldRouterContract = await NFTWorldsServerRouterFactory.deploy(
    NFT_WORLDS_ERC721_ADDRESS,
    IPFS_GATEWAY,
  );

  console.log('Ethereum WRLD Deploy TX Hash', worldRouterContract.deployTransaction.hash);
  await worldRouterContract.deployed();

  console.log('Ethereum WRLD Address:', worldRouterContract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit();
  });
