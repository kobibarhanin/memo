const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const NodeRSA = require("node-rsa");

const provider = ganache.provider();
const web3 = new Web3(provider);
const Memo = require("../build/contracts/Memo.json");

let memo;
let accounts;

async function deploy(web3, provider, contract, user) {
  instance = await new web3.eth.Contract(contract.abi)
    .deploy({ data: contract.bytecode })
    .send({ from: user, gas: "3000000" });
  return instance;
}

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  memo = await deploy(web3, provider, Memo, accounts[0]);
});

describe("Memo", () => {
  it("deploys a memo contract", () => {
    assert.ok(memo.options.address);
  });

  it("enrolls a user to memo", async () => {
    alias = "user0";
    const key = new NodeRSA({ b: 512 });
    pub_key_raw = key.exportKey("public");

    const buf = Buffer.from(pub_key_raw, "ascii");
    pub_key_enc = "0x" + buf.toString("hex");
    await memo.methods.enroll(alias, pub_key_enc).send({
      from: accounts[0],
      gas: "1000000",
    });

    const ualias = await memo.methods.getUserAlias(accounts[0]).call();
    assert.ok(ualias == alias);
  });

  it("fails to enroll another user with same alias", async () => {
    alias = "user0";
    const key = new NodeRSA({ b: 512 });
    pub_key_raw = key.exportKey("public");

    const buf = Buffer.from(pub_key_raw, "ascii");
    pub_key_enc = "0x" + buf.toString("hex");
    rv = await memo.methods.enroll(alias, pub_key_enc).send({
      from: accounts[0],
      gas: "1000000",
    });

    const re_enroll = async () =>
      await memo.methods.enroll(pub_key_enc, alias).send({
        from: accounts[0],
        gas: "1000000",
      });

    await assert.rejects(re_enroll);
  });

  it("send memo without encryption", async () => {
    alias = "user0";
    const key = new NodeRSA({ b: 512 });
    pub_key_raw = key.exportKey("public");

    const buf = Buffer.from(pub_key_raw, "ascii");
    pub_key_enc = "0x" + buf.toString("hex");
    await memo.methods.enroll(alias, pub_key_enc).send({
      from: accounts[0],
      gas: "1000000",
    });

    alias2 = "user1";
    const key2 = new NodeRSA({ b: 512 });
    pub_key_raw2 = key.exportKey("public");

    const buf2 = Buffer.from(pub_key_raw, "ascii");
    pub_key_enc2 = "0x" + buf2.toString("hex");
    await memo.methods.enroll(alias2, pub_key_enc2).send({
      from: accounts[1],
      gas: "1000000",
    });

    await memo.methods.sendMemo(alias2, "hello there!").send({
      from: accounts[0],
      gas: "1000000",
    });

    const rv = await memo.methods.getMemo(0).call({ from: accounts[1] });

    assert.ok(rv.source == accounts[0]);
    assert.ok(rv.content == "hello there!");
  });
});
