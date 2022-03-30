import fs from "fs-extra";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { Context } from "../context/context";
import * as path from 'path'

const CONTRACT_FILE = path.join(__dirname, "../../build/contracts/Memo.json");
const context = new Context();

export function getContractInterface() {
  return JSON.parse(fs.readFileSync(CONTRACT_FILE, "utf8"));
}

export function getWeb3Provider() {
  const activeContext = context.getActiveContext();
  let provider;
  if (activeContext.network.type == "local") {
    // TODO: get url from context here
    provider = new Web3.providers.HttpProvider("http://localhost:7545");
  } else {
    const mnemonicPhrase = activeContext.user.mnemonic;
    const gw = activeContext.network.provider.gw;
    provider = new HDWalletProvider({
      mnemonic: {
        phrase: mnemonicPhrase,
      },
      providerOrUrl: gw,
    });
  }

  return new Web3(provider);
}

export function getContractInstance(): Contract {
  const web3 = getWeb3Provider();
  const contract = getContractInterface();
  const address = context.getActiveContext().network.contract;
  const instance = new web3.eth.Contract(contract.abi);
  instance.options.address = address;
  return instance;
}

export function getAccounts() {
  return getWeb3Provider().eth.getAccounts();
}
