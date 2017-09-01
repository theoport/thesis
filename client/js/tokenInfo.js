import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../build/contracts/TokenManager.json';

let TokenManager, tmInstance;
let Token, tokenInstance;
let account;

window.App = {
	start: function() {

		self = this;
		self.checkData();

		TokenManager=web3.eth.contract(tokenManagerObject.abi);	
		tmInstance = TokenManager.at(token.managerAddress);
		Token = web3.eth.contract(token.abi);
		tokenInstance = Token.at(token.address);
		
		web3.eth.getAccounts((err,accs) => {
			if (err != null) {
				alert(err);
			} else if (accs.length == 0) {
				alert("No accounts detected");
			} else {
				account = accs[0];
			}
		});
		self.fillPage();
	},
			
	fillPage: function() {
	
		let date = new Date();
		$("#date").html(date);
		
		tmInstance.AUCTIONDURATION((err,result) => {
			$("#auctionDuration").text(result);
		});

		tmInstance.exchange((err, result) => {
			let rate = result[0];
			if (result[1]) {
				$("#exchangeRate").text(rate);
			} else {
				if (rate != 0) {
					rate = 1 / rate;
				}
				$("#exchangeRate").text(rate);
			}
		});

		tmInstance.ETHERBALANCE((err, result) => {
			console.log(result);
			$("#topEther").text(result/1000000000000000000);
		});

		tmInstance.LOWESTETHER((err, result) => {
			console.log(result);
			$("#lowEther").text(result/1000000000000000000);
		});

		web3.eth.getBalance(token.managerAddress, (err,result) => {
			console.log(result);
			$("#etherBalance").text(result);
		});

		tmInstance.BUGEXTENSION((err,result) => {
			$("#bugExtension").text(result);
		});

		tmInstance.BUGHUNT((err,result) => {
			$("#bugHuntDuration").text(result);
		});

		tmInstance.BOUNTYHUNT((err,result) => {
			$("#bountyHuntDuration").text(result);
		});

		tmInstance.UPDATETRIES((err,result) => {
			$("#updateTries").text(result);
		});

		tmInstance.VOTEDURATION((err,result) => {
			$("#voteDuration").text(result);
		});

		tmInstance.consensusPercent((err,result) => {
			$("#consensusPercent").text(result);
		});

		tokenInstance.totalSupply((err,result) => {
			$("#totalToken").text(result);
		});

		tokenInstance.balanceOf(token.managerAddress, (err,result) => {
			$("#centralToken").text(result);
		});

		tmInstance.contractRefunds((err, result) => {
			console.log(result);
			if (result == true){
				$("#refund").html("Yes");
			} else if (result == false){
				$("#refund").html("No");
			}
		});
	
		tmInstance.CHANGEOVERTIME((err, result) => {
			$("#changeOverTime").text(result);
		});

		tmInstance.PRICEHOURRATIO((err, result) => {
			$("#priceHourRatio").text(result);
		});

		tmInstance.version((err,result) => {
			$("#version").text(result);
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




