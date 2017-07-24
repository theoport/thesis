import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import createcoin_artifacts from '../../build/contracts/CoinCreator.json'
import newtoken_artifacts from '../../build/contracts/NewToken.json'

var NewToken = contract(newtoken_artifacts);
var CreateCoin = contract(createcoin_artifacts);

var accounts;
var account;
var contractInstance;
var createCoinEvent;

window.App = {
	start: function() {
		CreateCoin.setProvider(web3.currentProvider);
		contractInstance = CreateCoin.deployed();
		createCoinEvent = contractInstance.CoinCreated;
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
		var self = this;
		var name = document.getElementById("name").value;
		var amount = document.getElementById("amount").value;
		var creator;
		var newtoken;
		var _address;
		console.log("Check1");
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
	
			
