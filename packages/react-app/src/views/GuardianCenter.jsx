import React from "react";

import { Events, GuardianCenterTransactions } from "../components";

export default function GuardianCenter({ address, mainnetProvider, localProvider, tx, readContracts, writeContracts }) {
  return (
    <div>
      <div style={{ padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <GuardianCenterTransactions
          mainnetProvider={mainnetProvider}
          tx={tx}
          readContracts={readContracts}
          writeContracts={writeContracts}
        />
      </div>
      <div>
        <h2>Initiator</h2>
        <Events
          contracts={readContracts}
          contractName="SmartContractWallet"
          eventName="RecoveryInitiated"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
      <div>
        <h2>Supporters</h2>
        <Events
          contracts={readContracts}
          contractName="SmartContractWallet"
          eventName="RecoverySupported"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
      <div>
        <h2>Recovery</h2>
        <Events
          contracts={readContracts}
          contractName="SmartContractWallet"
          eventName="RecoveryExecuted"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={1}
        />
      </div>
    </div>
  );
}
