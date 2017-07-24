//var ConvertLib = artifacts.require("./ConvertLib.sol");
var CreateCoin = artifacts.require("./CoinCreator.sol");

module.exports = function(deployer) {
  deployer.deploy(CreateCoin);
};
