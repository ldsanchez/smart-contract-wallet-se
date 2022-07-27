import { List } from "antd";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Address from "./Address";

/**
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    mainnetProvider={mainnetProvider}
    startBlock={1}
  />
**/

export default function Events({ contracts, contractName, eventName, localProvider, mainnetProvider, startBlock }) {
  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div style={{ width: 500, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h3>
        {eventName === "GuardianRemovalQueued"
          ? "Guardian Address Hash in Queue -------------------------------"
          : eventName === "GuardianRemoved"
          ? "Old Guardian Address Hash ------- New Guardian Address Hash"
          : eventName === "RecoveryInitiated"
          ? "Guardian -------------------- New Owner Proposed ---- Round"
          : eventName === "RecoverySupported"
          ? "Guardian -------------------- New Owner Proposed ---- Round"
          : eventName === "RecoveryExecuted"
          ? "Old Owner ------------------- New Owner ------------- Round"
          : ""}
      </h3>
      <List
        bordered
        dataSource={events}
        pagination={{ disabled: true, simple: true, defaultPageSize: 1, current: events.length }}
        renderItem={item => {
          return (
            <List.Item key={item.blockNumber + "_" + item.args.sender}>
              <Address address={item.args[0]} ensProvider={mainnetProvider} fontSize={16} />
              <Address address={item.args[1]} ensProvider={mainnetProvider} fontSize={16} />
              {(eventName === "RecoveryInitiated" ||
                eventName === "RecoverySupported" ||
                eventName === "RecoveryExecuted") && (<span>{item.args[2].toString()}</span>)}
            </List.Item>
          );
        }}
      />
    </div>
  );
}
