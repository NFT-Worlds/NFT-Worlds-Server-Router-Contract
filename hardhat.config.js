/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('hardhat-abi-exporter');
require('hardhat-contract-sizer');
require('@nomiclabs/hardhat-etherscan');

module.exports = {
  solidity: {
    version: '0.8.2',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    /*mainnet: {
      url: process.env.ETHEREUM_MAINNET_URL,
    },
    goerli: {
      url: process.env.ETHEREUM_GOERLI_URL,*/
    // use direct deploy script instead of hardhat deploy
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 50, // GWEI
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: true,
    only: [ ':WRLD_Forwarder_Polygon$', ':WRLD_Token_Ethereum$', ':WRLD_Token_Polygon$' ],
    pretty: false,
  },
/*  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY, /*{
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },*/
  mocha: {
    timeout: 60 * 60 * 1000,
  },
};
