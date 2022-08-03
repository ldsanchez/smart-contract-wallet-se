# 🏗 Scaffold-ETH - Smart Contract Wallet Factory

## with Social Recovery

> Create multiple Smart Wallets with Social Recovery from a simple interface + Debug Interface with Smart Contract Wallet Factory & selected Wallet instance! 🚀

![image](https://user-images.githubusercontent.com/5996795/180932403-4feb979f-0874-4cae-90e8-c496850ef6df.png)

BuidlGuidl Build submission: Scaffold-ETH implementation of a Social Recovery Wallet based on Vitalik's [Why we need wide adoption of social recovery wallets](https://vitalik.ca/general/2021/01/11/recovery.html) post.

# Use Case

Losing access to wallets is an increasing problem with so many new people onboarding crypto, a Social Recovery Smart Contract Wallet implementation helps solve this particular issue, by giving power to a group of actors (friends & family / other owned wallets) that can help the owner in the recovery process.

> There are many possible choices for whom to select as a guardian. The three most common choices are:
>
> - Other devices (or paper mnemonics) owned by the wallet holder themselves
> - Friends and family members
> - Institutions, which would sign a recovery message if they get a confirmation of your phone number or email or perhaps in high value cases verify you personally by video call

# Features

- Transfers / Contract Calls Transactions
- Guardian Management
- Social Recovery
- Guardian Reveal

# Implementation

Social Recovery is implemented by assigning several wallet guardians, and a minimum of required recovery supporters, hiding their identity through a hash of their addresses until the recovery is initiated by request of the owner, changing the ownership of the wallet.

## Wallet Creation

For the wallet creation we only need the guardians addresses (converted into hashes using ethers.utils.keccak256 in the front-end) and minimum guardians required for a recovery (in Vitalik's post he suggest as much as 7 Guardians).

**Note:** For simplicity an testing purposes curently there is no minimum required guardians in the contract, but we should enforce for at least 3.

- CreateSmartContractWalletModal.jsx

```javascript
guardians.forEach((element, index) => {
  guardians[index] = ethers.utils.keccak256(element);
});
```

- SmartContractWallet.sol

```solidity
    constructor(
        uint256 _chainId,
        address _owner,
        bytes32[] memory guardianAddressHashes,
        uint256 _guardiansRequired,
        address _factory
    ) payable nonZeroGuardians(_guardiansRequired) {
        smartContractWalletFactory = SmartContractWalletFactory(_factory);
        require(
            _guardiansRequired <= guardianAddressHashes.length,
            "Number of guardians too high"
        );

        for (uint256 i = 0; i < guardianAddressHashes.length; i++) {
            require(
                !isGuardian[guardianAddressHashes[i]],
                "Duplicate guardian"
            );
            isGuardian[guardianAddressHashes[i]] = true;
            guardiansAddressHashes.push(guardianAddressHashes[i]);
            emit Guardian(
                guardianAddressHashes[i],
                isGuardian[guardianAddressHashes[i]]
            );
        }

        guardiansRequired = _guardiansRequired;
        chainId = _chainId;
        owner = _owner;
    }
```

## Transactions

Using a Call function for Transfers / Contract Interaction

- SmartContractWallet.sol

```solidity
function executeTransaction(
        address payable _target,
        uint256 _value,
        bytes memory _data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = _target.call{value: _value}(
            _data
        );
        require(success, "Transaction Failed");
        nonce++;
        emit TransactionExecuted(nonce - 1, _target, _value, _data, result);
        return result;
    }
```

## Social Recovery

The Social Recovery initiates when we ask / use one of our guardians to initiate the recovery process, passing the new proposed owner address, creating a recovery round and setting the recovery mode of our wallet. Each Guardian discloses their address and we keep track of them.

- SmartContractWallet.sol

```solidity
function initiateRecovery(address _proposedOwner)
        external
        onlyGuardian
        notInRecovery
    {
        proposedOwner = _proposedOwner;
        currentRecoveryRound++;
        guardianToRecovery[msg.sender] = Recovery(
            _proposedOwner,
            currentRecoveryRound,
            false
        );
        revealedGuardiansAddress.push(msg.sender);
        isSupporter[msg.sender] = true;
        inRecovery = true;
        emit RecoveryInitiated(
            msg.sender,
            _proposedOwner,
            currentRecoveryRound
        );
    }
```

Then is time for other guardians to support the recovery process, with the same information as above.

- SmartContractWallet.sol

```solidity
function supportRecovery(address _proposedOwner)
        external
        onlyGuardian
        onlyInRecovery
    {
        require(!isSupporter[msg.sender], "Sender is already a supporter");
        guardianToRecovery[msg.sender] = Recovery(
            _proposedOwner,
            currentRecoveryRound,
            false
        );
        revealedGuardiansAddress.push(msg.sender);
        emit RecoverySupported(
            msg.sender,
            _proposedOwner,
            currentRecoveryRound
        );
    }
```

Finally any Guardian executes the recovery, that goes through each supporter and compares the values to see if an agreement was met for the recovery process.

- SmartContractWallet.sol

```solidity
function executeRecovery() external onlyGuardian onlyInRecovery {
        require(
            revealedGuardiansAddress.length >= guardiansRequired,
            "More guardians required to transfer ownership"
        );

        for (uint256 i = 0; i < revealedGuardiansAddress.length; i++) {
            Recovery memory recovery = guardianToRecovery[
                revealedGuardiansAddress[i]
            ];

            if (recovery.proposedOwner != proposedOwner) {
                revert Disagreement__OnNewOwner();
            }

            guardianToRecovery[revealedGuardiansAddress[i]]
                .usedInExecuteRecovery = true;
            isSupporter[revealedGuardiansAddress[i]] = false;
        }

        inRecovery = false;
        address _oldOwner = owner;
        owner = proposedOwner;
        delete revealedGuardiansAddress;
        delete proposedOwner;
        emit RecoveryExecuted(_oldOwner, owner, currentRecoveryRound);
        smartContractWalletFactory.emitWallet(
            address(this),
            owner,
            guardiansAddressHashes,
            guardiansRequired
        );
    }
```

# Dapp

Using Scaffold-ETH is easy to prototype these complex interactions between Owner and Guardians, from the Debug tab we can test everything before creating the interface for our Dapp, and by opening several browers each one representing a different wallet / actor.

## From the Owner perspective

- Create Multiple Wallets

![image](https://user-images.githubusercontent.com/5996795/180932403-4feb979f-0874-4cae-90e8-c496850ef6df.png)

- See if it's on Recovery Mode, and cancel it if you did not requested

![image](https://user-images.githubusercontent.com/5996795/180935352-489f2672-ce23-486e-8164-c547a5471589.png)

- Manage the Guardians

![image](https://user-images.githubusercontent.com/5996795/180934933-14758ec1-fd5b-489c-9428-7d0cd846119c.png)

## From the Guardian perspective

- See wallets of which you are the guardian

![image](https://user-images.githubusercontent.com/5996795/180935821-c9d4d837-fc53-44f7-99f4-4126b5f44f06.png)

- Initiate, Support and Execute a recovery, transfer your Guardianship, as Revealing your identity if the owner passes away, including your email to reach each other

![image](https://user-images.githubusercontent.com/5996795/180940212-f08defd9-6a2b-4cb3-8c05-63e7ae421382.png)

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth: Smart Contract Wallet Factory

```bash
git clone https://github.com/ldsanchez/smart-contract-wallet-se.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd smart-contract-wallet-se
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd smart-contract-wallet-se
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd smart-contract-wallet-se
yarn deploy
yarn export-non-deployed
```

🔏 Edit your smart contract `SmartContractWalletFactory.sol` & `SmartContractWallet.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` & `Home.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# TO-DO

- Implementing Vaults for securing the assets (timelock / restrictions ) as stated in Vitalik's post [How to Implement Secure Bitcoin Vaults](https://hackingdistributed.com/2016/02/26/how-to-implement-secure-bitcoin-vaults/)
- Inttegrating Events with notification services

# Deploy it! 🛰

📡 Edit the defaultNetwork in packages/hardhat/hardhat.config.js, as well as targetNetwork in packages/react-app/src/App.jsx, to your choice of public EVM networks

👩‍🚀 You will want to run yarn account to see if you have a deployer address.

🔐 If you don't have one, run yarn generate to create a mnemonic and save it locally for deploying.

🛰 Use a faucet like faucet.paradigm.xyz to fund your deployer address (run yarn account again to view balances)

🚀 Run yarn deploy to deploy to your public network of choice (😅 wherever you can get ⛽️ gas)

🔬 Inspect the block explorer for the network you deployed to... make sure your contract is there.

# 🚢 Ship it! 🚁

✏️ Edit your frontend App.jsx in packages/react-app/src to change the targetNetwork to wherever you deployed your contract, and also change the BACKEND_URL constant to your deployed backend.

📦 Run yarn build to package up your frontend.

💽 Upload your app to surge with yarn surge (you could also yarn s3 or maybe even yarn ipfs?)

😬 Windows users beware! You may have to change the surge code in packages/react-app/package.json to just "surge": "surge ./build",

⚙ If you get a permissions error yarn surge again until you get a unique URL, or customize it in the command line.

🚔 Traffic to your url might break the Infura rate limit, edit your key: constants.js in packages/ract-app/src.

# 📜 Contract Verification

Update the api-key in packages/hardhat/package.json. You can get your key here.

Now you are ready to run the yarn verify --network your_network command to verify your contracts on etherscan 🛰

# 💌 P.S.

📣 You can use `yarn export-non-deployed` to create the Wallet instance ABI.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# Thanks to

[Austin / BuidlGuidl / Scaffold-ETH](https://buidlguidl.com/) for an amazing learning / builder ecosystem, [Vitalik](https://github.com/vbuterin) for his clear post, and [Verumlotus](https://github.com/verumlotus) for the base contract.

# 🏃💨 Speedrun Ethereum

Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
