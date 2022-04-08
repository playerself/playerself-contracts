# Playerself Smart Contracts

This repository contains the currently used Playerself Smart Contracts, soon audited by Certik.

The project itself it's an **Hardhat** project, so it supports the ```npx hardhat``` commands.

## ❓ How to use

Simply clone the repository, run `npm install` and then the following commands:

```bash
npx hardhat compile && npx hardhat test
```

The first command compiles the contract and generates the ABIs under the newly created `artifacts/` folder; the second one runs the test suite written in the `test/test.js` file.

## 📖 Smart Contracts

### Interfaces

#### IPlayerselfRegistry

Contains the interface used by the **PlayerselfAuction** contract to call the **PlayerselfRegistry**.

```solidity
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
```

The `NFT` struct has two fields:
- `bool enabled`: if the NFT is enabled or not;
- `bool supportsBatch`: if the NFT collection supports batch transfers (aka it's an ERC1155 or an ERC721).

The methods are explained in the implementation contract.

### Implementations

#### Playerself

The simplest implementation of the 3: it's a basic `ERC1155Pausable` contract (it's not final yet if it will be pausable or not). The `mint` and `mintBatch` methods can only be called by whoever the `_owner` of the contract has given the `MINTER_ROLE`; only the `_owner` can toggle this role.

#### PlayerselfRegistry

*⚠️ Work in progress ⚠️*

#### PlayerselfAuction

*⚠️ Work in progress ⚠️*