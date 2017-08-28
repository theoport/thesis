import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../build/contracts/TokenManager.json';

let activeAuction, highestBid;

window.App = {
	start: function() {

		self = this;
		self.checkData();
		self.fillPage();
	},

	fillPage: function() {
		
		finishedAuctions = [];
	
		auctionStart = tmInstance.AuctionStarted();	
		auctionFinish = tmInstance.AuctionFinished();

		auctionFinish.get((err, auctionEnds) => {
			for (var i = 0; i < auctionEnds.length ; i++) {
				finishedAuctions.push(auctionEnds[i].args.auctionId);	
			}
			auctionStart.get((err,auctionStarts) => {
				for (var i = 0; i <auctionStarts.length; i++) {
					if ($.inArray(auctionStarts[i].args.auctionId, finishedAuctions) < 0) {
						activeAuction = auctionStarts[i].args.auctionId);
						$("#auctionId").html(auctionStarts[i].args.auctionId);
						$("#amountOfToken").html(auctionStarts[i].args.amount);
						var finishDate = new Date(auctionStarts[i].args.finishTime * 1000);
						$("#auctionEndTime").html(finishDate);	
						newHighestBid = tmInstance.NewHighestBid({auctionId: activeAuction});
						highestBid = 0;
						newHighestBid.get((err, bids) =>{
							for (var i = 0; i < bids.length ; i++){
								if (bids[i].args.amount > highestBid) {
									highestBid = bids[i].args.amount;
								}
							}
						});

						$("#highesBid").html(highestBid);
						tmInstance.getWithdrawable(account, (err, withdrawable) => {
							if (typeof(withdrawable) == 'undefined') {
								withdrawable = 0;
							}
							$("#pastBets").html(withdrawable);
							self.startWatch();
						});
						return;
					}
				}
			$(document).html("<p>Error: No active auctions</p>");
			});
		});
	},
	
	startWatch(): function() {	
						newHighestBid.get((err, bids) =>{
							for (var i = 0; i < bids.length ; i++){
								if (bids[i].args.amount > highestBid) {
									highestBid = bids[i].args.amount;
								}
							}
						});

						$("#highesBid").html(highestBid);
						tmInstance.getWithdrawable(account, (err, withdrawable) => {
							if (typeof(withdrawable) == 'undefined') {
								withdrawable = 0;
							}
							$("#pastBets").html(withdrawable);
							self.startWatch();
						});

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


