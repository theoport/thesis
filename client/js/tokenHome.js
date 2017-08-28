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
		var voteStart = tmInstance.VoteStarted(); var voteFinish = tmInstance.VotingOutcome();

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

		let d = new Date();
		let nowInSeconds = d.getSeconds();

		updateFinish.get((err,updateEnds) => {

			for (var i = 0; i < updateEnds.length; i++) {

				let date = new Date(updateEnds[i].args.time * 1000);

				var success = (updateEnds[i].args.success)?'successful':'unsuccessful';
				var html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Update Finished" +
				"<small> at " + date + 
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

					let date = new Date(updateStarts[i].args.time * 1000);

					var html = "<div class=\"media-body\">" +
					"<h4 class=\"media-heading\">Update Started" +
					"<small> at " + date + 
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

						let date = new Date(bountyEnds[i].args.time * 1000);

						var html = "<div class=\"media-body\">" +
						"<h4 class=\"media-heading\">BountyHunt Finished" +
						"<small> at " + date + 
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
							bountyEnds[i].args.updateId + "\">" +
							"Go to thread.</a>" +
							"<p>Vote is active.</p>" +
							"<p>Please vote if you haven'done so already.</p>");
						}
					}
					bountyStart.get((err, bountyStarts) => {

						for (var i = 0; i < bountyStarts.length ; i++) { 

							let date = new Date(bountyStarts[i].args.time * 1000);
							let finishDate = new Date(bountyStarts[i].args.finishTime *1000);

							var html = "<div class=\"media-body\">" +
							"<h4 class=\"media-heading\">BountyHunt Started" +
							"<small> at " + date + 
							"</small></h4>" +
							"<p> for update #" + bountyStarts[i].args.updateId; 
							if($.inArray(bountyStarts.args.updateId, finishedBounties) < 0) {
								$("#update").html("<h5>Update is pending.</h5>"+
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								bountyStarts[i].args.updateId + "\">" +
								"Go to thread.</a>" +
								"<p>BountyHunt is active.</p>");
								if (bountyStarts[i].args.finishTime > nowInSeconds) {
									$("#update").append("<p>Are you a developer and want to work on this update?</p>" +
									"<a href=\"/tokenHome/" + token.id + "/bidForBounty/" +
									bountyStarts[i].args.updateId + "\">" +
									"Bid for Bounty</a>" +
									"<p>BountyHunt finishes on " + 
									finishDate + "</p>");
								} else if (bountyStarts[i].args.finishTime < nowInSeconds) {
									$("#update").append("<p>BountyHunt is over, end it here:<br>" +
									"<a class=\"btn btn-default blockchain\" onclick=\"App.endBounty()\">" +
									"End Update</a></p>");
								}	
							}
							events.push([bountyStarts[i].args.time, html]);	
						}
						developerStart.get((err,developerStarts) => {

							for (var i = 0; i < bountyStarts.length ; i++) { 

								let date = new Date(developerStarts[i].args.time * 1000);
								let finishDate = new Date(developerStarts[i].args.finishTime *1000);

								var html = "<div class=\"media-body\">" +
								"<h4 class=\"media-heading\">Developer started working.</h4>" +
								"<p> Developer: <br> " +
								developerStarts[i].args.developer +
								"Started working on update:<br>" + 
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								developerStarts[i].args.updateId + "\">" +
								updateNames.get(developerStarts[i].args.updateId) +
								"</a><br>"	
								"<small> at " + date + 
								"</small></p>";
								events.push([developerStarts[i].args.time, html]);	
								if (developerStarts[i].args.updateId == activeUpdate) {
									$("#update").html("<h5>Update is being developed.</h5>"+
									"<a href=\"/tokenHome/" + token.id + "/forum/" +
									developerStarts[i].args.updateId + "\">" +
									"Go to thread.</a>" +
									"<p>Developer is:<br>" + developerStarts[i].args.developer + "</p>"); 
									if (developerStarts[i].args.finishTime > nowInSeconds) {
										$("#update").append("<p>Deadline is: " + Date(developerStarts[i].args.finishTime) +
										"<br>Are you the developer and have finished?" +
										"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
										token.id + "/submitUpdate/" + developerStarts[i].args.udpateId + "\">" +
										"Submit Update</a><br>" + 
										"Deadline is: " + finishDate +"<p>");
									} else if (developerStarts[i].args.finishTime < nowInSeconds) {
										$("#update").append("<p>Deadline is finished and developer hasn't submitted any code!<br>" +
										"End it here:<br>" +
										"<a class=\"btn btn-default blockchain\" onclick=\"App.endUpdate()\">" +
										"End Update</a></p>");
									}
								}
							}
							VoteFinish.get((err, voteEnds) => {
								for (var i = 0 ; i < voteEnds.length ; i++) {

									let date = new Date(voteEnds[i].args.time * 1000);

									var success = (voteEnds[i].args.success)?'successful':'unsuccessful';	
									var html;
									if (voteEnds[i].args.tag[0] == 0) {
										html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote finished" +
										"<small> at " + date + 
										"</small></h4>" +
										"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
										voteEnds[i].args.tag[1] + "\">" + 
										updateNames.get(voteEnds[i].args.tag[1]) + "</a></p>" +
										"<p>" + success + "</p>"+  
										"</div>"; 
											
									} else if (voteEnds[i].args.tag[0] == 1) {
										html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote Finished" +
										"<small> at " + date + 
										"</small></h4>" +
										"<p>for bug #" + voteEnds[i].args.tag[2] + "</p>" +
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

										let date = new Date(voteStarts[i].args.time * 1000);
										let finishDate = new Date(voteStarts[i].args.finishTime *1000);
								
										var html;
										if (voteStarts[i].args.tag[0] == 0) {
											html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + date + 
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
												if (voteStarts[i].args.finishTime > nowInSeconds) {
													$("#vote").append("<p>If you haven't done so already:</p>" +
													"<a href=\"/tokenHome/" + token.id + 
													"/forum/" + voteStarts[i].args.tag[1] +
													"/voteForUpdate/" +
													"Vote</a>" +
													"<p>Vote finishes on " + 
													finishDate + "</p>");
												} else if (voteStarts[i].args.finishTime < nowInSeconds) {
													$("#vote").append("<p>Deadline is over.</p>" +
													"End vote here:<br>" +
													"<a class=\"btn btn-default blockchain\" onclick=\"App.endVote()\">" +
													"End Vote</a></p>"); 
												}
													
												activeVote = voteStarts[i].args.tag; 
			
											}
										} else if (voteStarts[i].args.tag[0] == 1) {
											html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + date + 
											"</small></h4>" +
											"<p>for bug #" + voteStarts[i].args.tag[2] + "</p>" +
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
												if (voteStarts[i].args.finishTime > nowInSeconds) {
													$("#vote").append("<p>If you haven't done so already:</p>" +
													"<a href=\"/tokenHome/" + token.id + 
													"/forum/" + voteStarts[i].args.tag[1] +
													"/voteForBug/" + voteStarts[i].args.tag[2] +
													"Vote</a>" +
													"<p>Vote finishes on " + 
													finishDate + "</p>");
												} else if (voteStarts[i].args.finishTime < nowInSeconds) {
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
											$("#voteYes").html(votes[i].args.yes);		
											$("#voteNo").html(votes[i].args.no);		
										}
										auctionFinish.get((err,auctionEnds) => {
											for (var i ; i < auctionEnds.length ; i++) {

												let date = new Date(auctionEnds[i].args.time * 1000);

												var html = "<div class=\"media-body\">" +
												"<h4 class=\"media-heading\">Auction Finished" +
												"<small> at " + date + 
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

													let date = new Date(auctionStarts[i].args.time * 1000);
													let finishDate = new Date(auctionStarts[i].args.finishTime *1000);

													var html = "<div class=\"media-body\">" +
													"<h4 class=\"media-heading\">Auction Started" +
													"<small> at " + date + 
													"</small></h4>" +
													"<p>#" + auctionStarts[i].args.auctionId + 
													" for " + auctionStarts[i].args.amount + " " + 
													token.name +"</p></div>"; 
													events.push([auctionStarts[i].args.time, html]);	
													if($.inArray(auctionStarts[i].args.auctionId, finishedAuctions < 0 )) {
														$("#auction").html("<h5>Auction #" +
														auctionStarts[i].args.auctionId +
														" is active.</h5>" +
														"<p>Selling " + auctionStarts[i].args.amount +
														" " + token.name + ".</p>" +
														"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>");
														if (auctionStarts[i].args.finishTime > nowInSeconds) {
															$("#auction").append("<a href=\"/tokenHome/" + token.id +
															"/auctionHouse/" + auctionStarts[i].args.auctionId +
															"\">Enter Bidding</a>" +
															"<p>Finishes on " + finishDate + "</p>");
														} else if (auctionStarts[i].args.finishTime < nowInSeconds) {
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

														let date = new Date(bugHuntEnds[i].args.time * 1000);

														var html = "<div class=\"media-body\">" +
														"<h4 class=\"media-heading\">BugHunt has finished" +
														"<small> at " + date + 
														"</small></h4>" +
														"<p>for " + "<a href=\"/tokenHome/" + token.id +
														"/forum/" + bugHuntEnds[i].args.updateId + "\">" + 
														updateNames.get(bugHuntEnds[i].args.updateId) +
														"</a></p></div>";
														finishedBugHunts.push(bugHuntEnds[i].args.updateId);
														events.push([bugHuntEnds[i].args.time, html]);	
													}
													bugHuntStart.get((err,bugHuntStarts) => {
														for (var i = 0; i < bugHuntStarts.length ; i++) { 

															let date = new Date(bugHuntStarts[i].args.time * 1000);
															let finishDate = new Date(bugHuntStarts[i].args.finishTime *1000);

															var html = "<div class=\"media-body\">" +
															"<h4 class=\"media-heading\">BugHunt has started" +
															"<small> at " + date + 
															"</small></h4>" +
															"<p>for " + "<a href=\"/tokenHome/" + token.id +
															"/forum/" + bugHuntStarts[i].args.updateId + "\">" + 
															updateNames.get(bugHuntStarts[i].args.updateId) +
															"</a></p></div>";
															events.push([bugHuntStarts[i].args.time, html]);	
															if ($.inArray(bugHuntStarts[i].args.updateId, finishedBugHunts) < 0) {
																var id = SHA256(bugHuntStarts[i].args.time + bugHuntStarts[i].args.updatedContract + token.ManagerAddress);
																newTokenAddress = bugHuntStarts[i].args.updatedContract; 
																bugHuntFinishTime = bugHuntStarts[i].args.finishTime;
																$("#update").html("<h5>Update has been submitted" +
																"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
																"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h5>" +
																"Contract is deployed at address:<br>" +
																newTokenAddress + "</p>");
																if (bugHuntFinishTime > nowInSeconds) {
																	$("#update").append("<p>BugHunt is active.<br>" +
																	"Have you found a bug?<br>" +
																	"<button class=\"btn btn-default\" href=\"/tokenHome/" +
																	token.id + "/submitBug/" + bugHuntStarts[i].args.updateId + 
																	"Submit Bug</button><br>" +
																	"Finishes at " + finishDate + "</p>");
																} else if (bugHuntFinishTime < nowInSeconds) {
																	$("#update").append("<p>BugHunt is active.</p>" +
																	"<p>Deadline is over and code seems bug-free!<br>" +
																	"Finalize it here:<br>" +
																	"<a class=\"btn btn-default blockchain\" onclick=\"App.finaliseUpdate()\">" +
																	"Finalize Update</a></p>"); 
																}
															}
														}
														bugFound.get((err, bugFinds) => {
															for (var i = 0; i < bugFinds.length ; i++) { 

																let date = new Date(bugFinds[i].args.time * 1000);

																var html = "<div class=\"media-body\">" +
																"<h4 class=\"media-heading\">Bug was Found" +
																"<small> at " + date + 
																"</small></h4>" +
																"<p>ID: " + bugFinds[i].args.bugId + "</p>" +
																"<a href=\"/tokenHome/" + token.id +
																"/forum/" + bugFinds[i].args.updateId + "\">" + 
																"Go to thread.</a>" +
																"<p>Please inform yourself and vote on<br> whether this is a bug</p>";
																activeBug = bugFinds[i].args.bugId;
																events.push([bugFinds[i].args.time, html]);	
															}
															wasABug((err, yesABug) => {
																for (var i = 0; i < yesABug.length ; i++) { 

																	let date = new Date(yesABug[i].args.time * 1000);
																	let finishDate = new Date(yesABug[i].args.finishTime *1000);

																	var html = "<div class=\"media-body\">" +
																	"<h4 class=\"media-heading\">A bug was validated." + 
																	"<small> at " + date + 
																	"</small></h4>" +
																	"<p>ID: " + yesABug[i].args.bugId + "</p>" +
																	"<a href=\"/tokenHome/" + token.id +
																	"/forum/" + yesABug[i].args.updateId + "\">" + 
																	"Go to thread." + "</a></p>" +
																	"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																	" more tries to complete the update.<br>";  
																	events.push([yesABug[i].args.time, html]);	
																	if (yesABug[i].args.bugId== activeBug) {
																		if (yesABug[i].args.finishTime > nowInSeconds) {
																			$("#update").html("<h4>Update is being corrected after bug was found.</h4>" +
																			"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																			" more tries to complete the update.<br>" +  
																			"<p>Deadline is: " + finishDate +
																			"<br>Are you the developer and have finished?" +
																			"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
																			token.id + "/submitUpdate/" + yesABug[i].args.udpateId + "\">" +
																			"Submit Update</a></p>");
																		} else if (yesABug[i].args.finishTime < nowInSeconds) {
																			$("#update").html("<h4>Update is active.</h4" +
																			"<p>Deadline is over and developer hasn't submitted any code!<br>" +
																			"End it here: <br>" +
																			"<a class=\"btn btn-default blockchain\" onclick=\"App.endUpdate()\">" +
																			"End Update</a></p>"); 
																		}
																	}
																}
																wasNotABug((err, notABug) => { 


																	for (var i = 0; i < notABug.length ; i++) { 

																		let date = new Date(notABug[i].args.time * 1000);
																		let finishDate = new Date(bugHuntFinishTime *1000);

																		var html = "<div class=\"media-body\">" +
																		"<h4 class=\"media-heading\">Bug was unvalidated." +
																		"<small> at " + date + 
																		"</small></h4>" +
																		"<p>ID: " + notABug[i].args.bugId + "</p>" +
																		"<a href=\"/tokenHome/" + token.id +
																		"/forum/" + notABug[i].args.updateId + "\">" + 
																		"Go to thread." + "</a></p>";
																		events.push([notABug[i].args.time, html]);	
																		if (notABug[i].args.bugId == activeBug) {
																			$("#update").html("<h5>Update has been submitted" +
																			"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
																			"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h5>" +
																			"Contract is deployed at address:<br>" +
																			newTokenAddress + "</p>");
																			if (bugHuntFinishTime > nowInSeconds) {
																				$("#update").append("<p>BugHunt is active.<br>" +
																				"Have you found a bug?<br>" +
																				"<button class=\"btn btn-default\" href=\"/tokenHome/" +
																				token.id + "/submitBug/" + notABug[i].args.updateId + 
																				"Submit Bug</button><br>" +
																				"Finishes at " + finishDate + "</p>");
																			} else if (bugHuntFinishTime < nowInSeconds) {
																				$("#update").append("<p>BugHunt is active.</p>" +
																				"<p>Deadline is over and code seems bug-free!<br>" +
																				"Finalize it here:<br>" +
																				"<a class=\"btn btn-default blockchain\" onclick=\"App.finaliseUpdate()\">" +
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

	startWatch: function(){

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

		failure.watch((err,result) => {
			if (err){ 
				alert(err);
			} else {
				alert("failure: " + result.args.message);
			}
		});
	
		updateFinish.watch((err,updateEnd) => {

			let date = new Date(updateEnd.args.time * 1000);

			var success = (updateEnd.args.success)?'successful':'unsuccessful';
			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Update Finished" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>" + success + "</p>"+  
			"<a href=\"/tokenHome/" + token.id + "/forum/" + 
			updateEnd.args.updateId + "\">" + 
			updateNames.get(updateEnd.args.updateId) + "</a>" +
			"</div>"; 
			$("#latestEvents").prepend(html);	
			$("#update").html("<h5>No active updates</h5>");

		});

		updateStart.watch((err,updateStart) => {

			let date = new Date(updateStart.args.time * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Update Started" +
			"<small> at " + date + 
			"</small></h4>" +
			"<a href=\"/tokenHome/" + token.id + "/forum/" + 
			updateStart.args.updateId + "\">" + 
			updateNames.get(updateStart.args.updateId) + "</a>" +
			"</div>"; 
			$("#latestEvents").prepend(html);	

		});

		bountyFinish.watch((err,bountyEnd) => {

			let date = new Date(bountyEnd.args.time * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">BountyHunt Finished" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
			bountyEnd.args.updateId + "\">" + 
			updateNames.get(bountyEnd.args.updateId) + "</a></p>" +
			"<p>Winner is: "+bountyEnd.args.winner +
			"</p><p>Price for udpate is: " +
			bountyEnd.args.price + "</p></div>";
			$("#latestEvents").prepend(html);	

			$("#update").html("<h5>Update is pending.</h5>"+
			"<a href=\"/tokenHome/" + token.id + "/forum/" +
			bountyEnd.args.updateId + "\">" +
			"Go to thread.</a>" +
			"<p>Vote is active.</p>" +
			"<p>Please vote if you haven'done so already.</p>");
		});

		bountyStart.watch((err, bountyStart) => {

			let date = new Date(bountyStart.args.time * 1000);
			let finishDate = new Date(bountyStart.args.finishTime *1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">BountyHunt Started" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p> for update #" + bountyStart.args.updateId; 
			$("#latestEvents").prepend(html);	
			
			$("#update").html("<h5>Update is pending.</h5>"+
			"<a href=\"/tokenHome/" + token.id + "/forum/" +
			bountyStart.args.updateId + "\">" +
			"Go to thread.</a>" +
			"<p>BountyHunt is active.</p>" +
			"<p>Are you a developer and want to work on this update?</p>" +
			"<a href=\"/tokenHome/" + token.id + "/bidForBounty/" +
			bountyStart.args.updateId + "\">" +
			"Bid for Bounty</a>" +
			"<p>BountyHunt finishes on " + 
			finishDate + "</p>");
		});

		developerStart.watch((err,developerStart) => {

			let date = new Date(developerStart.args.time * 1000);
			let finishDate = new Date(developerStart.args.finishTime * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Developer started working.</h4>" +
			"<p> Developer: <br> " +
			developerStart.args.developer +
			"Started working on update:<br>" + 
			"<a href=\"/tokenHome/" + token.id + "/forum/" +
			developerStart.args.updateId + "\">" +
			updateNames.get(developerStart.args.updateId) +
			"</a><br>" +
			"<small> at " + date + 
			"</small></p>";

			$("#latestEvents").prepend(html);	

			$("#update").html("<h5>Update is being developed.</h5>"+
			"<a href=\"/tokenHome/" + token.id + "/forum/" +
			developerStart.args.updateId + "\">" +
			"Go to thread.</a>" +
			"<p>Developer is:<br>" + developerStart.args.developer + "</p>" + 
			"<p>Deadline is: " + finishDate +
			"<br>Are you the developer and have finished?" +
			"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
			token.id + "/submitUpdate/" + developerStart.args.udpateId + "\">" +
			"Submit Update</a></p>");
		});

		VoteFinish.watch((err, voteEnd) => {

			let date = new Date(voteEnd.args.time * 1000);

			var success = (voteEnd.args.success)?'successful':'unsuccessful';	
			var html;
			if (voteEnd.args.tag[0] == 0) {
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Vote finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>For update <a href=\"/tokenHome/" + token.id + "/forum/" + 
				voteEnd.args.tag[1] + "\">" + 
				updateNames.get(voteEnd.args.tag[1]) + "</a></p>" +
				"<p>" + success + "</p>"+  
				"</div>"; 
					
			} else if (voteEnd.args.tag[0] == 1) {
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Vote Finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for bug #" + voteEnd.args.tag[2] + "</p>" +
				"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
				voteEnd.args.tag[1] + "\">" + 
				updateNames.get(voteEnd.args.tag[1]) + "</a></p>" +
				"<p>" + success + "</p>"+  
				"</div>";
			}
			$("#latestEvents").prepend(html);	

			$("#vote").html("<h5>No active votes.</h5>");
		});

		voteStart.watch((err, _voteStart) => {

			let date = new Date(_voteStart.args.time * 1000);
			let finishDate = new Date(_voteStart.args.finishTime * 1000);

			var html;
			if (_voteStart.args.tag[0] == 0) {

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Vote Started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
				_voteStart.args.tag[1] + "\">" + 
				updateNames.get(_voteStart.args.tag[1]) + "</a></p>" +
				"</div>"; 

				$("#vote").html("<h5>Vote is active.</h5>"+
				"<p>Vote is on update." +
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				_voteStart.args.tag[1] + "\">" +
				"#" + _voteStart.args.tag[1] "</a></p>" +
				"<p>Vote Count: <br><span id =\"voteYes\"></span>% for update" +
				"<span id=\"voteNo\"></span> against udpate</p>" +
				"<p>If you haven't done so already:</p>" +
				"<a href=\"/tokenHome/" + token.id + 
				"/forum/" + _voteStart.args.tag[1] +
				"/voteForUpdate/" +
				"Vote</a>" +
				"<p>Vote finishes on " + 
				finishDate + "</p>");

			} else if (_voteStart.args.tag[0] == 1) {

				var html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Vote Started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for bug #" + _voteStart.args.tag[2] + "</p>" +
				"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
				_voteStart.args.tag[1] + "\">" + 
				updateNames.get(_voteStart.args.tag[1]) + "</a></p>" +
				"</div>";

				$("#vote").html("<h5>Vote is active.</h5>"+
				"<p>Vote is on bug" +
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				_voteStart.args.tag[1]+ "/bug/" +
				_voteStart.args.tag[2] + "\">" +
				"#" + _voteStart.args.tag[2] + 
				"</a><br>" +
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				_voteStart.args.tag[1] + "\">" +
				"Go to thread.</a>" +
				"<p>Vote Count: <br><span id =\"voteYes\"></span>% think it's a bug." +
				"<span id=\"voteNo\"></span> don't think it's a bug.</p>" +
				"<p>If you haven't done so already:</p>" +
				"<a href=\"/tokenHome/" + token.id + 
				"/forum/" + _voteStart.args.tag[1] +
				"/voteForBug/" + _voteStart.args.tag[2] +
				"Vote</a>" +
				"<p>Vote finishes on " + 
				finishDate + "</p>");
			}
			$("#latestEvents").prepend(html);	
		}

		newVote.watch((err,vote) => {
			$("#voteYes").html(vote.args.yes);		
			$("#voteNo").html(vote.args.no);		
		});

		auctionFinish.get((err,auctionEnd) => {

			let date = new Date(auctionEnd.args.time * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Auction Finished" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>#" + auctionEnd.args.auctionId + "</p>" + 
			"<p>Sold " + aunctionEnd.args.amount + " " +
			token.name + " to " + auctionEnd.args.winner +
			" for " + auctionEnd.args.price + " wei." +
			"</div>";

			$("#latestEvents").prepend(html);	

			$("#auction").html("<h4>No active auctions</h4" +
			"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>");
		});

		auctionStart.get((err,auctionStart) => {

			let date = new Date(auctionStart.args.time * 1000);
			let finishDate = new Date(auctionStart.args.finishTime * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Auction Started" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>#" + auctionStart.args.auctionId + 
			" for " + auctionStart.args.amount + " " + 
			token.name +"</p></div>"; 
			$("#latestEvents").prepend(html);	

			$("#auction").html("<h5>Auction #" +
			auctionStart.args.auctionId +
			" is active.</h5>" +
			"<p>Selling " + auctionStart.args.amount +
			" " + token.name + ".</p>" +
			"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>" +
			"<a href=\"/tokenHome/" + token.id +
			"/auctionHouse/" + auctionStart.args.auctionId +
			"\">Enter Bidding</a>" +
			"<p>Finishes on " + finishDate + "</p>");
		});	

		bugHuntFinish.get((err,bugHuntEnd) => {

			let date = new Date(bugHuntEnd.args.time * 1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">BugHunt has finished" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>for " + "<a href=\"/tokenHome/" + token.id +
			"/forum/" + bugHuntEnd.args.updateId + "\">" + 
			updateNames.get(bugHuntEnd.args.updateId) +
			"</a></p></div>";

			$("#latestEvents").prepend(html);	
		});

		var newTokenAddress, bugHuntFinishTime;

		bugHuntStart.get((err,_bugHuntStart) => {

			let id = SHA256(_bugHuntStart.args.time + _bugHuntStart.args.updatedContract + token.ManagerAddress);
			newTokenAddress = _bugHuntStart.args.updatedContract; 
			bugHuntFinishTime = _bugHuntStart.args.finishTime;
			let date = new Date(_bugHuntStart.args.time * 1000);
			let finishDate = new Date(bugHuntFinishTime *1000);

			var html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">BugHunt has started" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>for " + "<a href=\"/tokenHome/" + token.id +
			"/forum/" + _bugHuntStart.args.updateId + "\">" + 
			updateNames.get(_bugHuntStart.args.updateId) +
			"</a></p></div>";

			$("#latestEvents").prepend(html);	

			$("#update").html("<h5>Update has been submitted" +
			"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
			"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h5>" +
			"Contract is deployed at address:<br>" +
			newTokenAddress + "</p>" +
			"<p>BugHunt is active.<br>" +
			"Have you found a bug?<br>" +
			"<button class=\"btn btn-default\" href=\"/tokenHome/" +
			token.id + "/submitBug/" + _bugHuntStart.args.updateId + 
			"Submit Bug</button><br>" +
			"Finishes at " + finishDate + "</p>");
		});

		bugFound.get((err, bugFind) => {

			let date = new Date(bugFind.args.time * 1000);

			let html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Bug was Found" +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>ID: " + bugFinds.args.bugId + "</p>" +
			"<a href=\"/tokenHome/" + token.id +
			"/forum/" + bugFinds.args.updateId + "\">" + 
			"Go to thread.</a>" +
			"<p>Please inform yourself and vote on<br> whether this is a bug</p>";

			$("#latestEvents").prepend(html);	
		});

		wasABug((err, yesABug) => {

			let date = new Date(yesABug.args.time * 1000);
			let finishDate = new Date(yesABug.args.finishTime *1000);

			let html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">A bug was validated." + 
			"<small> at " + date + 
			"</small></h4>" +
			"<p>ID: " + yesABug.args.bugId + "</p>" +
			"<a href=\"/tokenHome/" + token.id +
			"/forum/" + yesABug.args.updateId + "\">" + 
			"Go to thread." + "</a></p>" +
			"<p>The developer now has<br>" + yesABug.args.tries+ 
			" more tries to complete the update.<br>";  

			$("#latestEvents").prepend(html);	

			$("#update").html("<h4>Update is being corrected after bug was found.</h4>" +
			"<p>The developer now has<br>" + yesABug.args.tries+ 
			" more tries to complete the update.<br>" +  
			"<p>Deadline is: " + finishDate +
			"<br>Are you the developer and have finished?" +
			"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
			token.id + "/submitUpdate/" + yesABug.args.udpateId + "\">" +
			"Submit Update</a></p>");
		});

		wasNotABug((err, notABug) => { 

			let date = new Date(notABug.args.time * 1000);
			let finishDate = new Date(bugHuntFinishTime *1000);

			let html = "<div class=\"media-body\">" +
			"<h4 class=\"media-heading\">Bug was unvalidated." +
			"<small> at " + date + 
			"</small></h4>" +
			"<p>ID: " + notABug.args.bugId + "</p>" +
			"<a href=\"/tokenHome/" + token.id +
			"/forum/" + notABug.args.updateId + "\">" + 
			"Go to thread." + "</a></p>";

			$("#latestEvents").prepend(html);	

			$("#update").html("<h5>Update has been submitted" +
			"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
			"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h5>" +
			"Contract is deployed at address:<br>" +
			newTokenAddress + "</p>" +
			"<p>BugHunt is active.<br>" +
			"Have you found a bug?<br>" +
			"<button class=\"btn btn-default\" href=\"/tokenHome/" +
			token.id + "/submitBug/" + notABug.args.updateId + 
			"Submit Bug</button><br>" +
			"Finishes at " + finishDate + "</p>");
		});
	},

	endUpdate: function() {
		tmInstance.endUpdate({from: account, gas: 4000000}, (err,result) => {
			if (err){
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	finaliseUpdate:
		tmInstance.finaliseUpdate({from: account, gas: 4000000}, (err,result) => {
			if (err){
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	endVote:
		tmInstance.endVote({from: account, gas: 4000000}, (err,result) => {
			if (err){
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	withdrawBets:
		tmInstance.withdrawReturnedBids({from: account, gas: 4000000}, (err,result) => {
			if (err){
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	endAuction:
		tmInstance.endAuction({from: account, gas: 4000000}, (err,result) => {
			if (err){
				alert(err);
			} else {
				alert(result);
			}
		});
	},

	endBounty:
		tmInstance.endBounty({from: account, gas: 4000000}, (err,result) => {
			if (err){
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
