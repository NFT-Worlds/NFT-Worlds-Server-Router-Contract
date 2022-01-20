// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * The NFT Worlds Server Router contract provides
 * a decentralized layer to set a JSON blob stored
 * on IPFS that conforms to the NFT Worlds routing
 * standards.
 *
 * This provides a decentralized way for
 * NFT World server connection details and other
 * relevant world information to be set, queried
 * and distributed.
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT_Worlds_Server_Router is Ownable {
  address private nftWorldsContract;

  address public worldRentalManager;
  string public convenienceGateway;
  uint[] public worlds;

  mapping(uint => string) public routingDataIPFSHash;

  constructor(address _nftWorldsContract, address _worldRentalManager, string memory _convenienceGateway) {
    nftWorldsContract = _nftWorldsContract;
    worldRentalManager = _worldRentalManager;
    convenienceGateway = _convenienceGateway;
  }

  function getRoutingDataURI(uint _worldTokenId, bool includeGateway) external view returns (string memory) {
    if (includeGateway) {
      return string(abi.encodePacked(convenienceGateway, routingDataIPFSHash[_worldTokenId]));
    }

    return string(abi.encodePacked("ipfs://", routingDataIPFSHash[_worldTokenId]));
  }

  function setRoutingDataIPFSHash(uint _worldTokenId, string calldata _ipfsHash) onlyWorldController(_worldTokenId) external {
    require(bytes(_ipfsHash).length == 40, "Invalid IPFS Hash");

    routingDataIPFSHash[_worldTokenId] = _ipfsHash;
  }

  function removeRoutingDataIPFSHash(uint _worldTokenId) onlyWorldController(_worldTokenId) external {

    routingDataIPFSHash[_worldTokenId] = "";
  }

  function updateWorldRentalManager(address _worldRentalManager) external onlyOwner {
    worldRentalManager = _worldRentalManager;
  }

  function updateConvenienceGateway(string calldata _convenienceGateway) external onlyOwner {
    convenienceGateway = _convenienceGateway;
  }

  /**
   * Modifiers
   */

  modifier onlyWorldController(_worldTokenId) {
    if (msg.sender != worldRentalManager) {
      require(true/*TODO*/, "Sender is not world controller.");
    }

    _;
  }
}
