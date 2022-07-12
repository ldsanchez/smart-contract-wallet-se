// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// SmartContractWallet instance contract
import "./SmartContractWallet.sol";

contract SmartContractWalletFactory {
    // Keep track of SmartContractWallet instances
    SmartContractWallet[] public smartContractWallets;
    mapping(address => bool) existsSmartContractWallet;

    // SmartContractWallet Create event
    event Create(
        uint256 indexed contractId,
        address indexed contractAddress,
        address creator,
        address owner,
        bytes32[] guardians,
        uint256 guardiansRequired
    );

    // SmartContractWallet Wallet event
    event Wallet(
        address indexed contractAddress,
        address owner,
        bytes32[] guardians,
        uint256 indexed guardiansRequired
    );

    constructor() {}

    // Only registered wallet instances can call the logger
    modifier onlyRegistered() {
        require(
            existsSmartContractWallet[msg.sender],
            "caller not registered to use logger"
        );
        _;
    }

    // Emit Wallet events used from SmartContractWallet instance
    function emitWallet(
        address _contractAddress,
        address _owner,
        bytes32[] memory _guardians,
        uint256 _guardiansRequired
    ) external onlyRegistered {
        emit Wallet(_contractAddress, _owner, _guardians, _guardiansRequired);
    }

    // Get the number of wallets
    function numberOfSmartContractWallets() public view returns (uint256) {
        return smartContractWallets.length;
    }

    // Create a SmartContractWallet instance and make it payable
    function createSmartContractWallet(
        uint256 _chainId,
        address _owner,
        bytes32[] memory _guardianAddressHashes,
        uint256 _guardiansRequired
    ) public payable {
        // SmartContractWallet ID
        uint256 id = numberOfSmartContractWallets();

        // Create a new instance
        SmartContractWallet smartContractWallet = (new SmartContractWallet){
            value: msg.value
        }(
            _chainId,
            _owner,
            _guardianAddressHashes,
            _guardiansRequired,
            address(this)
        );
        // Update
        smartContractWallets.push(smartContractWallet);
        existsSmartContractWallet[address(smartContractWallet)] = true;

        // Emit Create and Initial Wallet events
        emit Create(
            id,
            address(smartContractWallet),
            msg.sender,
            _owner,
            _guardianAddressHashes,
            _guardiansRequired
        );
        emit Wallet(
            address(smartContractWallet),
            _owner,
            _guardianAddressHashes,
            _guardiansRequired
        );
    }

    // Get SmartContractWallet information
    function getSmartContractWallet(uint256 _index)
        public
        view
        returns (
            address smartContractWalletAddress,
            uint256 guardiansRequired,
            uint256 balance
        )
    {
        SmartContractWallet smartContractWallet = smartContractWallets[_index];
        return (
            address(smartContractWallet),
            smartContractWallet.guardiansRequired(),
            address(smartContractWallet).balance
        );
    }
}
