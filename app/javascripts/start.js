import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import createtoken_artifacts from '../../build/contracts/TokenCreator.json'
import newtoken_artifacts from '../../build/contracts/NewToken.json'
import tokenmanager_artifacts from '../../build/contracts/TokenManager.json'

let NewToken = contract(newtoken_artifacts);
let CreateToken= contract(createtoken_artifacts);
let TokenManager = contract(tokenmanager_artifacts);

let accounts;
let account;
let createTokenInstance;
let tokenManagerInstance;
let newTokenInstance;
let createTokenEvent;
let tokenAddresses = [];

window.App = {
	start: function() {
		let self = this;
		CreateToken.setProvider(web3.currentProvider);
		//NewToken.setProvider(web3.currentProvider);
		//TokenManager.setProvider(web3.currentProvider);
		createTokenInstance = CreateToken.deployed;
		createTokenManagerEvent = createTokenInstance.TokenManagerCreated();

		/*CreateToken.deployed().then(function(instance){
			createTokenEvent = instance.TokenCreated();	
		*/

			createTokenManagerEvent.watch(function (err, result) {

				if (err) {
					console.log(error);
				} else {
					self.setStatus(web3.toAscii(result.args.tokenName)+" created at "+result.args.tokenAddress);
					tokenAddresses.push[result.args.tokenName, result.args.tokenAddress];
					

					/*var newtoken = NewToken.at(address); 
					var defaultAddress = web3.eth.accounts[0];
					var balance = web3.eth.getBalance(defaultAddress);
					console.log("Balance is " + balance);
					newtoken.balanceOf(defaultAddress).then(function (result){
						var initial = result;
						console.log("Initial supply is " + initial);
						balance = web3.eth.getBalance(defaultAddress);
						console.log("Balance is " + balance);
					});*/

			}
			let option = document.createElement("option");
			option.text = tokenAddresses[tokenAddresses.length - 1];
			$("#tokenList").add(option);
		})
		//});
		web3.eth.getAccounts(function(err,accs){
			if (err != null) {
				alert("Error getting your accounts");
				return;
			}
			if (accs.length == 0) {
				alert("You don't have any accounts");
				return;
			}
			else {
				alert("You have "+accs.length+" accounts");
			}
			accounts = accs;
			account = accounts[0];
		});
	},
	
	setStatus: function(msg){
		var status = document.getElementById("status");
		status.innerHTML = msg;
	},

	makeNewCoin: function(){
		var name = $("#name").value;
		var amount = $("#initialAmount").value;
		var creator;
		CreateCoin.deployed().then(function(instance){
			creator = instance;
			creator.makeNewCoin(amount, name, {from: account, gas: 400000});
		}).catch(function(e) {
			console.log(e);
			self.setStatus("Error creating new Coin");
		});
	}
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
	
			
