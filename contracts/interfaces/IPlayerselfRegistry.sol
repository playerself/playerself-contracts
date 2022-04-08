// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IPlayerselfRegistry {

    struct NFT {
        bool enabled;
        bool supportsBatch;
    }

    function isSupported(address addr) external view returns(bool);
    function getNFT(address addr) external view returns (NFT memory);

}