var TokenManager = artifacts.require("./TokenManager.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenManager,6000, 'theCoin', 60, [0,10], 12000, false, {gas: 4700000});
};
