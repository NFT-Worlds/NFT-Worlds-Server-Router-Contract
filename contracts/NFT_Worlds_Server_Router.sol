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

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract NFT_Worlds_Server_Router is AccessControl {
  using EnumerableSet for EnumerableSet.UintSet;

  event WorldRoutingDataUpdated(uint256 worldTokenId);
  event WorldRoutingDataRemoved(uint256 worldTokenId);

  IERC721 immutable NFTW_ERC721;
  string private convenienceGateway;
  EnumerableSet.UintSet private routedWorldsSet;
  mapping(uint => string) private worldRoutingIPFSHash;
  bytes32 private constant OWNER_ROLE = keccak256("OWNER_ROLE");
  bytes32 private constant RENTAL_MANAGER_ROLE = keccak256("RENTAL_MANAGER_ROLE");

  constructor(address _nftWorldsErc721, address _worldRentalManager, string memory _convenienceGateway) {
    require(_nftWorldsErc721 != address(0), "Addr 0");
    require(_worldRentalManager != address(0), "Addr 0");
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(OWNER_ROLE, msg.sender);
    _setupRole(RENTAL_MANAGER_ROLE, _worldRentalManager);
    convenienceGateway = _convenienceGateway;
    NFTW_ERC721 = IERC721(_nftWorldsErc721);
  }

  function getRoutingDataURI(uint _worldTokenId, bool includeGateway) public view returns (string memory) {
    require(bytes(worldRoutingIPFSHash[_worldTokenId]).length > 0, "No routing data");

    if (includeGateway) {
      return string(abi.encodePacked(convenienceGateway, worldRoutingIPFSHash[_worldTokenId]));
    }

    return string(abi.encodePacked("ipfs://", worldRoutingIPFSHash[_worldTokenId]));
  }

  function getAllRoutingDataURIs(bool includeGateway) external view returns (string[] memory) {
    uint totalRoutedWorlds = routedWorldsSet.length();
    string[] memory routingDataURIs = new string[](totalRoutedWorlds);

    for (uint i = 0; i < totalRoutedWorlds; i++) {
      routingDataURIs[i] = getRoutingDataURI(routedWorldsSet.at(i), includeGateway);
    }

    return routingDataURIs;
  }

  function setRoutingDataIPFSHash(uint _worldTokenId, string calldata _ipfsHash) onlyWorldController(_worldTokenId) external {
    require(bytes(_ipfsHash).length == 40, "Invalid IPFS hash");

    routedWorldsSet.add(_worldTokenId);
    worldRoutingIPFSHash[_worldTokenId] = _ipfsHash;

    emit WorldRoutingDataUpdated(_worldTokenId);
  }

  function removeRoutingDataIPFSHash(uint _worldTokenId) onlyWorldController(_worldTokenId) external {
    worldRoutingIPFSHash[_worldTokenId] = "";
    routedWorldsSet.remove(_worldTokenId);

    emit WorldRoutingDataRemoved(_worldTokenId);
  }

  function updateConvenienceGateway(string calldata _convenienceGateway) external onlyRole(OWNER_ROLE) {
    convenienceGateway = _convenienceGateway;
  }

  /**
   * Modifiers
   */

  modifier onlyWorldController(uint _worldTokenId) {
    if (!hasRole(RENTAL_MANAGER_ROLE, msg.sender)) {
      require(NFTW_ERC721.ownerOf(_worldTokenId) == msg.sender, "Not world owner");
    }

    _;
  }
}
