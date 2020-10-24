import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
    web3ListRpcProviders,
    web3UseRpcProvider
} from '@polkadot/extension-dapp';

import { ApiPromise, WsProvider } from "@polkadot/api";

import regeneratorRuntime from "regenerator-runtime";

var api;

async function test() {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('my cool dapp');
    
    // returns an array of { address, meta: { name, source } }
    // meta.source contains the name of the extension that provides this account
    const allAccounts = await web3Accounts();
    
    // the address we use to use for signing, as injected
    // const SENDER = allAccounts[0].address;

    const account = allAccounts[0];
    
    // finds an injector for an address
    const injector = await web3FromAddress(account.address);

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
    api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            // mapping the actual specified address format
            Address: 'AccountId',
            // mapping the lookup
            LookupSource: 'AccountId'
          }});

        
    // sign and send our transaction - notice here that the address of the account
    // (as retrieved injected) is passed through as the param to the `signAndSend`,
    // the API then calls the extension to present to the user and get it signed.
    // Once complete, the api sends the tx + signature via the normal process
    const unsub = await api.tx.balances
        .transfer('J8xVDqtrGbUZUPZP5CEGYiK5YAAxZ34zLEjK8CVGZ68Kao7', 1000000000)
        .signAndSend(account.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
            // status would still be set, but in the case of error we can shortcut
            // to just check it (so an error would indicate InBlock or Finalized)
            if (dispatchError) {
              if (dispatchError.isModule) {
                // for module errors, we have the section indexed, lookup
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const { documentation, method, section } = decoded;
        
                console.log(`${section}.${method}: ${documentation.join(' ')}`);
              } else {
                // Other, CannotLookup, BadOrigin, no extra info
                console.log(dispatchError.toString());
              }
              unsub();
            } else {
                if (status.isInBlock) {
                    console.log("in block");
                } else if (status.isFinalized) {
                    console.log("Is finalized");
                    unsub();
                }
            }
          });
}

test();