var TokenManager= artifacts.require("./TokenManager.sol");

module.exports = function(deployer) {
  deployer.deploy(TokenManager, 6000, 'theCoin', 75, [10,0], 100000, false, {gas: 4700000, value: 1000000000});
};
