pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";

contract TestScoreV3 is RayonBase {
    constructor() RayonBase("TestScoreV3", 3) public {}

    uint256 internal score;

    function hitScore() public {
        score += 30;
    }

    function getScore() public view returns (uint256){
        return score;
    }
}