import React, { useEffect, useState } from "react";
import { MailOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";
import { AddressInput } from "../components";
import { useLocalStorage } from "../hooks";
import { ethers } from "ethers";
const { Option, OptGroup } = Select;

export default function GuardianCenterTransactions({ mainnetProvider, tx, writeContracts, DEBUG }) {
  const [guardianCenterTransactionName, setGuardianCenterTransactionName] = useLocalStorage(
    "guardianCenterTransactionName",
    "initiateRecovery",
  );
  const [newGuardian, setNewGuardian] = useLocalStorage("");
  const [email, setEmail] = useState("");
  const [newOwner, setNewOwner] = useState();
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    padding: 10,
  };

  const createTransaction = async () => {
    try {
      setLoading(true);
      if (guardianCenterTransactionName === "initiateRecovery") {
        await tx(writeContracts.SmartContractWallet.initiateRecovery(newOwner));
        setNewOwner("");
      } else if (guardianCenterTransactionName === "supportRecovery") {
        await tx(writeContracts.SmartContractWallet.supportRecovery(newOwner));
        setNewOwner("");
      } else if (guardianCenterTransactionName === "executeRecovery") {
        // await tx(writeContracts.SmartContractWallet.executeRecovery(newOwner, guardians));
        // await tx(writeContracts.SmartContractWallet.executeRecovery(newOwner));
        await tx(writeContracts.SmartContractWallet.executeRecovery());
        setNewOwner("");
        // setGuardians("");
      } else if (guardianCenterTransactionName === "resetRound") {
        await tx(writeContracts.SmartContractWallet.resetReound());
      } else if (guardianCenterTransactionName === "transferGuardianship") {
        await tx(writeContracts.SmartContractWallet.transferGuardianship(ethers.utils.keccak256(newGuardian)));
        setNewGuardian("");
      } else if (guardianCenterTransactionName === "revealMyIdentity") {
        await tx(writeContracts.SmartContractWallet.revealGuardianIdentity(email));
        setEmail("");
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
            <Select
              value={guardianCenterTransactionName}
              style={{ width: "100%" }}
              onChange={setGuardianCenterTransactionName}
            >
              <OptGroup label="Recovery">
                <Option key="initiateRecovery">Initiate Recovery</Option>
                <Option key="supportRecovery">Support Recovery</Option>
                <Option key="executeRecovery">Execute Recovery</Option>
                <Option key="resetRound">Reset Round</Option>
              </OptGroup>
              <OptGroup label="Management">
                <Option key="transferGuardianship">Transfer Guardianship</Option>
                <Option key="revealMyIdentity">Reveal my Identity</Option>
              </OptGroup>
            </Select>
            {(guardianCenterTransactionName === "initiateRecovery" ||
              guardianCenterTransactionName === "supportRecovery") && (
              <>
                <div style={inputStyle}>
                  <AddressInput
                    autoFocus
                    ensProvider={mainnetProvider}
                    placeholder={"Set New Wallet Owner Address"}
                    value={newOwner}
                    onChange={setNewOwner}
                  />
                </div>
              </>
            )}
            {guardianCenterTransactionName === "transferGuardianship" && (
              <div style={inputStyle}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={"Set New Guardian Address"}
                  value={newGuardian}
                  onChange={setNewGuardian}
                />
              </div>
            )}
            {guardianCenterTransactionName === "revealMyIdentity" && (
              <div style={inputStyle}>
                <Input
                  prefix={<MailOutlined />}
                  placeholder={"Email"}
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
            )}
            <Space style={{ marginTop: 20 }}>
              <Button loading={loading} onClick={createTransaction} type="primary">
                Execute
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
}
