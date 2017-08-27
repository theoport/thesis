import {default as Web3} from 'web3';
import {default as SHA256} from 'crypto-js/sha256';
import tokenManagerObject from '../../build/contracts/TokenManager.json';


let Token, TokenManager;
let tokenAddress, tokenInstance, tmAddress, tmInstance;
let account;

let UpdateStatusEnum = {
	BOUNTY: 'bounty',
	DEVELOPING: 'developing',
	BUGHUNT: 'bughunt'
}

let updateNames = new Map();
	
let events = [];
let finishedUpdates = [];
let finishedAuctions = [];
let finishedVotes = [];
let finishedBounties = [];
let finishedBugHunts = [];
let activeVote=0;
let activeUpdate=0;
let activeAuction=0;
let activeBug=0;
let activeBounty=[];
let newTokenAddress;
let bugHuntFinishTime


window.App = {
	start: function() {
	
		self = this;

		self.checkData();

		Token = web3.eth.contract(token.abi);
		TokenManager = web3.eth.contract(tokenManagerObject.abi);
		tokenAddress = token.address;
		tokenInstance = Token.at(tokenAddress);
		tmAddress = token.managerAddress;
		tmInstance = TokenManager.at(tmAddress);

	
		self.setAccountInfo();
		for (var i = 0 ; i<updateTopics.length ; i++) {
			updateNames.set(updateTopics.id, updateTopics.name);
		}
		self.fillPage();
		self.startWatch();
	},
	
	fillPage: function () {	

		//UPDATE
		var updateStart = tmInstance.UpdateStarted();
		var updateFinish = tmInstance.UpdateOutcome();

		//VOTE
		var voteStart = tmInstance.VoteStarted();
		var voteFinish = tmInstance.VotingOutcome();

		//AUCTION
		var auctionStart = tmInstance.AuctionStarted();
		var auctionFinish = tmInstance.AuctionEnd();

		var failure = tmInstance.Failure();

		//BOUNTY
		var bountyStart = 	tmInstance.BountyStarted();
		var bountyFinish = tmInstance.BountyEnded();

		var bugFound = tmInstance.BugFound();

		//BUGHUNT
		var bugHuntStart = tmInstance.BugHuntStarted();
		var bugHuntFinish = tmInstance.BugHuntEnd();

		var newVote = tmInstance.NewVote();

		var developerStart = tmInstance.DeveloperStarted();

		events = [];

		updateFinish.get((err,updateEnds) => {

			for (var i = 0; i < updateEnds.length; i++) {
				var success = (updateEnds[i].args.success)?'successful':'unsuccessful';
				var html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Update Finished" +
				"<small> at " + Date(updateStarts[i].args.time) + 
				"</small></h4>" +
				"<p>" + success + "</p>"+  
				"<a href=\"/tokenHome/" + token.id + "/forum/" + 
				updateEnds[i].args.updateId + "\">" + 
				updateNames.get(updateEnds[i].args.updateId) + "</a>" +
				"</div>"; 
				events.push([updateEnds[i].args.time, html]);	
				finishedUpdates.push(updateEnds[i].args.updateId);
			}
			
			updateStart.get((err,updateStarts) => {

				for (var i = 0; i < updateStarts.length; i++) {
					var html = "<div class=\"media-body\">" +
					"<h4 class=\"media-heading\">Update Started" +
					"<small> at " + Date(updateStarts[i].args.time) + 
					"</small></h4>" +
					"<a href=\"/tokenHome/" + token.id + "/forum/" + 
					updateStarts[i].args.updateId + "\">" + 
					updateNames.get(updateStarts[i].args.updateId) + "</a>" +
					"</div>"; 
					events.push([updateStarts[i].args.time, html]);	
					if ($.inArray(updateStarts[i].args.updateId, finishedUpdates < 0)) {
						activeUpdate = updateStarts[i].args.updateId;
					}
				}
				bountyFinish.get((err,bountyEnds) => {
					for (var i = 0; i < bountyEnds.length; i++) {
						var html = "<div class=\"media-body\">" +
						"<h4 class=\"media-heading\">BountyHunt Finished" +
						"<small> at " + Date(bountyEnds[i].args.time) + 
						"</small></h4>" +
						"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
						bountyEnds[i].args.updateId + "\">" + 
						updateNames.get(bountyEnds[i].args.updateId) + "</a></p>" +
						"<p>Winner is: "+bountyEnds[i].args.winner +
						"</p><p>Price for udpate is: " +
						bountyEnds[i].args.price + "</p></div>";
						events.push([bountyEnds[i].args.time, html]);	
						finishedBounties.push(bountyEnd[i].args.updateId);
						if (bountyEnds[i].args.updateId == activeUpdate) {
							$("#update").html("<h5>Update is pending.</h5>"+
							"<a href=\"/tokenHome/" + token.id + "/forum/" +
							updateStarts[i].args.updateId + "\">" +
							"Go to thread.</a>" +
							"<p>Vote is active.</p>" +
							"<p>Please vote if you haven'done so already.</p>");
						}
					}
					bountyStart.get((err, bountyStarts) => {
						for (var i = 0; i < bountyStarts.length ; i++) { 
							var html = "<div class=\"media-body\">" +
							"<h4 class=\"media-heading\">BountyHunt Started" +
							"<small> at " + Date(bountyStarts[i].args.time) + 
							"</small></h4>" +
							"<p> for update #" + bountyStarts[i].args.updateId; 
							if($.inArray(bountyStarts.args.updateId, finishedBounties) < 0) {
								$("#update").html("<h5>Update is pending.</h5>"+
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								updateStarts[i].args.updateId + "\">" +
								"Go to thread.</a>" +
								"<p>BountyHunt is active.</p>" +
								if (Date(updateStarts[i].args.finishTime) > Date(now)) {
									$("#update").append("<p>Are you a developer and want to work on this update?</p>" +
									"<a href=\"/tokenHome/" + token.id + "/bidForBounty/" +
									updateStarts[i].args.updateId + "\">" +
									"Bid for Bounty</a>" +
									"<p>BountyHunt finishes on " + 
									Date(updateStarts[i].args.finishTime) + "</p>");
								} else if (Date(updateStarts[i].args.finishTime) < Date(now)) {
									$("#update").append("<p>BountyHunt is over, end it here:<br>" +
									"<a class=\"btn btn-default blockchain\" onclick=\"App.endBounty()\">" +
									"End Update</a></p>");
								}	
							}
							events.push([auctionStarts[i].args.time, html]);	
						}
						developerStart.get((err,developerStarts) => {
							for (var i = 0; i < bountyStarts.length ; i++) { 
								var html = "<div class=\"media-body\">" +
								"<h4 class=\"media-heading\">Developer started working.</h4>" +
								"<p> Developer: <br> " +
								developerStarts[i].args.developer +
								"Started working on update:<br>" + 
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								developerStarts[i].args.updateId + "\">" +
								updateNames.get(developerStarts[i].args.updateId) +
								"</a><br>"	
								"<small> at " + Date(developerStarts[i].args.time) + 
								"</small></p>";
								if (developerStarts[i].args.updateId == activeUpdate) {
									$("#update").html("<h5>Update is being developed.</h5>"+
									"<a href=\"/tokenHome/" + token.id + "/forum/" +
									updateStarts[i].args.updateId + "\">" +
									"Go to thread.</a>" +
									"<p>Developer is:<br>" + developerStarts[i].args.developer + "</p>"); 
									if (Date(developerStarts[i].args.finishTime) > Date(now)) {
										$("#update").append("<p>Deadline is: " + developerStarts[i].args.finishTime +
										"<br>Are you the developer and have finished?" +
										"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
										token.id + "/submitUpdate/" + developerStarts[i].args.udpateId + "\">" +
										"Submit Update</a></p>");
									} else if (Date(developerStarts[i].args.finishTime) < Date(now)) {
										$("#update").append("<p>Deadline is finished and developer hasn't submitted any code!<br>" +
										"End it here:<br>" +
										"<a class=\"btn btn-default blockchain\" onclick=\"App.endUpdate()\">" +
										"End Update</a></p>");
									}
								}
							}
							VoteFinish.get((err, voteEnds) => {
								for (var i = 0 ; i < voteEnds.length ; i++) {
									var success = (voteEnds[i].args.success)?'successful':'unsuccessful';	
									var voteFor = '';	
									if (voteEnds[i].args.tag[0] == 0) {
										var html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote finished" +
										"<small> at " + Date(voteEnds[i].args.time) + 
										"</small></h4>" +
										"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
										voteEnds[i].args.tag[1] + "\">" + 
										updateNames.get(voteEnds[i].args.tag[1]) + "</a></p>" +
										"<p>" + success + "</p>"+  
										"</div>"; 
											
									} else if (voteEnds[i].args.tag[0] == 1) {
										var html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote Started" +
										"<small> at " + Date(voteEnds[i].args.time) + 
										"</small></h4>" +
										"<p>for bug #" + voteEnds[i].args.tag[2] + "</p>
										"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
										voteEnds[i].args.tag[1] + "\">" + 
										updateNames.get(voteEnds[i].args.tag[1]) + "</a></p>" +
										"<p>" + success + "</p>"+  
										"</div>";
									}
									events.push([voteEnds[i].args.time, html]);	
									finishedVotes.push(voteEnds[i].args.tag);
								}
								voteStart.get((err, voteStarts) => {
			
									for (var i = 0 ; i < voteStarts.length ; i++) {
								
										var voteFor = '';	
										if (voteStarts.args.tag[0] == 0) {
											var html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + Date(voteStarts[i].args.time) + 
											"</small></h4>" +
											"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
											voteStarts[i].args.tag[1] + "\">" + 
											updateNames.get(voteStarts[i].args.tag[1]) + "</a></p>" +
											"</div>"; 
											if ($.inArray(voteStarts[i].args.tag, finishedVotes < 0)) {
												$("#vote").html("<h5>Vote is active.</h5>"+
												"<p>Vote is on update." +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1] + "\">" +
												"#" + voteStarts[i].args.tag[1] "</a></p>" +
												"<p>Vote Count: <br><span id =\"voteYes\"></span>% for update" +
												"<span id=\"voteNo\"></span> against udpate</p>");
												if (Date(voteStarts[i].args.finishTime) > Date(now)) {
													$("#vote").append("<p>If you haven't done so already:</p>" +
													"<a href=\"/tokenHome/" + token.id + 
													"/forum/" + voteStarts[i].args.tag[1] +
													"/voteForUpdate/" +
													"Vote</a>";
													"<p>Vote finishes on " + 
													Date(voteStarts[i].args.finishTime) + "</p>");
												} else if (Date(voteStarts[i].args.finishTime) < Date(now)) {
													$("#vote").append("<p>Deadline is over.</p>" +
													"End vote here:<br>" +
													"<a class=\"btn btn-default blockchain\" onclick=\"App.endVote()\">" +
													"End Vote</a></p>"); 
												}
													
												activeVote = voteStarts[i].args.tag; 
			
											}
										} else if (voteStarts.args.tag[0] == 1) {
											var html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + Date(voteStarts[i].args.time) + 
											"</small></h4>" +
											"<p>for bug #" + voteStarts[i].args.tag[2] + "</p>
											"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
											voteStarts[i].args.tag[1] + "\">" + 
											updateNames.get(voteStarts[i].args.tag[1]) + "</a></p>" +
											"</div>";
											if ($.inArray(voteStarts[i].args.tag, finishedVotes < 0)) {
												$("#vote").html("<h5>Vote is active.</h5>"+
												"<p>Vote is on bug" +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1]+ "/bug/" +
												voteStarts[i].args.tag[2] + "\">" +
												"#" + voteStarts[i].args.tag[2] + 
												"</a><br>" +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1] + "\">" +
												"Go to thread.</a>" +
												"<p>Vote Count: <br><span id =\"voteYes\"></span>% think it's a bug." +
												"<span id=\"voteNo\"></span> don't think it's a bug.</p>");
												if (Date(voteStarts[i].args.finishTime) > Date(now)) {
													$("#vote").append("<p>If you haven't done so already:</p>" +
													"<a href=\"/tokenHome/" + token.id + 
													"/forum/" + voteStarts[i].args.tag[1] +
													"/voteForBug/" + voteStarts[i].args.tag[2] +
													"Vote</a>";
													"<p>Vote finishes on " + 
													Date(voteStarts[i].args.finishTime) + "</p>");
												} else if (Date(voteStarts[i].args.finishTime) < Date(now)) {
													$("#vote").append("<p>Deadline is over.</p>" +
													"End vote here:<br>" +
													"<a class=\"btn btn-default blockchain\" onclick=\"App.endVote()\">" +
													"End Vote</a></p>"); 
												}
												activeVote = voteStarts[i].args.tag; 
											}
										}
										events.push([voteStarts[i].args.time, html]);	
									}
									newVote.get((err,votes) => {
										if (votes[i].args.tag == activeVote) {
											$("#voteYes").html(yes);		
											$("#voteNo").html(no);		
										}
										auctionFinish.get((err,auctionEnds) => {
											for (var i ; i < auctionFinish.length ; i++) {
												var html = "<div class=\"media-body\">" +
												"<h4 class=\"media-heading\">Auction Started" +
												"<small> at " + Date(auctionStarts[i].args.time) + 
												"</small></h4>" +
												"<p>#" + auctionEnds[i].args.auctionId + "</p>" + 
												"<p>Sold " + aunctionEnds[i].args.amount + " " +
												token.name + " to " + auctionEnds[i].args.winner +
												" for " + auctionEnds[i].args.price + " wei." +
												"</div>";
												events.push([auctionEnds[i].args.time, html]);	
												finishedAuctions.push(auctionEnds[i].args.auctionId);
											}
											auctionStart.get((err,auctionStarts) => {
												for (var i = 0; i < auctionStarts.length ; i++) { 
													var html = "<div class=\"media-body\">" +
													"<h4 class=\"media-heading\">Auction Started" +
													"<small> at " + Date(auctionStarts[i].args.time) + 
													"</small></h4>" +
													"<p>#" + auctionStarts[i].args.auctionId + 
													" for " + auctionStarts[i].args.amount + " " + 
													token.name +"</p></div>" +; 
													events.push([auctionStarts[i].args.time, html]);	
													if($.inArray(auctionStarts[i].args.auctionId, finishedAuctions < 0 )) {
														$("#auction").html("<h5>Auction #" +
														auctionStarts[i].args.auctionId +
														" is active.</h5>" +
														"<p>Selling " + auctionStarts[i].args.amount +
														" " + token.name + ".</p>" +
														"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>");
														if (Date(auctionStarts[i].args.finishTime) > Date(now)) {
															$("#auction").append("<a href=\"/tokenHome/" + token.id +
															"/auctionHouse/" + auctionStarts[i].args.auctionId +
															"\">Enter Bidding</a>" +
															"<p>Finishes on " + Date(auctionStarts[i].args.finishTime) + "</p>");
														} else if (Date(auctionStarts[i].args.finishTime) < Date(now)) {
															$("#auction").append("<p>Auction is over.</p>" +
															"<p>End it here:<br>" +
															"<button class=\"btn btn-default blockchain\" onclick=\"App.endAuction()\">End Auction</button></p>");
														}
														activeAuction = auctionStarts[i].args.auctionId;
													}
													events.push([auctionStarts[i].args.time, html]);
												}	
												bugHuntFinish.get((err,bugHuntEnds) => {
													for (var i = 0; i < bugHuntEnds.length ; i++) { 
														var html = "<div class=\"media-body\">" +
														"<h4 class=\"media-heading\">BugHunt has finished" +
														"<small> at " + Date(bugHuntEnds[i].args.time) + 
														"</small></h4>" +
														"<p>for " + "<a href=\"/tokenHome/" + token.id +
														"/form/" + bugHuntEnds[i].args.updateId + "\">" + 
														updateNames.get(bugHuntEnds[i].args.updateId) +
														"</a></p></div>";
														finishedBugHunts.push(bugHuntEnds[i].args.updateId);
														events.push([bugHuntEnds[i].args.time, html]);	
													}
													bugHuntStart.get((err,bugHuntStarts) => {
														for (var i = 0; i < bugHuntStarts.length ; i++) { 
															var html = "<div class=\"media-body\">" +
															"<h4 class=\"media-heading\">BugHunt has started" +
															"<small> at " + Date(bugHuntStarts[i].args.time) + 
															"</small></h4>" +
															"<p>for " + "<a href=\"/tokenHome/" + token.id +
															"/form/" + bugHuntStarts[i].args.updateId + "\">" + 
															updateNames.get(bugHuntStarts[i].args.updateId) +
															"</a></p></div>";
															events.push([bugHuntEnds[i].args.time, html]);	
															if ($.inArray(bugHuntStarts[i].args.updateId, finishedBugHunts) < 0) {
																var id = SHA256(bugHuntStarts[i].args.time + bugHuntStarts[i].args.updatedContract + token.ManagerAddress);
																newTokenAddress = bugHuntStarts[i].args.updatedContract; 
																bugHuntFinishTime = bugHuntStarts[i].args.finishTime;
																$("#update").html("<h5>Update has been submitted" +
																"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
																"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h5>" +
																"Contract is deployed at address:<br>" +
																newTokenAddress + "</p>");
																if (Date(bugHuntFinishTime) > Date(now)) {
																	$("#update").append("<p>BugHunt is active.<br>" +
																	"Have you found a bug?<br>" +
																	"<button class=\"btn btn-default\" href=\"/tokenHome/" +
																	token.id + "/submitBug/" + bugHuntStarts[i].args.updateId + 
																	"Submit Bug</button><br>" +
																	"Finishes at " + Date(bugHuntFinishTime) + "</p>");
																} else if (Date(bugHuntFinishTime) < Date(now)) {
																	$("#update").append("<p>BugHunt is active.</p>" +
																	"<p>Deadline is over and code seems bug-free!<br>" +
																	"Finalize it here:<br>" +
																	"<a class=\"btn btn-default blockchain\" onclick=\"App.finalizeUpdate()\">" +
																	"Finalize Update</a></p>"); 
																}
															}
														}
														bugFound.get((err, bugFinds) => {
															for (var i = 0; i < bugFinds.length ; i++) { 
																var html = "<div class=\"media-body\">" +
																"<h4 class=\"media-heading\">Bug was Found" +
																"<small> at " + Date(bugFinds[i].args.time) + 
																"</small></h4>" +
																"<p>ID: " + bugFinds[i].args.bugId + "</p>" +
																"<a href=\"/tokenHome/" + token.id +
																"/form/" + bugFinds[i].args.updateId + "\">" + 
																"Go to thread.</a>" +
																"<p>Please inform yourself and vote on<br> whether this is a bug</p>";
																activeBug = bugFinds[i].args.bugId;
																events.push([bugFinds[i].args.time, html]);	
															}
															wasABug((err, yesABug) => {
																for (var i = 0; i < yesABug.length ; i++) { 
																	var html = "<div class=\"media-body\">" +
																	"<h4 class=\"media-heading\">A bug was validated." + 
																	"<small> at " + Date(yesABug[i].args.time) + 
																	"</small></h4>" +
																	"<p>ID: " + yesABug[i].args.bugId + "</p>" +
																	"<a href=\"/tokenHome/" + token.id +
																	"/form/" + yesABug[i].args.updateId + "\">" + 
																	"Go to thread." + "</a></p>";
																	"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																	" more tries to complete the update.<br>";  
																	events.push([wasABug[i].args.time, html]);	
																	if (yesABug[i].args.bugId== activeBug) {
																		if (Date(yesABug[i].args.finishTime) > Date(now)) {
																			$("#update").html("<h4>Update is being corrected after bug was found.</h4>" +
																			"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																			" more tries to complete the update.<br>" +  
																			"<p>Deadline is: " + yesABug[i].args.finishTime +
																			"<br>Are you the developer and have finished?" +
																			"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
																			token.id + "/submitUpdate/" + developerStarts[i].args.udpateId + "\">" +
																			"Submit Update</a></p>");
																		} else if (Date(yesABug[i].args.finishTime) < Date(now)) {
																			$("#update").html= ("<h4>Update is active.</h4" +
																			"<p>Deadline is over and developer hasn't submitted any code!<br>" +
																			"End it here: <br>" +
																			"<a class=\"btn btn-default blockchain\" onclick=\"App.endUpdate()\">" +
																			"End Update</a></p>"); 
																		}
																	}
																}
																wasNotABug((err, notABug) => { 
																	for (var i = 0; i < notABug.length ; i++) { 
																		var html = "<div class=\"media-body\">" +
																		"<h4 class=\"media-heading\">Bug was unvalidated." +
																		"<small> at " + Date(notABug[i].args.time) + 
																		"</small></h4>" +
																		"<p>ID: " + yesABug[i].args.bugId + "</p>" +
																		"<a href=\"/tokenHome/" + token.id +
																		"/form/" + yesABug[i].args.updateId + "\">" + 
																		"Go to thread." + "</a></p>";
																		events.push([auctionStarts[i].args.time, html]);	
																		if (notABug[i].args.bugId== activeBug) {
																			if (bugHuntFinishTime > Date(now)) {
																				$("#update").html("<h4>Update is active.</h4>" +
																				"<p>Deadline is: " + bugHuntFinishTime +
																				"<br>Are you the developer and have finished?" +
																				"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
																				token.id + "/submitUpdate/" + developerStarts[i].args.udpateId + "\">" +
																				"Submit Update</a></p>");
																			} else if (Date(yesABug[i].args.finishTime) < Date(now)) {
																				$("#update").html= ("<h4>Update is active.</h4" +
																				"<p>Deadline is over and code seems bug-free!<br>" +
																				"<p>Finalize it here:<br>" +
																				"<a class=\"btn btn-default blockchain\" onclick=\"App.finalizeUpdate()\">" +
																				"Finalize Update</a></p>"); 
																			}
																		}
																	}
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	},	

	endUpdate: 
	finalizeUpdate:
	endVote:
	withdrawBets:
	endAuction:
	endBounty:


	checkData: function() {
		console.log(token);
		var _date = new Date(token.creationDate);
		if (SHA256((_date.getTime() / 1000) + token.address + token.managerAddress) != token.id) {
			alert("DANGER, DATA HAS BEEN ALTERED");
		}
	},

	setAccountInfo: function(){
		self = this;
		web3.eth.getAccounts((err, accs) => {
			if (err != null){
				console.log(err)
			} else if (accs.length == 0){
				console.log("there are no accounts");
			} else {
				account=accs[0];
				self.loadWallet();
			}
		});
	},

	loadWallet: function() {
		tokenInstance.balanceOf(account, (err,result) => {
			var balance = result;
			if (typeof(balance) == 'undefined') {
				balance = 0;
			}
			$("#accountBalance").html(balance);
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
