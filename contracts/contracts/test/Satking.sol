pragma solidity ^0.8.12;

contract Staking {
    uint stakedAmount = 0;

    function stake() external payable {
        stakedAmount = stakedAmount + msg.value;
    }

    function returnStake() external {
        payable(0x48701dF467Ba0efC8D8f34B2686Dc3b0A0b1cab5).transfer(stakedAmount);
    }

    receive() external payable {}
}
