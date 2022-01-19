const { ethers } = require('hardhat');

describe('NFT Worlds Server Router', () => {
  let contract;
  let owner;
  let otherAddresses;

  beforeEach(async () => {
    const [ _owner, ..._otherAddresses ] = await ethers.getSigners();
    const NFTWorldsServerRouterFactory = await ethers.getContractFactory('NFT_Worlds_Server_Router');

    owner = _owner;
    otherAddresses = _otherAddresses;

    contract = await NFTWorldsServerRouterFactory.deploy();
  });

  it('Should deploy', async () => {
    await contract.deployed();
  });
});
