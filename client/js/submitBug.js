import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../build/contracts/TokenManager.json';
import { default as BigNumber} from 'bignumber.js';

let TokenManager, tmInstance;
let account;

window.App = {
	start: function() {

		self = this;
		self.checkData();

		TokenManager=web3.eth.contract(tokenManagerObject.abi);	
		tmInstance = TokenManager.at(token.managerAddress);
		
		web3.eth.getAccounts((err,accs) => {
			if (err != null) {
				alert(err);
			} else if (accs.length == 0) {
				alert("No accounts detected");
			} else {
				account = accs[0];
			}
		});
	},
			
	submitBug: function() {
		var _desc= $("#description").val();
		var safetyHash = SHA256('' + _desc).toString();
		let _bugId = SHA256(safetyHash + topic.id).toString();

		$.ajax({
			type: 'POST',
			url: '/api/bugs',
			data: {
				bugId: _bugId, 
				updateId: topic._id,
				description: _desc
			},

			success: function(responseData, textStatus, jqXHR) {
				console.log(responseData);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
				console.log(errorThrown);
			}
		});

		let _safetyHash = new BigNumber(safetyHash, 16);
		let updateId = new BigNumber(topic._id, 16);
		tmInstance.foundBug(_safetyHash, updateId, {from: account, gas: 4000000}, (err, result) => {
			if (err) {
				alert(err);
			} else {
				alert(result);
			}
		});	
	},

	checkData: function() {
		console.log(token);
		var _date = new Date(token.creationDate);
		if (SHA256((_date.getTime() / 1000) + token.address + token.managerAddress) != token.id) {
			alert("DANGER, DATA HAS BEEN ALTERED");
		}
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



