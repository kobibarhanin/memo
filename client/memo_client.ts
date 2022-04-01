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

const ExitAfter = (
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptor.value = async function (...args: any[]) {
    const result = await originalMethod.apply(this, args);
    process.exit(0);
  };

  return descriptor;
};

export class MemoClient {
  @ExitAfter
  async enroll(alias: string, address: string) {
    const memo = getContractInstance();
    const keyPair = generateKeypair();
    context.addUserToContext({
      alias,
      address,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      mnemonic: "",
    });

    const encodedPublicKey = encode(keyPair.publicKey);

    console.log({ alias, encodedPublicKey, address });
    await memo.methods.enroll(alias, encodedPublicKey).send({
      from: address,
      gas: "1000000",
    });
    console.log(`${alias} enrolled successfully`);
  }

  @ExitAfter
  async sendMemo(alias: string, message: string) {
    const memo = getContractInstance();
    const activeContext = context.getActiveContext();
    const user = activeContext.user;

    const encodedPublicKey = await memo.methods
      .getUserKey(alias)
      .call({ from: user.address });

    const publicKey = decode(encodedPublicKey);
    const encryptedMessage = encrypt(message, publicKey);

    await memo.methods.sendMemo(alias, encryptedMessage).send({
      from: user.address,
      gas: "1000000",
    });
    console.log(`Message sent to ${alias}`);
  }

  @ExitAfter
  async getMemo(index: string) {
    const memo = getContractInstance();
    const activeContext = context.getActiveContext();

    const encryptedMessage = await memo.methods
      .getMemo(index)
      .call({ from: activeContext.user.address });
    const message = decrypt(encryptedMessage.content);
    console.log(`Memo[${index}]: ${message}`);
  }
}
