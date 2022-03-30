import cli from "commander";

import { ContextClient } from "./context_client";
import { MemoClient } from "./memo_client";

export class Console {
  memoClient: MemoClient;
  contextClient: ContextClient;

  constructor() {
    this.memoClient = new MemoClient();
    this.contextClient = new ContextClient();
    this.registerCommands();
  }

  async run(command: string[]) {
    await cli.parse(command);
  }

  registerCommands() {
    const commands = this.getCommands();
    for (const command of commands) {
      cli
        .command(command.template)
        .description(command.description)
        .action(command.action);
    }
  }

  getCommands() {
    return [
      {
        name: "enroll",
        description: "Enroll a user",
        template: "enroll <alias> <address>",
        action: this.memoClient.enroll,
      },
      {
        name: "sendMemo",
        description: "Send a memo to user by alias",
        template: "send <alias> <message>",
        action: this.memoClient.sendMemo,
      },
      {
        name: "getMemo",
        description: "Get memo at index",
        template: "get <index>",
        action: this.memoClient.getMemo,
      },
      {
        name: "setUser",
        description: "Sets user context by alias",
        template: "setUser <alias>",
        action: this.contextClient.setUser,
      },
      {
        name: "setNetwork",
        description: "Sets network context",
        template: "setNetwork <network>",
        action: this.contextClient.setNetwork,
      },
    ];
  }
}

const clientConsole = new Console();
clientConsole.run(process.argv);
