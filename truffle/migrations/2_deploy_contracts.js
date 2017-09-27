var CreateToken = artifacts.require("./TokenCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(CreateToken);
};
