import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../truffle/build/contracts/TokenManager.json';

let TokenManager, tmInstance;
let account;

window.App = {
	start: function() {

		self = this;
	
		self.checkData();

		TokenManager = web3.eth.contract(tokenManagerObject.abi);
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
	setContractRefunds: function() {
	
		tmInstance.setContractRefunds($("#refundAttr").val() * 100, {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});
	},
	setExchangeRate: function () {
		console.log($("#rateAttr").val());
		console.log($("#rateAttr").val() * 100);
		tmInstance.setExchangeRate($("#rateAttr").val() * 100, $("#largerAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},

	setBugBounty: function () {
		console.log($("#bugBountyAttr").val());
		tmInstance.setBugBounty($("#bugBountyAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},
	setBugHunt: function () {
		console.log($("#insectAttr").val());
		tmInstance.setBugHunt($("#insectAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},

	setChangeOverTime: function () {

		console.log($("#changeAttr").val());
		tmInstance.setChangeOverTime($("#changeAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},

	setEtherBalance: function () {
		console.log($("#etherAttr").val());
		let _value = $("#etherAttr").val();
		tmInstance.setEtherBalance(_value, {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},

	setBugExtension: function () {
		console.log($("#bugAttr").val());

		tmInstance.setBugExtension($("#bugAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},
	setBountyHunt: function () {
		console.log($("#bountyAttr").val());

		tmInstance.setBountyHunt($("#bountyAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},
	setUpdateTries: function () {
		console.log($("#triesAttr").val());

		tmInstance.setUpdateTries($("#triesAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});

	},
	setPriceHourRatio: function () {
		console.log($("#ratioAttr").val());

		tmInstance.setPriceHourRatio($("#ratioAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});
		
	},
	setVoteDuration: function () {

		console.log($("#voteAttr").val());
		tmInstance.setVoteDuration($("#voteAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});
	
	},
	setAuctionDuration: function () {

		console.log($("#auctionAttr").val());
		tmInstance.setAuctionDuration($("#auctionAttr").val(), {from: account, gas: 400000}, (err,result) => {
			if (err)
				alert(err);
		});
	},

	setAll: function() {
		self.setAuctionDuration();
		self.setVoteDuration();
		self.setPriceHourRatio();
		self.setUpdateTries();
		self.setBugExtension();
		self.setBountyHunt();
		self.setEtherBalance();
		self.setChangeOverTime();
		self.setBugHunt();
		self.setBugBounty();
		self.setExchangeRate();
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

