//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
// SmartContractWallet Factory
import "./SmartContractWalletFactory.sol";
import "hardhat/console.sol";

contract SmartContractWallet is Ownable {
    SmartContractWalletFactory public smartContractWalletFactory;
    uint256 public balance;

    mapping(bytes32 => bool) public isGuardian;
    // uint256 public threshold;

    uint256 public nonce;
    uint256 public chainId;
    uint256 public guardiansRequired;

    event Guardian(bytes32 indexed guardian, bool added);

    constructor(
        uint256 _chainId,
        address _owner,
        bytes32[] memory guardianAddrHashes,
        uint256 _guardiansRequired,
        address _factory
    ) payable {
        smartContractWalletFactory = SmartContractWalletFactory(_factory);
        require(
            _guardiansRequired <= guardianAddrHashes.length,
            "threshold too high"
        );

        for (uint256 i = 0; i < guardianAddrHashes.length; i++) {
            require(!isGuardian[guardianAddrHashes[i]], "duplicate guardian");
            isGuardian[guardianAddrHashes[i]] = true;
            emit Guardian(
                guardianAddrHashes[i],
                isGuardian[guardianAddrHashes[i]]
            );
        }

        guardiansRequired = _guardiansRequired;
        chainId = _chainId;
        setOwner(_owner);
    }

    modifier onlyGuardian() {
        require(
            isGuardian[keccak256(abi.encodePacked(msg.sender))],
            "only guardian"
        );
        _;
    }

    event TransactionExecuted(
        address indexed target,
        uint256 value,
        bytes data
    );

    function guardianFunction() public onlyGuardian returns (bool) {
        return true;
    }

    function executeTransaction(
        address payable _to,
        uint256 _value,
        bytes memory _data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = _to.call{value: _value}(_data);
        require(success, "external call reverted");
        emit TransactionExecuted(_to, _value, _data);
        return result;
    }

    function setOwner(address _newOwner) public onlyOwner {
        transferOwnership(_newOwner);
    }

    // function getOwner() public view returns (address) {
    //     return owner;
    // }

    // function getBalance() public view returns (uint256) {
    //     return balance;
    // }

    // function deposit(uint256 _amount) public {
    //     balance += _amount;
    // }

    function withdraw(uint256 _amount) external onlyOwner {
        require(balance >= _amount);
        balance -= _amount;
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    // function transfer(address _to, uint256 _amount) public {
    //     require(balance >= _amount);
    //     balance -= _amount;
    //     _to.transfer(_amount);
    // }

    // function transferFrom(
    //     address _from,
    //     address _to,
    //     uint256 _amount
    // ) public {
    //     require(balance >= _amount);
    //     balance -= _amount;
    //     _from.transferFrom(_to, _amount);
    // }

    // function approve(address _spender, uint256 _amount) public {
    //     allowance[_spender] = _amount;
    // }

    // function allowance(address _owner, address _spender) public view returns (uint256) {
    //     return allowance[_spender];
    // }

    receive() external payable {
        balance += msg.value;
    }
}
