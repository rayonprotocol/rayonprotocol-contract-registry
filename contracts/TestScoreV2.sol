pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";

contract TestScoreV2 is RayonBase {
    constructor() RayonBase("TestScore", 2) public {}

    uint256 internal score;

    function hitScore() public {
        score += 20;
    }

    function getScore() public view returns (uint256){
        return score;
    }
}