import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
    web3ListRpcProviders,
    web3UseRpcProvider
} from '@polkadot/extension-dapp';

import { ApiPromise, WsProvider } from "@polkadot/api";

import { ContractPromise } from "@polkadot/api-contract";

import regeneratorRuntime from "regenerator-runtime";

const abi = require("../contract-files/metadata.json");
const contractAddressJSON = require("../contract-files/contract-address.json");
const contractAddress = contractAddressJSON.address;
const gasLimit = 3000n * 10000000n;

async function connect() {
  const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
  const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
          // mapping the actual specified address format
          Address: 'AccountId',
          // mapping the lookup
          LookupSource: 'AccountId'
        }});

  return api;
}

async function getInjectedAccount() {
  const allInjected = await web3Enable('my cool dapp');

  const allAccounts = await web3Accounts();

  return allAccounts[0];
}

async function enterRaffle(api, value) {
  const account = await getInjectedAccount();

  const injector = await web3FromAddress(account.address);

  const contract = new ContractPromise(api, abi, contractAddress);

  const unsub = await contract.tx
    .enterRaffle(value, gasLimit)
    .signAndSend(account.address, { signer: injector.signer }, (result) => {
      unsubContract(unsub, result);
    });
}

async function draw(api) {
  const account = await getInjectedAccount();

  const injector = await web3FromAddress(account.address);

  const contract = new ContractPromise(api, abi, contractAddress);

  const unsub = await contract.tx
    .enterRaffle(0, gasLimit)
    .draw(account.address, { signer: injector.signer }, (result) => {
      unsubContract(unsub, result);
    });
}

async function getDrawCountdown(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.tx.query.getDrawCountdown(address, 0, gasLimit);

  return callValue.output.toHuman();
}

async function getWinners(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.tx.query.getWinners(address, 0, gasLimit);

  return callValue.output.toHuman();
}

async function numEntries(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.tx.query.numEntries(address, 0, gasLimit);

  return callValue.output.toHuman();
}

async function numWinners(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.tx.query.numWinners(address, 0, gasLimit);

  return callValue.output.toHuman();
}

function unsubContract({ status, dispatchError }, unsub) {
  if (dispatchError) {
    if (dispatchError.isModule) {

      const decoded = api.registry.findMetaError(dispatchError.asModule);
      const { documentation, method, section } = decoded;

      console.log(`${section}.${method}: ${documentation.join(' ')}`);
    } else {
      console.log(dispatchError.toString());
    }
  } else {
    if (status.isInBlock || status.isFinalized) {
      unsub();
    }
  }
}

export { draw, enterRaffle, getDrawCountdown, getWinners, numEntries, numWinners };