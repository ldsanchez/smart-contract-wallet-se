import { Divider, Select, Col, Row, Avatar, Spin, Space, Button } from "antd";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Address, Balance, CreateTransaction, CreateSmartContractWalletModal } from "../components";

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
  isOwner,
  isGuardian,
  updateContractValues,
  setCurrentSmartContractWalletAddress,
  currentSmartContractWalletAddress
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
  const [currentSmartContractWalletAddressHome, setcurrentSmartContractWalletAddressHome] = useState();

  useEffect(() => {
    console.log("ZZZZcurrentSmartContractWalletAddressHome",currentSmartContractWalletAddressHome)
    console.log("ZZZZcurrentSmartContractWalletAddress",currentSmartContractWalletAddress)
    if (typeof currentSmartContractWalletAddress != "undefined" && currentSmartContractWalletAddress != null){
      setcurrentSmartContractWalletAddressHome(currentSmartContractWalletAddress);
    }
    if (address) {
      const smartContractWalletsForUser = walletSmartContractWalletEvents.reduce((filtered, createEvent) => {
        if (createEvent.args.owner.includes(address) && !filtered.includes(createEvent.args.contractAddress)) {
          filtered.push(createEvent.args.contractAddress);
        } else if (
          createEvent.args.guardians.includes(ethers.utils.keccak256(address)) &&
          !filtered.includes(createEvent.args.contractAddress)
        ) {
          filtered.push(createEvent.args.contractAddress);
        } else if (
          !createEvent.args.owner.includes(address) &&
          !createEvent.args.guardians.includes(ethers.utils.keccak256(address)) &&
          filtered.includes(createEvent.args.contractAddress)
        ) {
          const index = filtered.indexOf(createEvent.args.contractAddress);
          filtered.splice(index, 1);
        }
        return filtered;
      }, []);

      if (smartContractWalletsForUser.length > 0) {
        const recentSmartContractWalletAddress = smartContractWalletsForUser[smartContractWalletsForUser.length - 1];
        if (recentSmartContractWalletAddress !== currentSmartContractWalletAddressHome) setContractNameForEvent(null);
        
        if (typeof currentSmartContractWalletAddressHome != "undefined" && currentSmartContractWalletAddressHome != null){
          setcurrentSmartContractWalletAddressHome(currentSmartContractWalletAddressHome);
        }else{
          if (typeof currentSmartContractWalletAddress != "undefined" && currentSmartContractWalletAddress != null){
            setcurrentSmartContractWalletAddressHome(currentSmartContractWalletAddress);
          }else{
            setcurrentSmartContractWalletAddressHome(recentSmartContractWalletAddress);
          }
        }
        setSmartContractWallets(smartContractWalletsForUser);
      } else {
        setcurrentSmartContractWalletAddressHome(null);
        setSmartContractWallets([]);
      }
    }
  }, [walletSmartContractWalletEvents, address]);

  const [inRecovery, setInRecovery] = useState("Active");

  useEffect(() => {
    async function getContractValuesHome() {

      const inRecovery = await readContracts.SmartContractWallet.inRecovery();
      if (inRecovery) {
        setInRecovery("In Recovery");
      } else {
        setInRecovery("Active");
      }
      await updateContractValues();
    }

    if (currentSmartContractWalletAddressHome) {
      readContracts.SmartContractWallet = new ethers.Contract(
        currentSmartContractWalletAddressHome,
        nonDeployedABI.SmartContractWallet,
        localProvider,
      );
      writeContracts.SmartContractWallet = new ethers.Contract(
        currentSmartContractWalletAddressHome,
        nonDeployedABI.SmartContractWallet,
        userSigner,
      );

      console.log("AQUI VAAAAAAAAAAAA")
      setContractNameForEvent("SmartContractWallet");
      getContractValuesHome();
    }
  }, [currentSmartContractWalletAddressHome, localProvider, readContracts, writeContracts]);

  const allWalletEvents = useEventListener(
    currentSmartContractWalletAddressHome ? readContracts : null,
    contractNameForEvent,
    "Wallet",
    localProvider,
    1,
  );
  if (DEBUG) console.log("📟 walletEvents:", allWalletEvents);

  const [walletEvents, setWalletEvents] = useState();

  const allGuardianEvents = useEventListener(
    currentSmartContractWalletAddressHome ? readContracts : null,
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
      allWalletEvents.filter(contractEvent => contractEvent.address === currentSmartContractWalletAddressHome),
    );

    setGuardianEvents(
      allGuardianEvents.filter(contractEvent => contractEvent.address === currentSmartContractWalletAddressHome),
    );
  }, [allWalletEvents, allGuardianEvents, currentSmartContractWalletAddressHome]);

  const handleSmartContractWalletChange = value => {
    setContractNameForEvent(null);
    console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",value)
    setCurrentSmartContractWalletAddress(value)
    setcurrentSmartContractWalletAddressHome(value);
  };

  if (DEBUG) console.log("📟 currentSmartContractWalletAddressHome:", currentSmartContractWalletAddressHome);

  const userHasSmartContractWallets = currentSmartContractWalletAddressHome ? true : false;

  const [loading, setLoading] = useState(false);

  const cancelRecovery = async () => {
    try {
      setLoading(true);
      await tx(writeContracts.SmartContractWallet.cancelRecovery());
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      setInRecovery("Active");
    } catch (error) {
      console.log("Error: ", error);
      setLoading(false);
    }
  };

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
              value={currentSmartContractWalletAddressHome}
              style={{ width: 400 }}
              onChange={handleSmartContractWalletChange}
            >
              {smartContractWallets.map((address, index) => (
                <Option key={index} value={address}>
                  {address}
                </Option>
              ))}
            </Select>
            <Avatar
              style={{ margin: "auto", marginLeft: 10, backgroundColor: "#1890ff" }}
              icon={isOwner ? <UserOutlined /> : isGuardian ? <EyeOutlined /> : ""}
            />
            <span style={{ margin: "auto", marginLeft: 10 }}>{isOwner ? "Owner" : isGuardian ? "Guardian" : ""}</span>
          </div>
        </Col>
      </Row>
      <Divider />
      {isOwner && (
        <Row justify="center">
          <div>
            <h2 style={{ marginTop: 32 }}>Wallet Status: {inRecovery ? inRecovery : <Spin></Spin>}</h2>
            {inRecovery === "In Recovery" && (
              <div style={{ margin: 8 }}>
                <Space style={{ marginTop: 20 }}>
                  <Button loading={loading} onClick={cancelRecovery} type="primary">
                    Cancel Recovery
                  </Button>
                </Space>
              </div>
            )}
            <div>
              <Balance
                address={currentSmartContractWalletAddressHome ? currentSmartContractWalletAddressHome : ""}
                provider={localProvider}
                dollarMultiplier={price}
                size={64}
              />
            </div>
            <div>
              <QR
                value={currentSmartContractWalletAddressHome ? currentSmartContractWalletAddressHome.toString() : ""}
                size="180"
                level="H"
                includeMargin
                renderAs="svg"
                imageSettings={{ excavate: false }}
              />
            </div>
            <div>
              <Address
                address={currentSmartContractWalletAddressHome ? currentSmartContractWalletAddressHome : ""}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={32}
              />
            </div>
            <div>
              <CreateTransaction
                contractName={contractName}
                contractAddress={contractAddress}
                mainnetProvider={mainnetProvider}
                localProvider={localProvider}
                price={price}
                tx={tx}
                writeContracts={writeContracts}
                DEBUG={DEBUG}
              />
            </div>
          </div>
        </Row>
      )}
    </div>
  );
}
