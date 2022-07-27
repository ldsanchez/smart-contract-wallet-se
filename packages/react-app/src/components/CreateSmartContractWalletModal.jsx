import React, { useState, useEffect } from "react";
import { Button, Modal, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { AddressInput, EtherInput, CreateSmartContractWalletModalSentOverlay } from ".";

export default function CreateSmartContractWalletModal({
  price,
  selectedChainId,
  mainnetProvider,
  address,
  tx,
  writeContracts,
  contractName,
  isCreateModalVisible,
  setIsCreateModalVisible,
}) {
  // Transaction status State
  const [pendingCreate, setPendingCreate] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  // Transaction arguments State
  const [amount, setAmount] = useState("0");
  const [guardians, setGuardians] = useState([""]);
  const [guardiansRequired, setGuardiansRequired] = useState(false);

  // Set the first owner as the connected wallet
  // useEffect(() => {
  //   if (address) {
  //     setGuardians([address]);
  //   }
  // }, [address]);

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const addGuardianField = () => {
    const newGuardians = [...guardians, ""];
    setGuardians(newGuardians);
  };

  const updateGuardian = (value, index) => {
    const newGuardians = [...guardians];
    newGuardians[index] = value;
    setGuardians(newGuardians);
  };

  const removeGuardianField = index => {
    const newGuardians = [...guardians];
    newGuardians.splice(index, 1);
    setGuardians(newGuardians);
  };

  const resetState = () => {
    setPendingCreate(false);
    setTxSent(false);
    setTxError(false);
    setTxSuccess(false);
    setGuardians([""]);
    setAmount("0");
    setGuardiansRequired(false);
  };

  const validateFields = () => {
    let valid = true;

    if (guardiansRequired > guardians.length) {
      console.log("Validation error: signatures required is greather than number of guardians.");
      valid = false;
    }

    guardians.forEach((guardian, index) => {
      let err;
      if (!guardian) {
        err = "Required Input";
      } else if (guardians.slice(0, index).some(o => o === guardian)) {
        err = "Duplicate Guardian";
      } else if (!ethers.utils.isAddress(guardian)) {
        err = "Bad format";
      }

      if (err) {
        console.log("Guardians field error: ", err);
        valid = false;
      }
    });

    return valid;
  };

  const handleSubmit = () => {
    try {
      setPendingCreate(true);

      if (!validateFields()) {
        setPendingCreate(false);
        throw "Field validation failed.";
      }

      guardians.forEach((element, index) => {
        guardians[index] = ethers.utils.keccak256(element);
      });

      tx(
        writeContracts[contractName].createSmartContractWallet(selectedChainId, address, guardians, guardiansRequired, {
          value: ethers.utils.parseEther("" + parseFloat(amount).toFixed(12)),
        }),
        update => {
          if (update && (update.error || update.reason)) {
            console.log("tx update error!");
            setPendingCreate(false);
            setTxError(true);
          }

          if (update && update.code) {
            setPendingCreate(false);
            setTxSent(false);
          }

          if (update && (update.status === "confirmed" || update.status === 1)) {
            console.log("tx update confirmed!");
            setPendingCreate(false);
            setTxSuccess(true);
            setTimeout(() => {
              setIsCreateModalVisible(false);
              resetState();
            }, 2500);
          }
        },
      ).catch(err => {
        setPendingCreate(false);
        throw err;
      });

      setTxSent(true);
    } catch (e) {
      console.log("CREATE SMART CONTRACT WALLET SUBMIT FAILED: ", e);
    }
  };

  const handleCancel = () => {
    setIsCreateModalVisible(false);
  };

  return (
    <>
      <Button type="primary" style={{ marginRight: 10 }} onClick={showCreateModal}>
        Create
      </Button>
      <Modal
        title="Create Smart Contract Wallet"
        visible={isCreateModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={pendingCreate} onClick={handleSubmit}>
            Create
          </Button>,
        ]}
      >
        {txSent && (
          <CreateSmartContractWalletModalSentOverlay
            txError={txError}
            txSuccess={txSuccess}
            pendingText="Creating Smart Contract Wallet"
            successText="Smart Contract Wallet Created"
            errorText="Transaction Failed"
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {guardians.map((guardian, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: "90%" }}>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder={"Guardian address"}
                  value={guardian}
                  onChange={val => updateGuardian(val, index)}
                />
              </div>
              {index > 0 && (
                <Button style={{ padding: "0 0.5rem" }} danger onClick={() => removeGuardianField(index)}>
                  <DeleteOutlined />
                </Button>
              )}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "90%" }}>
            <Button onClick={addGuardianField}>
              <PlusOutlined />
            </Button>
          </div>
          <div style={{ width: "90%" }}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Number of guardians required"
              value={guardiansRequired}
              onChange={setGuardiansRequired}
            />
          </div>
          <div style={{ width: "90%" }}>
            <EtherInput
              placeholder="Fund your smart contract wallet (optional)"
              price={price}
              mode="USD"
              value={amount}
              onChange={setAmount}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
