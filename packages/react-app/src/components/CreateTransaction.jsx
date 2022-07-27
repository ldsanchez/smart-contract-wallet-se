import React, { useEffect, useState } from "react";
import { Button, Input, Select, Space, Tooltip } from "antd";
import { CodeOutlined } from "@ant-design/icons";
import { AddressInput, EtherInput, WalletConnectInput } from "../components";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { parseExternalContractTransaction } from "../helpers";
import { useLocalStorage } from "../hooks";
import { ethers } from "ethers";
import { parseEther } from "@ethersproject/units";
const { Option } = Select;

export default function CreateTransaction({
  contractName,
  contractAddress,
  mainnetProvider,
  localProvider,
  price,
  tx,
  writeContracts,
  DEBUG,
}) {
  const [methodName, setMethodName] = useLocalStorage("methodName", "transferFunds");
  const [amount, setAmount] = useState("0");
  const [to, setTo] = useLocalStorage("");
  const [customCallData, setCustomCallData] = useState("");
  const [parsedCustomCallData, setParsedCustomCallData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWalletConnectTransaction, setIsWalletConnectTransaction] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const inputStyle = {
    padding: 10,
  };

  useEffect(() => {
    const getParsedTransaction = async () => {
      const parsedTransaction = await parseExternalContractTransaction(to, customCallData);
      setParsedCustomCallData(parsedTransaction);
    };

    getParsedTransaction();
  }, [to, customCallData]);

  const loadWalletConnectData = ({ to, value, data }) => {
    setTo(to);
    value ? setAmount(ethers.utils.formatEther(value)) : setAmount("0");
    setCustomCallData(data);
    setIsWalletConnectTransaction(true);
  };

  useEffect(() => {
    isWalletConnectTransaction && createTransaction();
    setIsWalletConnectTransaction(false);
  }, [isWalletConnectTransaction]);

  const createTransaction = async () => {
    try {
      setLoading(true);

      let callData;
      let executeToAddress;
      if (methodName === "transferFunds" || methodName === "customCallData" || methodName === "wcCallData") {
        callData = methodName === "transferFunds" ? "0x" : customCallData;
        executeToAddress = to;
      }

      await tx(
        writeContracts[contractName].executeTransaction(
          executeToAddress,
          parseEther("" + parseFloat(amount).toFixed(12)),
          callData,
        ),
      );
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      setAmount("0");
      setTo("");
    } catch (error) {
      console.log("Error: ", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ width: 550, margin: "auto", marginTop: 15 }}>
        <div style={{ margin: 8 }}>
          <div style={{ margin: 8, padding: 8 }}>
            <Select value={methodName} style={{ width: "100%" }} onChange={setMethodName}>
              <Option key="transferFunds">Send ETH</Option>
              <Option key="customCallData">Custom Call Data</Option>
              <Option key="wcCallData">
                <img src="walletconnect-logo.svg" alt="walletconnect-logo" style={{ height: 20, width: 20 }} />
                WalletConnect
              </Option>
            </Select>
          </div>
          {methodName === "wcCallData" ? (
            <div style={inputStyle}>
              <WalletConnectInput
                chainId={localProvider?._network.chainId}
                address={contractAddress}
                loadWalletConnectData={loadWalletConnectData}
                mainnetProvider={mainnetProvider}
                price={price}
              />
            </div>
          ) : (
            <>
              <div style={inputStyle}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={methodName === "transferFunds" ? "Recepient address" : "Target address"}
                  value={to}
                  onChange={setTo}
                />
              </div>
              <div style={inputStyle}>
                {methodName === "customCallData" && (
                  <>
                    <Input.Group compact>
                      <Input
                        style={{ width: "calc(100% - 31px)", marginBottom: 20 }}
                        placeholder="Custom call data"
                        value={customCallData}
                        onChange={e => {
                          setCustomCallData(e.target.value);
                        }}
                      />
                      <Tooltip title="Parse transaction data">
                        <Button onClick={showModal} icon={<CodeOutlined />} />
                      </Tooltip>
                    </Input.Group>
                    <TransactionDetailsModal
                      visible={isModalVisible}
                      txnInfo={parsedCustomCallData}
                      handleOk={() => setIsModalVisible(false)}
                      handleCancel={() => setIsModalVisible(false)}
                      mainnetProvider={mainnetProvider}
                      price={price}
                    />
                  </>
                )}
                {(methodName === "transferFunds" || methodName === "customCallData") && (
                  <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} />
                )}
              </div>
              <Space style={{ marginTop: 20 }}>
                <Button loading={loading} onClick={createTransaction} type="primary">
                  Execute
                </Button>
              </Space>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
