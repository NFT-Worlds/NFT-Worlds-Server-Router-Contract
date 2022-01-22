// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract TEST_Mock_NFT_Worlds_Token {
  address mockAddress;

  constructor(address _mockAddress) {
    mockAddress = _mockAddress;
  }

  function ownerOf(uint256 tokenId) public view virtual returns (address) {
    return mockAddress;
  }
}
