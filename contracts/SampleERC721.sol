// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SampleERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(address[] memory addresses) ERC721("SampleERC721", "SERC") {
        for (uint256 i = 0; i < addresses.length; i++) {
            for (uint256 j = 0; j < addresses.length; j++) {
                _tokenIds.increment();

                uint256 newItemId = _tokenIds.current();
                _mint(addresses[i], newItemId);
            }
        }
    }
}