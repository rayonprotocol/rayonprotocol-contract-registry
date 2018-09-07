pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";

contract TestContract1 is RayonBase {
    constructor(uint16 version) RayonBase("TestContract1", version) public {}
}