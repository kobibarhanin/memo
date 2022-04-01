import fs from "fs-extra";
import NodeRSA from "node-rsa";
import os from "os";

import { contextTemplate } from "./context.template";
import { DeepPartial } from "../utils/types";

const HOME = os.homedir();
const MEMO_DIR = `${HOME}/.memo`;
const CONTEXT_FILE = `${MEMO_DIR}/context.json`;

interface Provider {
  type: string;
  gw: string;
}

interface Network {
  type: "local" | "rinkeby";
  contract: string;
  provider: Provider;
}

interface User {
  alias: string;
  address: string;
  mnemonic: string;
  publicKey: string;
  privateKey: string;
}

interface ActiveContext {
  network: Network;
  user: User;
}

export class Context {
  constructor() {
    // set context template if not existing
    fs.ensureDirSync(MEMO_DIR);
    if (!fs.existsSync(CONTEXT_FILE)) {
      this.generateContext();
    }
  }

  private generateContext() {
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(contextTemplate), "utf8");
  }

  getContext() {
    return JSON.parse(fs.readFileSync(CONTEXT_FILE, "utf8"));
  }

  getActiveContext(): ActiveContext {
    const context = this.getContext();
    const networkType = context.activeNetwork;
    const userName = context.activeUser;

    return {
      network: context["networks"][networkType],
      user: context["networks"][networkType]["users"][userName],
    };
  }

  updateActiveContext(updatesToContext: DeepPartial<ActiveContext>) {
    const activeContext = this.getActiveContext();
    const updateActiveContext = {
      network: {
        ...activeContext.network,
        ...updatesToContext.network,
      },
      user: {
        ...activeContext.user,
        ...updatesToContext.user,
      },
    };

    const networkType = activeContext.network.type;
    const userName = activeContext.user.alias;

    const context = this.getContext();
    context["networks"][networkType] = updateActiveContext.network;
    context["networks"][networkType]["users"][userName] =
      updateActiveContext.user;

    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  }

  addUserToContext(newUser: User) {
    const activeContext = this.getActiveContext();

    const networkType = activeContext.network.type;
    const userName = newUser.alias;

    const context = this.getContext();
    context["networks"][networkType]["users"][userName] = newUser;

    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  }

  setPublicKey(key: string) {
    this.updateActiveContext({ user: { publicKey: key } });
  }

  setPrivateKey(key: string) {
    this.updateActiveContext({ user: { privateKey: key } });
  }

  getPublicKey() {
    return this.getActiveContext().user.publicKey;
  }

  getPrivateKey() {
    return this.getActiveContext().user.privateKey;
  }

  setMainAttribute(attribute: string, value: string) {
    const context = this.getContext();
    context[attribute] = value;
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify(context, null, 2));
  }

  getMnemonic() {
    return fs.readFileSync(`${MEMO_DIR}/mnemonic.secret`).toString().trim();
  }
}
