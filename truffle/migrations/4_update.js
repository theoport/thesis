var Token= artifacts.require("./NewTokenUpdate.sol");

module.exports = function(deployer) {
  deployer.deploy(Token , '0xbf12995f8b12c7ee4a7914ff9c4106a6e7546645', {gas: 4700000});
};

