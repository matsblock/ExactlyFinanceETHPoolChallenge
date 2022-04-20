// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ETHPool {
    receive() external payable {}

    address public owner;
    mapping(address => uint256) public BalanceOf;
    uint256 public totalUsersBalance;
    uint256 public totalRewardsBalance;

    struct depositRegistryStruct {
        uint256 depositTime;
        uint256 amount;
        uint256 totalBalanceAtThisTime;
        uint256 userBalanceAtThisTime;
    }
    mapping(address => depositRegistryStruct[]) public depositsUserRegistry;
    depositRegistryStruct[] public rewardsDepositsRegistry;
    mapping(address => uint256) public lastClaim;

    constructor() {
        owner = msg.sender;
    }

    function userDeposit() public payable returns (uint256) {
        totalUsersBalance += msg.value;
        BalanceOf[msg.sender] += msg.value;
        depositRegistryStruct memory deposit;

        deposit.amount = msg.value;
        deposit.depositTime = block.timestamp;
        deposit.userBalanceAtThisTime = BalanceOf[msg.sender];
        deposit.totalBalanceAtThisTime = totalUsersBalance;
        depositsUserRegistry[msg.sender].push(deposit);

        (bool succeed, ) = address(this).call{value: msg.value}("");
        require(succeed, "Failed to send Ether");

        if (succeed == true) {
            return msg.value;
        } else {
            revert();
        }
    }

    function rewardsDeposit() public payable onlyOwner returns (uint256) {
        totalRewardsBalance += msg.value;
        depositRegistryStruct memory rewardDeposit;

        rewardDeposit.amount = msg.value;
        rewardDeposit.depositTime = block.timestamp;
        rewardDeposit.totalBalanceAtThisTime = totalUsersBalance;
        rewardsDepositsRegistry.push(rewardDeposit);

        (bool succeed, ) = address(this).call{value: msg.value}("");
        require(succeed, "Failed to send Ether");

        if (succeed == true) {
            return msg.value;
        } else {
            revert();
        }
    }

    function withdrawDeposit(uint256 amount) public returns (uint256) {
        totalUsersBalance -= amount;
        BalanceOf[msg.sender] -= amount;

        (bool succeed, ) = msg.sender.call{value: amount}("");
        require(succeed, "Failed to withdraw Ether");

        if (succeed == true) {
            return amount;
        } else {
            revert();
        }
    }

    function calculateRewards() public view returns (uint256) {
        uint256 totaldeposits;
        uint256 rewards;

        for (uint256 i = rewardsDepositsRegistry.length; i > 0; i--) {
            if (
                lastClaim[msg.sender] <
                rewardsDepositsRegistry[i - 1].depositTime
            ) {
                totaldeposits = calculateTotaldepositsInReward(i - 1);
                rewards +=
                    ((totaldeposits * 100) /
                        rewardsDepositsRegistry[i - 1].totalBalanceAtThisTime) *
                    rewardsDepositsRegistry[i - 1].amount;
            } else {
                rewards = 0;
                break;
            }
        }
        return rewards;
    }

    function calculateTotaldepositsInReward(uint256 i)
        public
        view
        returns (uint256)
    {
        uint256 totaldepositsInThisReward;
        for (uint256 j = depositsUserRegistry[msg.sender].length; j > 0; j--) {
            if (
                depositsUserRegistry[msg.sender][j - 1].depositTime <
                rewardsDepositsRegistry[i].depositTime
            ) {
                totaldepositsInThisReward = depositsUserRegistry[msg.sender][
                    j - 1
                ].userBalanceAtThisTime;
                break;
            }
        }
        return totaldepositsInThisReward;
    }

    function claimRewards() public returns (uint256) {
        uint256 rewards;
        rewards = calculateRewards() / 100;
        lastClaim[msg.sender] = block.timestamp;
        totalRewardsBalance -= rewards;

        (bool succeed, ) = msg.sender.call{value: rewards}("");
        require(succeed, "Failed to withdraw Ether");

        if (succeed == true) {
            return rewards;
        } else {
            revert();
        }
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
