import { Divider, Select, Col, Row, List } from "antd";
import React, { useState, useEffect } from "react";
// import { ethers } from "ethers";
import { Link } from "react-router-dom";
import {
  Address,
  Balance,
  Guardians,
  TransactionListItem,
  CreateTransaction,
  CreateSmartContractWalletModal,
  Transactions,
} from "../components";

import { useEventListener } from "eth-hooks/events/";
import { useContractReader } from "eth-hooks";
import QR from "qrcode.react";
import nonDeployedABI from "../contracts/hardhat_non_deployed_contracts.json";

const { ethers } = require("ethers");

const { Option } = Select;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
export default function SmartContractWallet({
  price,
  selectedChainId,
  mainnetProvider,
  localProvider,
  address,
  tx,
  writeContracts,
  readContracts,
  isCreateModalVisible,
  setIsCreateModalVisible,
  DEBUG,
  blockExplorer,
  userSigner,
}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const contractName = "SmartContractWallet";
  const contractAddress = readContracts?.SmartContractWallet?.address;

  //📟 Listen for broadcast events

  // MultisigWalletFactory Events:
  const walletSmartContractWalletEvents = useEventListener(
    readContracts,
    "SmartContractWalletFactory",
    "Wallet",
    localProvider,
    1,
  );
  if (DEBUG) console.log("📟 walletSmartContractWalletEvents:", walletSmartContractWalletEvents);

  const [contractNameForEvent, setContractNameForEvent] = useState();
  const [smartContractWallets, setSmartContractWallets] = useState([]);
  const [currentSmartContractWalletAddress, setCurrentSmartContractWalletAddress] = useState();

  useEffect(() => {
    if (address) {
      const smartContractWalletsForUser = walletSmartContractWalletEvents.reduce((filtered, createEvent) => {
        if (
          createEvent.args.owner.includes(address) ||
          (createEvent.args.guardians.includes(ethers.utils.keccak256(address)) &&
            !filtered.includes(createEvent.args.contractAddress))
        ) {
          filtered.push(createEvent.args.contractAddress);
        }

        return filtered;
      }, []);

      if (smartContractWalletsForUser.length > 0) {
        const recentSmartContractWalletAddress = smartContractWalletsForUser[smartContractWalletsForUser.length - 1];
        if (recentSmartContractWalletAddress !== currentSmartContractWalletAddress) setContractNameForEvent(null);
        setCurrentSmartContractWalletAddress(recentSmartContractWalletAddress);
        setSmartContractWallets(smartContractWalletsForUser);
      }
    }
  }, [walletSmartContractWalletEvents, address]);

  const [guardiansRequired, setGuardiansRequired] = useState(0);
  const [nonce, setNonce] = useState(0);

  const guardiansRequiredContract = useContractReader(readContracts, contractName, "guardiansRequired");
  const nonceContract = useContractReader(readContracts, contractName, "nonce");
  useEffect(() => {
    setGuardiansRequired(guardiansRequiredContract);
    setNonce(nonceContract);
  }, [guardiansRequiredContract, nonceContract]);

  useEffect(() => {
    async function getContractValues() {
      const guardiansRequired = await readContracts.SmartContractWallet.guardiansRequired();
      setGuardiansRequired(guardiansRequired);

      const nonce = await readContracts.SmartContractWallet.nonce();
      setNonce(nonce);
    }

    if (currentSmartContractWalletAddress) {
      readContracts.SmartContractWallet = new ethers.Contract(
        currentSmartContractWalletAddress,
        nonDeployedABI.SmartContractWallet,
        localProvider,
      );
      writeContracts.SmartContractWallet = new ethers.Contract(
        currentSmartContractWalletAddress,
        nonDeployedABI.SmartContractWallet,
        userSigner,
      );

      setContractNameForEvent("SmartContractWallet");
      getContractValues();
    }
  }, [currentSmartContractWalletAddress, localProvider, readContracts, writeContracts]);

  const allWalletEvents = useEventListener(
    currentSmartContractWalletAddress ? readContracts : null,
    contractNameForEvent,
    "Wallet",
    localProvider,
    1,
  );
  if (DEBUG) console.log("📟 walletEvents:", allWalletEvents);

  const [walletEvents, setWalletEvents] = useState();

  const allGuardianEvents = useEventListener(
    currentSmartContractWalletAddress ? readContracts : null,
    contractNameForEvent,
    "Guardian",
    localProvider,
    1,
  );
  if (DEBUG) console.log("📟 guardianEvents:", allGuardianEvents);

  const [guardianEvents, setGuardianEvents] = useState();

  useEffect(() => {
    // setExecuteTransactionEvents(
    //   allExecuteTransactionEvents.filter(contractEvent => contractEvent.address === currentMultisigWalletAddress),
    // );
    setWalletEvents(
      allWalletEvents.filter(contractEvent => contractEvent.address === currentSmartContractWalletAddress),
    );

    setGuardianEvents(
      allGuardianEvents.filter(contractEvent => contractEvent.address === currentSmartContractWalletAddress),
    );
  }, [allWalletEvents, allGuardianEvents, currentSmartContractWalletAddress]);

  const handleSmartContractWalletChange = value => {
    setContractNameForEvent(null);
    setCurrentSmartContractWalletAddress(value);
  };

  if (DEBUG) console.log("📟 currentSmartContractWalletAddress:", currentSmartContractWalletAddress);

  const userHasSmartContractWallets = currentSmartContractWalletAddress ? true : false;

  return (
    <div style={{ padding: 16, margin: "auto", marginTop: 10 }}>
      <Row justify="center">
        <Col>
          <div>
            <CreateSmartContractWalletModal
              price={price}
              selectedChainId={selectedChainId}
              mainnetProvider={mainnetProvider}
              address={address}
              tx={tx}
              writeContracts={writeContracts}
              contractName={"SmartContractWalletFactory"}
              isCreateModalVisible={isCreateModalVisible}
              setIsCreateModalVisible={setIsCreateModalVisible}
            />
            <Select
              value={[currentSmartContractWalletAddress]}
              style={{ width: 400 }}
              onChange={handleSmartContractWalletChange}
            >
              {smartContractWallets.map((address, index) => (
                <Option key={index} value={address}>
                  {address}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>
      <Divider />
      <Row justify="space-around">
        <Col lg={6} xs={24}>
          <div>
            <div>
              <h2 style={{ marginTop: 16 }}>Smart Contract Wallet Balance:</h2>
              <div>
                <Balance
                  address={currentSmartContractWalletAddress ? currentSmartContractWalletAddress : ""}
                  provider={localProvider}
                  dollarMultiplier={price}
                  size={64}
                />
              </div>
              <div>
                <QR
                  value={currentSmartContractWalletAddress ? currentSmartContractWalletAddress.toString() : ""}
                  size="180"
                  level="H"
                  includeMargin
                  renderAs="svg"
                  imageSettings={{ excavate: false }}
                />
              </div>
              <div>
                <Address
                  address={currentSmartContractWalletAddress ? currentSmartContractWalletAddress : ""}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={32}
                />
              </div>
              <>
                {userHasSmartContractWallets ? (
                  <div>
                    <Guardians
                      guardianEvents={guardianEvents}
                      guardiansRequired={guardiansRequired}
                      mainnetProvider={mainnetProvider}
                      blockExplorer={blockExplorer}
                    />
                  </div>
                ) : (
                  <div></div>
                )}
              </>
            </div>
          </div>
        </Col>
        <Col lg={6} xs={24}>
          <h2 style={{ marginTop: 16 }}>Create a Transaction:</h2>
          <CreateTransaction
            contractName={contractName}
            contractAddress={contractAddress}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            price={price}
            tx={tx}
            readContracts={readContracts}
            wtiteContracts={writeContracts}
            userSigner={userSigner}
            DEBUG={DEBUG}
            nonce={nonce}
            blockExplorer={blockExplorer}
            guardiansRequired={guardiansRequired}
          />
        </Col>
      </Row>
    </div>
  );
}

// export default Home;
