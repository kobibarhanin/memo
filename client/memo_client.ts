import { Contract } from "web3-eth-contract";
import { Context } from "./context/context";
import {
  decode,
  decrypt,
  encode,
  encrypt,
  generateKeypair,
} from "./utils/crypto";

import { getContractInstance } from "./utils/web3";

const context = new Context();
const memo = getContractInstance();

export class MemoClient {
  async enroll(alias: string, address: string) {
    const keyPair = generateKeypair();
    context.addUserToContext({
      alias,
      address,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      mnemonic: "",
    });

    const encodedPublicKey = encode(keyPair.publicKey);
    await memo.methods.enroll(alias, encodedPublicKey).send({
      from: address,
      gas: "1000000",
    });
    console.log(`${alias} enrolled successfully`);
  }

  async sendMemo(alias: string, message: string) {
    const activeContext = context.getActiveContext();
    const user = activeContext.user;

    const encodedPublicKey = await memo.methods.getUserKey(alias).call();
    const publicKey = decode(encodedPublicKey);
    const encryptedMessage = encrypt(message, publicKey);

    await memo.methods.sendMemo(alias, encryptedMessage).send({
      from: user.address,
      gas: "1000000",
    });
    console.log(`Message sent to ${alias}`);
  }

  async getMemo(index: string) {
    const activeContext = context.getActiveContext();
    const encryptedMessage = await memo.methods
      .getMemo(index)
      .call({ from: activeContext.user.address });
    const message = decrypt(encryptedMessage.content);
    console.log(`Memo[${index}]: ${message}`);
  }
}
