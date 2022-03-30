const Memo = artifacts.require("Memo");

module.exports = function (deployer) {
  deployer.deploy(Memo);
};
