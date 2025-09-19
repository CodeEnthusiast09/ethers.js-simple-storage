// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "./simple-storage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStorageArray;

    function createSimpleStorageContract() public {
        SimpleStorage simpleStorage = new SimpleStorage();
        simpleStorageArray.push(simpleStorage);
    }

    function storageFactoryStore(
        uint256 _simpleStorageIndex,
        uint256 _simpleStorageNumber
    ) public {
        simpleStorageArray[_simpleStorageIndex].store(_simpleStorageNumber);
    }

    function storageFactoryGet(
        uint256 _simpleStorageIndex
    ) public view returns (uint256) {
        
        return simpleStorageArray[_simpleStorageIndex].retrieve();
    }
}
