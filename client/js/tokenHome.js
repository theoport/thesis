import {default as Web3} from 'web3';
import {default as SHA256} from 'crypto-js/sha256';
import tokenObject from '../../build/contracts/NewToken.json';


let Token;
let tokenAddress, tokenInstance;
let account;

window.App = {
	start: function() {
		
		self = this;

		self.checkData();
		self.setAccountInfo();

		Token = web3.eth.contract(tokenObject.abi);
		tokenAddress = token.address;
		tokenInstance = Token.at(tokenAddress);
	
		self.loadWallet();	
	},
		

	checkData: function() {
		
		if (SHA256(token.creationTime.toNumber() + token.address + token.managerAddress) != token.id) {
			alert("DANGER, DATA HAS BEEN ALTERED");
		}
	},

	setAccountInfo: function(){
		var accounts = web3.eth.accounts;
		account = accounts[0];
	},

	loadWallet: function() {
		var balance = tokenInstance.balanceOf(account);
		$("#accountBalance").html(balance);
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
