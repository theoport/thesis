import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../build/contracts/TokenManager.json';
import { default as BigNumber} from 'bignumber.js';

let TokenManager, tmInstance;
let account;
let updateNames = new Map();

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
				self.fillPage();
			}
		});
	},
		
	fillPage: function() {

		let voteStart = tmInstance.VoteStarted({}, {fromBlock: 0, toBlock: 'latest'});
		let voteFinish = tmInstance.VotingOutcome({}, {fromBlock: 0, toBlock: 'latest'});	
		let finishedVotes = [];
		let activeVote = [];
	
		voteFinish.get((err, voteEnds) => {
			for (let i = 0; i < voteEnds.length ; i++) {
				finishedVotes.push(voteEnds[i].args.tag.toString());
			}
			console.log(finishedVotes);
			voteStart.get((err, voteStarts) => {
				for (let i = 0; i < voteStarts.length ; i++) {
					if ($.inArray(voteStarts[i].args.tag.toString(), finishedVotes) < 0) {
						if (voteStarts[i].args.tag[0] == 0){
							
							let finishDate = new Date(voteStarts[i].args.finishTime * 1000);

							activeVote[0] = voteStarts[i].args.tag[0];	
							activeVote[1] = voteStarts[i].args.tag[1].toString(16);;	
							activeVote[2] = voteStarts[i].args.tag[2].toString(16);	
							console.log(activeVote);
							$("#voteInfo").html("<h4>Vote on Update " +
							"<a href=\"/tokenHome/" + token.id + "/forum/" +
							activeVote[1] + "\" target=\"_blank\">" +
							activeVote[1] + "</a></h4>" +
							"<h6>Developer: <span id=\"developer\"></span></h6>" +	
							"<h6>Price: <span id=\"price\"></span> " + token.name + "</h6>" +	
							"<h6>Time they get: <span id=\"time\"></span> Hours</h6>" +	
							"<h6>Description:</h6>" +	
							"<div id=\"description\"></div>" +
							"<p>Vote Count:<br>" +
							"<span id=\"yesVotes\">0</span>% are in favour update <br>" +
							"<span id=\"noVotes\">0</span>% are against the update <br>" +
							"<span id=\"consensus\"></span>% required to pass<br>" +
							"Vote finished on: " + finishDate + "</p>");
						
							let newVote = tmInstance.NewVote({tag: voteStarts[i].args.tag}, {fromBlock: 0, toBlock: 'latest'});	
							let bountyStart = tmInstance.BountyStarted({updateId: voteStarts[i].args.tag[1]}, {fromBlock: 0, toBlock: 'latest'});
							let bountyEnd = tmInstance.BountyEnded({updateId: voteStarts[i].args.tag[1]}, {fromBlock: 0, toBlock: 'latest'});
						
							bountyStart.get((err, bountyStarts) => {
								if (bountyStarts.length != 1) {
									console.log("bounty starts above 1 " + bountyStarts);
									console.log(bountyStarts);
								} else {
									let bountyId = SHA256(bountyStarts[0].args.safetyHash.toString(16) + bountyStarts[0].args.updateId.toString(16)).toString();
								
									$.ajax({
										type: 'GET',
										url: '/api/bounty/' + bountyId,
										datatype: 'json',
										success: function(responseData, textStatus, jqXHR) {
											console.log("response data is");
											console.log(responseData);
											if (SHA256(SHA256(responseData.description).toString() + responseData.updateId).toString() != responseData.bountyId) {
												alert("Data ain't safe");		
											} else {
												$("#description").text(responseData.description);
											}
										}
									});
								}
							});

							bountyEnd.get((err, bountyEnds) => {
								if (bountyEnds.length != 1) {
									console.log("bounty ends length not 1" + bountyEnds);
									console.log(bountyEnds);
								} else {
									$("#developer").text(bountyEnds[0].args.winner);
									let price = bountyEnds[0].args.price;
									$("#price").text(price);
									tmInstance.PRICEHOURRATIO((err, ratio) => {
										$("#time").text(price / ratio);
									});
								}
							});

							newVote.get((err, votes) => {
								for(let i = 0; i < votes.length ; i++) {
									$("#yesVotes").text(votes[i].args.yes);		
									$("#noVotes").text(votes[i].args.no);		
									if (votes[i].args.from == account){
										alert("You have already votes from this address." +
										"If you want to vote with newly reveived funds, place them into another account and vote from there."); 
									}
								}	
							});
							 
							tmInstance.consensusPercent((err,result) => {
								$("#consensus").text(result);
							});

						} else if (voteStarts[i].args.tag[0] == 1){

							let finishDate = new Date(voteStarts[i].args.finishTime * 1000);
							activeVote[0] = voteStarts[i].args.tag[0];	
							activeVote[1] = voteStarts[i].args.tag[1].toString(16);;	
							activeVote[2] = voteStarts[i].args.tag[2].toString(16);	
							$("#voteInfo").html("<h4>Vote on Bug for update" +
							"<a href=\"/tokenHome/" + token.id + "/forum/" +
							activeVote[1] + "\" target=\"_blank\">" +
							updateNames.get(activeVote[1]) + "</a></h4>" +
							"<h6>Finder: <span id=\"finder\"></span></h6>" +	
							"<h6>Description:</h6>" +	
							"<div id=\"description\"></div>" +
							"<p>Vote Count:<br>" +
							"<span id=\"yesVotes\">0</span>% think it is a bug<br>" +
							"<span id=\"noVotes\">0</span>% don't think it's a bug<br>" +
							"<span id=\"consensus\"></span>% required to pass<br>" +
							"Vote finishes on: " + finishDate + "</p>");

							let newVote = tmInstance.NewVote({tag: voteStarts[i].args.tag}, {fromBlock: 0, toBlock: 'latest'});	
							let bugFound = tmInstance.BugFound({bugId: voteStarts[i].args.tag[2], updateId: voteStarts[i].args.tag[1]}, {fromBlock: 0, toBlock: 'latest'});
							
							bugFound.get((err, bug) => {
								if (bug.length != 1){
									console.log(bug);
									alert("error");
								} else {
									$("#finder").text(bug[0].args.by);
									let bugId = bug[0].args.bugId.toString(16);					
						
									$.ajax({
										type: 'GET',
										url: '/api/bugs/' + bugId,
										datatype: 'json',
										success: function(responseData, textStatus, jqXHR) {
											if (SHA256(responseData.description + responseData.updateId).toString() != responseData.bugId) {
												alert("data not safe");
											} else {
												$("#description").text(responseData.description);	
											}
										}
									});
								}
							});

							newVote.get((err, votes) => {
								for(let i = 0; i < newVotes.length ; i++) {
									$("#yesVotes").text(votes[i].args.yes);		
									$("#noVotes").text(votes[i].args.no);		
									if (votes[i].args.from == account){
										alert("You have already votes from this address." +
										"If you want to vote with newly reveived funds, place them into another account and vote from there."); 
									}
								}	
							});
							 
							tmInstance.consensusPercent((err,result) => {
								$("#consensus").text(result);
							});
					
						}
					}
				}
			});
		});
	},
				 
	submitYesVote: function() {
		tmInstance.submitVote(true, {from: account, gas: 4000000}, (err, result) => {
			if (err) {
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	submitNoVote: function() {
		tmInstance.submitVote(false, {from: account, gas: 4000000}, (err, result) => {
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




