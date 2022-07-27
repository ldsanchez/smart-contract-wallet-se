import React, { useEffect, useState } from "react";
import { Button, Input, Select, InputNumber, Space } from "antd";
import { AddressInput } from "../components";
import { useLocalStorage } from "../hooks";
import { ethers } from "ethers";
const { Option } = Select;

export default function ManageGuardiansTransactions({ mainnetProvider, tx, writeContracts, DEBUG }) {
  const [guardianTransactionName, setGuardianTransactionName] = useLocalStorage(
    "guardianTransactionName",
    "queueGuardianForRemoval",
  );
  const [oldGuardian, setOldGuardian] = useLocalStorage("");
  const [newGuardian, setNewGuardian] = useLocalStorage("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    padding: 10,
  };

  const createTransaction = async () => {
    try {
      setLoading(true);
      if (guardianTransactionName === "queueGuardianForRemoval") {
        await tx(writeContracts.SmartContractWallet.initiateGuardianRemoval(oldGuardian));
        setOldGuardian("");
      } else if (guardianTransactionName === "cancelGuardianRemoval") {
        await tx(writeContracts.SmartContractWallet.cancelGuardianRemoval(oldGuardian));
        setOldGuardian("");
      } else if (guardianTransactionName === "executeGuardianRemoval") {
        await tx(
          writeContracts.SmartContractWallet.executeGuardianRemoval(oldGuardian, ethers.utils.keccak256(newGuardian)),
        );
        setOldGuardian("");
        setNewGuardian("");
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
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
            <Select value={guardianTransactionName} style={{ width: "100%" }} onChange={setGuardianTransactionName}>
              <Option key="queueGuardianForRemoval">Queue Guardian for Removal</Option>
              <Option key="cancelGuardianRemoval">Cancel Guardian Removal</Option>
              <Option key="executeGuardianRemoval">Execute Guardian Removal</Option>
            </Select>
          </div>
          <>
            <div style={inputStyle}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder={"Guardian Hashed Address to remove"}
                value={oldGuardian}
                onChange={setOldGuardian}
              />
            </div>
            {guardianTransactionName === "executeGuardianRemoval" && (
              <div style={inputStyle}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={"Guardian address to add"}
                  value={newGuardian}
                  onChange={setNewGuardian}
                />
              </div>
            )}
            <Space style={{ marginTop: 20 }}>
              <Button loading={loading} onClick={createTransaction} type="primary">
                Execute
              </Button>
            </Space>
          </>
        </div>
      </div>
    </div>
  );
}
