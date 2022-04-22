import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';
import * as nearAPI from 'near-api-js';

import NearWalletSelector, { AccountInfo } from "@near-wallet-selector/core";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";

import nearWalletIconUrl from "@near-wallet-selector/near-wallet/assets/near-wallet-icon.png";
import senderWalletIconUrl from "@near-wallet-selector/sender/assets/sender-icon.png";


// Initializing contract
async function initContract() {
    // get network configuration values from config.js
    // based on the network ID we pass to getConfig()
    const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

    const selector = await NearWalletSelector.init({
        network: nearConfig.networkId,
        contractId: nearConfig.contractName,
        wallets: [
            setupNearWallet({'iconUrl': nearWalletIconUrl}),
            setupSender({'iconUrl': senderWalletIconUrl}),
        ],
    });

    selector.on("signIn", () => window.location.replace(window.location.origin + window.location.pathname));
    selector.on("signOut", () => window.location.replace(window.location.origin + window.location.pathname));

    window.selector = selector;

    // Load in user's account data
    let currentUser;
    if (selector.isSignedIn()) {
        const account = (await selector.getAccounts())[0];

        const provider = new nearAPI.providers.JsonRpcProvider({
            url: selector.network.nodeUrl,
        });

        currentUser = {
            // Gets the accountId as a string
            accountId: account.accountId,
            // Gets the user's token balance
            balance: (await provider.query(`account/${account.accountId}`, "")).amount
        };
    }

    return { selector, currentUser, nearConfig };
}

window.nearInitPromise = initContract().then(
  ({ selector, currentUser, nearConfig }) => {
    ReactDOM.render(
      <App
        selector={selector}
        currentUser={currentUser}
        nearConfig={nearConfig}
      />,
      document.getElementById('root')
    );
  }
);
