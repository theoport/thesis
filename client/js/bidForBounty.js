import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../build/contracts/TokenManager.json';

let activeBounty, bestBounty, bountyHunter, account;
let finishedBounties;
let newBestBounty, bountyStart, bountyFinish;
let priceHourRatio;
let TokenManager, tmInstance;
let loadBlock;

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
			tmInstance.PRICEHOURRATIO((err,result) => {
				if (err) {
					alert(err); 
				} else {
					priceHourRatio = result;
				}
				web3.eth.getBlockNumber((err, result) => {
					loadBlock = result;	
					self.fillPage();
				});
			});
		});
	},

	fillPage: function() {
	
		self = this;	
	
		finishedBounties= [];
	
		bountyStart = tmInstance.BountyStarted({}, {fromBlock: 0, toBlock: 'latest'});	
		bountyFinish = tmInstance.BountyEnd({}, {fromBlock: 0, toBlock: 'latest'});

		bountyFinish.get((err, bountyEnds) => {
			for (let i = 0; i < bountyEnds.length ; i++) {
				finishedBounties.push(bountyEnds[i].args.updateId.toString(16));	
			}
			bountyStart.get((err,bountyStarts) => {
				for (let i = 0; i < bountyStarts.length; i++) {
					if ($.inArray(bountyStarts[i].args.updateId.toString(16), finishedBounties) < 0) {
						activeBounty= bountyStarts[i].args.updateId.toString(16);
						let finishDate = new Date(bountyStarts[i].args.finishTime * 1000);
						console.log(finishDate);
						$("#bountyEndTime").text(finishDate);	
						newBestBounty = tmInstance.NewBountyPrice({updateId: bountyStarts[i].args.updateId},{fromBlock: 0, toBlock: 'latest'});
						bestBounty = Number.MAX_VALUE;
						newBestBounty.get((err, bids) =>{
							for (let i = 0; i < bids.length ; i++){
								if (bids[i].args.amount < bestBounty) {
									bestBounty = bids[i].args.amount;
									bountyHunter= bids[i].args.bidder;
								}
							}
							if (bountyHunter== account) {
								$("#youWin").text("Congrats! You hold the best bounty.");
							}
							if (bids.length == 0) {
								$("#bestBounty").text("NO BIDS");
								$("#currentHours").html("<i>undefined</i>");
							} else {	
								$("#bestBounty").text(bestBounty);
								let hours = bestBounty / priceHourRatio;
								$("#currentHours").html(hours);
							}
							self.startWatch();
						});
						return;
					}
				}
			$(document).html("<p>Error: No active BountyHunts</p>");
			});
		});
	},
	
	startWatch: function() {	
		newBestBounty.watch((err, bounty) =>{
			console.log("loadBlock is " + loadBlock);
			console.log("bounty block is " + bounty.blockNumber);
			console.log("best bounty is " + bestBounty);
			console.log("hunter is " + bountyHunter);
			console.log("pricehourratio is " + priceHourRatio);
			if (bounty.blockNumber != loadBlock) {
				if (bounty.args.amount < bestBounty) {
					bestBounty = bounty.args.amount;
					bountyHunter= bounty.args.bidder;
				}
				console.log("best bounty is " + bestBounty);
				console.log("hunter is " + bountyHunter);
				if (bountyHunter == account) {
					$("#youWin").html("Congrats! You hold the best bounty.");
				} else {
					$("#youWin").html("");
				}
				$("#bestBounty").text(bestBounty);
				let hours = bestBounty / priceHourRatio;
				$("#currentHours").html(hours);
			}
		});
	},

	updateHours: function(price) {
		let hours = price / priceHourRatio; 
		$("#hours").html(hours);	
	},
			
	submitBid: function() {
		let _value = $("#bid").val();
		tmInstance.bidForBounty(_value, {from: account, gas: 4000000}, (err,result) => {
			if (err) {
				alert(err);
			} else {
				alert(result);
			}
		});
	},
			

	checkData: function() {
		console.log(token);
		let _date = new Date(token.creationDate);
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



