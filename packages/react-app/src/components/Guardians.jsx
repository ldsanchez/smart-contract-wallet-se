import React from "react";
import { List, Spin, Collapse } from "antd";
import Address from "./Address";

const { Panel } = Collapse;

export default function Guardians({ guardianEvents, guardiansRequired, mainnetProvider, blockExplorer }) {
  const guardians = new Set();
  const prevGuardians = new Set();
  guardianEvents.forEach(guardianEvent => {
    if (guardianEvent.args.added) {
      guardians.add(guardianEvent.args.guardian);
      prevGuardians.delete(guardianEvent.args.guardian);
    } else {
      prevGuardians.add(guardianEvent.args.guardian);
      guardians.delete(guardianEvent.args.guardian);
    }
  });

  return (
    <div>
      <h2 style={{ marginTop: 32 }}>
        Guardians Required: {guardiansRequired ? guardiansRequired.toNumber() : <Spin></Spin>}
      </h2>
      <List
        header={<h2>Guardians Address Hashes</h2>}
        style={{ maxWidth: 400, margin: "auto", marginTop: 32 }}
        bordered
        dataSource={[...guardians]}
        renderItem={guardianAddressHash => {
          return (
            <List.Item key={"owner_" + guardianAddressHash}>
              <Address
                address={guardianAddressHash}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={24}
              />
            </List.Item>
          );
        }}
      />

      <Collapse
        collapsible={prevGuardians.size === 0 ? "disabled" : ""}
        style={{ maxWidth: 400, margin: "auto", marginTop: 10 }}
      >
        <Panel header="Previous Guardians" key="1">
          <List
            dataSource={[...prevGuardians]}
            renderItem={prevGuardianAddressHash => {
              return (
                <List.Item key={"owner_" + prevGuardianAddressHash}>
                  <Address
                    address={prevGuardianAddressHash}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={24}
                  />
                </List.Item>
              )
            }}
          />
        </Panel>
      </Collapse>
    </div>
  );
}
