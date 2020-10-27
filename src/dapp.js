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
  const api = await ApiPromise.create({
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

  console.log(value);

  value = 100000000000000;

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
    .draw(0, gasLimit)
    .signAndSend(account.address, { signer: injector.signer }, (result) => {
      unsubContract(unsub, result);
    });
}

async function getDrawCountdown(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.query.getDrawCountdown(address, 0, gasLimit);

  return callValue.output.toHuman();
}

async function getDrawCountdownSubscription(api, setFunction) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  let currentCountdown = null;

  const unsub = await api.query.contracts.contractInfoOf(contractAddress, async () => {
    const callValue = await contract.query.getDrawCountdown(address, 0, gasLimit);

    if (callValue.output.toHuman() != currentCountdown) {
      currentCountdown = callValue.output.value;
      console.log(currentCountdown);
      setFunction(currentCountdown / 1000);
    }
  });

  return unsub;
}

async function getWinners(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.query.getWinners(address, 0, gasLimit);

  const winner1 = callValue.output[0].toHex() == "null" ? callValue.output[0].toHex() : "No winner yet";
  const winner2 = callValue.output[1].toHex() == "null" ? callValue.output[1].toHex() : "No winner yet";

  return [winner1, winner2]
}

async function getWinnersSubscription(api, setFunction) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  let currentWinners = [null, null];

  const unsub = api.query.contracts.contractInfoOf(contractAddress, async (_) => {
    const callValue = await contract.query.getWinners(address, 0, gasLimit);

    const winner1 = callValue.output[0].toHuman() != null ? callValue.output[0].toHex() : "null";
    const winner2 = callValue.output[1].toHuman() != null ? callValue.output[1].toHex() : "null";

    const winners = [winner1, winner2];

    if (winner1 != currentWinners[0] || winner2 != currentWinners[1]) {
      setFunction(winners);
      currentWinners = winners;
    }
  });

  return unsub;
}

async function numEntries(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.query.numEntries(address, 0, gasLimit);

  return callValue.output.toHuman();
}

async function numEntriesSubscription(api, setFunction) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  let currentEntries = null;

  const unsub = api.query.contracts.contractInfoOf(contractAddress, async (_) => {
    const callValue = await contract.query.numEntries(address, 0, gasLimit);

    if (callValue.output.toHuman() != currentEntries) {
      setFunction(callValue.output.toHuman());
      currentEntries = callValue;
    }
  });

  return unsub;
}

async function numWinners(api) {
  const contract = new ContractPromise(api, abi, contractAddress);

  const address = await getInjectedAccount().address;

  const callValue = await contract.query.numWinners(address, 0, gasLimit);

  return callValue.output.toHuman();
}

function unsubContract(unsub, { status, dispatchError }) {
  if (dispatchError) {
    if (dispatchError.isModule) {

      const decoded = api.registry.findMetaError(dispatchError.asModule);
      const { documentation, method, section } = decoded;

      console.log(`${section}.${method}: ${documentation.join(' ')}`);
    } else {
      console.log(dispatchError.toString());
    }

    unsub();
  } else {
    if (status.isInBlock || status.isFinalized) {
      unsub();
    }
  }
}

export { 
  draw, 
  connect, 
  enterRaffle, 
  getDrawCountdown, 
  getDrawCountdownSubscription,
  getWinners, 
  getWinnersSubscription,
  numEntries, 
  numEntriesSubscription, 
  numWinners 
};