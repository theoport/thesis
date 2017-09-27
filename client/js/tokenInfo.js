import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../truffle/build/contracts/TokenManager.json';
import { default as tokenObject } from '../../truffle/build/contracts/NewToken.json';

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

		console.log(token.abi);	
		console.log(token.address);
		console.log(token.managerAddress);
		
		web3.eth.getAccounts((err,accs) => {
			if (err != null) {
				alert(err);
			} else if (accs.length == 0) {
				alert("No accounts detected");
			} else {
				account = accs[0];
			}
			console.log(account);
			self.fillPage();
		});

	},
			
	fillPage: function() {
	
		let date = new Date();
		console.log(date);
		$("#date").html(date);
		
		tmInstance.AUCTIONDURATION((err,result) => {
			$("#auctionDuration").text(result/60);
		});

		tmInstance.exchange((err, result) => {
			console.log(result);
			let rate = result[0];
			if (result[1]) {
				$("#exchangeRate").text(rate/100);
			} else {
				if (rate != 0) {
					rate = 1 / rate;
				}
				$("#exchangeRate").text(rate);
			}
		});

		tmInstance.ETHERBALANCE((err, result) => {
			$("#topEther").text(result/1000000000000000000); });

		tmInstance.LOWESTETHER((err, result) => {
			$("#lowEther").text(result/1000000000000000000);
		});

		web3.eth.getBalance(token.managerAddress, (err,result) => {
			$("#etherBalance").text(result);
		});

		tmInstance.BUGEXTENSION((err,result) => {
			$("#bugExtension").text(result/60);
		});

		tmInstance.BUGHUNT((err,result) => {
			$("#bugHuntDuration").text(result/60);
		});

		tmInstance.BOUNTYHUNT((err,result) => {
			$("#bountyHuntDuration").text(result/60);
		});

		tmInstance.UPDATETRIES((err,result) => {
			$("#updateTries").text(result);
		});

		tmInstance.VOTEDURATION((err,result) => {
			$("#voteDuration").text(result/60);
		});
		tmInstance.CONSENSUSPERCENT((err,result) => {
			$("#consensusPercent").text(result);
		});

		tokenInstance.getTotalSupply({from: account, gas: 4000000},(err,result) => {
			console.log("HELOY");	
			console.log(result);
			console.log(err);
			$("#totalToken").text(result);
		});

		tokenInstance.balanceOf(token.managerAddress, (err,result) => {
			$("#centralToken").text(result);
		});

		tmInstance.contractRefunds((err, result) => {
			if (result == true){
				$("#refund").html("Yes");
			} else if (result == false){
				$("#refund").html("No");
			}
		});
	
		tmInstance.CHANGEOVERTIME((err, result) => {
			$("#changeOverTime").text(result/60);
		});

		tmInstance.PRICEHOURRATIO((err, result) => {
			$("#priceHourRatio").text(result);
		});

		tmInstance.version((err,result) => {
			$("#version").text(result);
		});
	},

	checkData: function() {
		console.log(token.creationDate);
		let _date = new Date(token.creationDate);
		let _dateNow = new Date();
		let _testDate = new Date(_date.getTime());
		let _testDate2 = new Date(_dateNow.getTime());
			
		console.log(_testDate);
		console.log(_testDate2);
	
		console.log(_date);
		console.log(_date.getTime()/1000);
		console.log(_date.getTime());

		console.log(_dateNow);
		console.log(_dateNow.getTime()/1000);
		console.log(_dateNow.getTime());
	

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




