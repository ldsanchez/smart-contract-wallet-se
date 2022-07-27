import React from "react";

import { Events, Guardians, ManageGuardiansTransactions } from "../components";

export default function ManageGuardians({
  userHasSmartContractWallets,
  contractName,
  address,
  mainnetProvider,
  localProvider,
  tx,
  readContracts,
  writeContracts,
  blockExplorer,
  guardianEvents,
  guardiansRequired,
  contractAddress,
  DEBUG,
}) {
  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div>
        <>
          {userHasSmartContractWallets ? (
            <div>
              <Guardians
                contracts={readContracts}
                contractName="SmartContractWallet"
                eventName="Guardian"
                localProvider={localProvider}
                startBlock={1}
                // guardianEvents={guardianEvents}
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

      <div style={{ padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <ManageGuardiansTransactions
          contractName={contractName}
          contractAddress={contractAddress}
          mainnetProvider={mainnetProvider}
          tx={tx}
          readContracts={readContracts}
          writeContracts={writeContracts}
          DEBUG={DEBUG}
        />
      </div>

      <div>
        <Events
          contracts={readContracts}
          contractName="SmartContractWallet"
          eventName="GuardianRemovalQueued"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>

      <div>
        <Events
          contracts={readContracts}
          contractName="SmartContractWallet"
          eventName="GuardianRemoved"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>

      {/* <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>Queue Guardian for removal:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setOldGuardian(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              tx(writeContracts.SmartContractWallet.initiateGuardianRemoval(oldGuardian));
            }}
          >
            Queue Guardian!
          </Button>
        </div>
        <div>
          <Events
            contracts={readContracts}
            contractName="SmartContractWallet"
            eventName="GuardianRemovalQueued"
            localProvider={localProvider}
            mainnetProvider={mainnetProvider}
            startBlock={1}
          />
        </div>
      </div> */}

      {/* <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>Time Left for Guardian removal:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setOldGuardian(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              tx(writeContracts.SmartContractWallet.timeLeftForGuardianRemoval(oldGuardian));
            }}
          >
            Get Time Left!
          </Button>
        </div>
        <div>
          <div style={{ padding: 8, marginTop: 32 }}>
            <div>Timeleft:</div>
            {timeLeft && timeLeft.toNumber() * 1000}
          </div>
        </div>
      </div> */}

      {/* <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>Cancel Guardian removal:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setOldGuardian(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              tx(writeContracts.SmartContractWallet.cancelGuardianRemoval(oldGuardian));
            }}
          >
            Cancel!
          </Button>
        </div>
      </div>

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>Remove Guardian:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setOldGuardian(e.target.value);
            }}
          />
          <Input
            onChange={e => {
              setNewGuardian(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              tx(writeContracts.SmartContractWallet.executeGuardianRemoval(oldGuardian, newGuardian));
            }}
          >
            Remove Guardian!
          </Button>
        </div>
        <div>
          <Events
            contracts={readContracts}
            contractName="SmartContractWallet"
            eventName="GuardianRemoved"
            localProvider={localProvider}
            mainnetProvider={mainnetProvider}
            startBlock={1}
          />
        </div>
      </div> */}
    </div>
  );
}
