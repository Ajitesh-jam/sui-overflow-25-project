"use client";
import React from "react";
import { Button } from "@mui/material";
import { ResultTooltip } from "@wellcode/ui";

import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";
import { useWalletLinkProviderModal } from "@wellcode/walletlink-provider-modal-react-native-dapp";
import { useWalletConnectProviderModal } from "@wellcode/walletconnect-provider-modal-react-native-dapp";


function getProvider() {
    const [provider, setProvider] = React.useState(false);
    function handleProvider() {
      if (!window.dapp) {
        alert('Please install WELLDONE Wallet extension');
      } else {
        setProvider(true);
      }
    }
    return (
      <>
        <Button onClick={handleProvider} type="buton">
          Get Provider
        </Button>
        {provider && (
          <ResultTooltip style={{ background: '#3B48DF' }}>
            <b>Success</b>
          </ResultTooltip>
        )}
      </>
    );
  }


function ConnectWallet() {
    const [address, setAddress] = React.useState(null);
    const [pubKey, setPubKey] = React.useState(null);
    async function getAccounts() {
      // request connection to WELLDONE extension
      const accounts = await window.dapp.request('ethereum', {
        method: 'dapp:accounts',
      });
      // check if accounts exists
      if (Object.keys(accounts).length !== 0) {
        setAddress(accounts.ethereum.address);
        setPubKey(accounts.ethereum.pubKey);
      }
    }
    return (
      <>
        <Button onClick={getAccounts}>Connect Wallet</Button>
        {address && (
          <ResultTooltip style={{ background: '#3B48DF' }}>
            <b>address: </b> {address} <br />
            <b>pubKey: </b> {pubKey}
          </ResultTooltip>
        )}
      </>
    );
  }


export default function Page() {
    const [isConnected, setIsConnected] = React.useState(false);
    const [isProvider, setIsProvider] = React.useState(false);
    const [address, setAddress] = React.useState(null);
    const [pubKey, setPubKey] = React.useState(null);

    return (
      <div>
        <h1>WELLDONE Wallet</h1>
        <h2>Connect to WELLDONE Wallet</h2>
        <div>
       
          <ConnectWallet />
        </div>
      </div>
    );
  }  