const { expect } = require('chai');
const { ethers } = require('hardhat');

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

describe('NFT Worlds Server Router', () => {
  let contract;
  let owner;
  let rentalManager;
  let mockTokenOwner;
  let otherAddresses;

  beforeEach(async () => {
    const [ _owner, _rentalManager, _mockTokenOwner, ..._otherAddresses ] = await ethers.getSigners();
    const TESTMockNFTWorldsTokenFactory = await ethers.getContractFactory('TEST_Mock_NFT_Worlds_Token');
    const NFTWorldsServerRouterFactory = await ethers.getContractFactory('NFT_Worlds_Server_Router');

    owner = _owner;
    rentalManager = _rentalManager;
    mockTokenOwner = _mockTokenOwner;
    otherAddresses = _otherAddresses;

    const mockTokenContract = await TESTMockNFTWorldsTokenFactory.deploy(mockTokenOwner.address);

    contract = await NFTWorldsServerRouterFactory.deploy(
      mockTokenContract.address,
      rentalManager.address,
      IPFS_GATEWAY,
    );
  });

  it('Should deploy', async () => {
    await contract.deployed();
  });

  it('Should set routing data ipfs hash for world owner by sender', async () => {
    await contract.deployed();

    const tokenId = 123;
    const ipfsHash = generateRandomIPFSHash();

    await contract.connect(mockTokenOwner).setRoutingDataIPFSHash(tokenId, ipfsHash);

    expect(await contract.getRoutingDataURI(tokenId, false)).to.equal(`ipfs://${ipfsHash}`);
    expect(await contract.getRoutingDataURI(tokenId, true)).to.equal(`${IPFS_GATEWAY}${ipfsHash}`);
  });

  it('Should set routing data ipfs hash when sender is rental manager', async () => {
    await contract.deployed();

    const tokenId = 345;
    const ipfsHash = generateRandomIPFSHash();

    await contract.connect(rentalManager).setRoutingDataIPFSHash(tokenId, ipfsHash);

    expect(await contract.getRoutingDataURI(tokenId, false)).to.equal(`ipfs://${ipfsHash}`);
    expect(await contract.getRoutingDataURI(tokenId, true)).to.equal(`${IPFS_GATEWAY}${ipfsHash}`);
  });

  it('Should get all routing data URIs', async () => {
    await contract.deployed();

    const updates = [
      [ 1, generateRandomIPFSHash() ], [ 4, generateRandomIPFSHash() ],
      [ 53, generateRandomIPFSHash() ], [ 123, generateRandomIPFSHash() ],
      [ 533, generateRandomIPFSHash() ], [ 1123, generateRandomIPFSHash() ],
      [ 531, generateRandomIPFSHash() ], [ 662, generateRandomIPFSHash() ],
      [ 414, generateRandomIPFSHash() ],
    ];

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];

      await contract.connect(mockTokenOwner).setRoutingDataIPFSHash(update[0], update[1]);
    }

    const hashes = await contract.getAllRoutingDataURIs(false);
    const gatewayHashes = await contract.getAllRoutingDataURIs(true);

    expect(hashes.length).to.equal(gatewayHashes.length);

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];

      expect(hash).to.be.a('string');
      expect(hash.length).to.be.at.least(46);
    }
  });

  it('Should remove routing data ipfs hashes', async () => {
    await contract.deployed();

    const tokenId = 241;
    const ipfsHash = generateRandomIPFSHash();

    await contract.connect(mockTokenOwner).setRoutingDataIPFSHash(tokenId, ipfsHash);

    expect(await contract.getRoutingDataURI(tokenId, false)).to.equal(`ipfs://${ipfsHash}`);

    await contract.connect(mockTokenOwner).removeRoutingDataIPFSHash(tokenId);

    await expect(contract.getRoutingDataURI(tokenId, false)).to.be.reverted;
  });

  it('Should update convenience gateway', async () => {
    await contract.deployed();

    const gateway = 'https://api.nftworlds.com/';

    await contract.connect(owner).setConvenienceGateway(gateway);

    expect(await contract.convenienceGateway()).to.equal(gateway);
  });

  it('Fails when updating convenience gateway and not owner', async () => {
    await contract.deployed();

    await expect(contract.connect(mockTokenOwner).setConvenienceGateway('ipfs://')).to.be.reverted;
  });

  it('Fails when retrieving routing data uri for unset world', async () => {
    await contract.deployed();

    await expect(contract.getRoutingDataURI(5, false)).to.be.reverted;
  });

  it('Fails when setting ipfs hash with invalid hash length', async () => {
    await contract.deployed();

    await expect(contract.connect(mockTokenOwner).setRoutingDataIPFSHash(123, '123')).to.be.reverted;
  });

  it('Fails when setting ipfs hash and sender is not world controller', async () => {
    await contract.deployed();

    const tokenId = 123;
    const ipfsHash = generateRandomIPFSHash();

    await expect(contract.connect(otherAddresses[0]).setRoutingDataIPFSHash(tokenId, ipfsHash)).to.be.reverted;
  });

  it('Fails when removing ipfs hash and sender is not world controller', async () => {
    await contract.deployed();

    const tokenId = 345;
    const ipfsHash = generateRandomIPFSHash();

    await contract.connect(rentalManager).setRoutingDataIPFSHash(tokenId, ipfsHash);

    await expect(contract.removeRoutingDataIPFSHash(tokenId)).to.be.reverted;
  });
});

/*
 * Helpers
 */

function generateRandomIPFSHash() {
  // Declare all characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Pick characers randomly
  let str = '';

  for (let i = 0; i < 46; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
}
