import { Context } from "./context/context";

const context = new Context();

export class ContextClient {
  async setUser(alias: string) {
    // TODO: add validation
    context.setMainAttribute("activeUser", alias);
  }

  async setNetwork(network: string) {
    // TODO: add validation
    context.setMainAttribute("network", network);
  }
}
