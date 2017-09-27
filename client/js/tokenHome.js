import {default as Web3} from 'web3';
import {default as SHA256} from 'crypto-js/sha256';
import tokenManagerObject from '../../truffle/build/contracts/TokenManager.json';
import tokenObject from '../../truffle/build/contracts/NewToken.json';

let ropstenStartBlock = 1590000;

let Token, TokenManager;
let tokenAddress, tmAddress; 
let tokenInstance, tmInstance;
let account;

let updateNames = new Map();
	
let events = [];
let finishedUpdates = [];
let finishedAuctions = [];
let finishedVotes = [];
let finishedBounties = [];
let finishedBugHunts = [];
let finishedBugs = [];
let finishedChangeOvers = [];
let activeVote=0;
let activeUpdate=0;
let activeAuction=0;
let activeBug=0;
let newTokenAddress;
let bugHuntFinishTime;
let loadBlock;
let startBlock;
let netId;
let html, htmlUpdate, htmlVote, htmlAuction;


window.App = {
	start: function() {
	
		self = this;

		self.checkData();
		self.setDefault();

		Token = web3.eth.contract(token.abi);
		TokenManager = web3.eth.contract(tokenManagerObject.abi);
		tokenAddress = token.address;
		tmAddress = token.managerAddress;
		tokenManagerObject = Tok
		tmInstance = TokenManager.at(tmAddress);
		tokenInstance = Token.at(tokenAddress);
		self.setAccountInfo();
		for (let i = 0 ; i < updateTopics.length ; i++) {
			updateNames.set(updateTopics[i]._id, updateTopics[i].title);
		}
		web3.eth.getBlockNumber((err, result) => {
			loadBlock = result;	
			self.startWatch();
		});
	},

	setDefault: function() {
		htmlAuction = "<h4>No active auctions</h4>";
		htmlUpdate = "<h4>No active updates</h4>";
		htmlVote = "<h4>No active votes</h4>";
		html = "";
	},
		
	fillPage: function () {	

		//CHANGEOVER
		let changeOverStart = tmInstance.ChangeOver({},{fromBlock: startBlock});
		let changeOverFinish = tmInstance.OldContractDead({},{fromBlock: startBlock});
		
		//UPDATE
		let updateStart = tmInstance.UpdateStarted({},{fromBlock: startBlock});
		let updateFinish = tmInstance.UpdateOutcome({},{fromBlock: startBlock});

		//VOTE
		let voteStart = tmInstance.VoteStarted({},{fromBlock: startBlock});
		let voteFinish = tmInstance.VotingOutcome({},{fromBlock: startBlock});

		//AUCTION
		let auctionStart = tmInstance.AuctionStarted({},{fromBlock: startBlock});
		let auctionFinish = tmInstance.AuctionEnd({},{fromBlock: startBlock});


		//BOUNTY
		let bountyStart = 	tmInstance.BountyStarted({},{fromBlock: startBlock});
		let bountyFinish = tmInstance.BountyEnd({},{fromBlock: startBlock});

		let bugFound = tmInstance.BugFound({},{fromBlock: startBlock});

		//BUGHUNT
		let bugHuntStart = tmInstance.BugHuntStarted({},{fromBlock: startBlock});
		let bugHuntFinish = tmInstance.BugHuntEnd({},{fromBlock: startBlock});
		let wasABug = tmInstance.WasABug({},{fromBlock: startBlock});
		let wasNotABug = tmInstance.WasNotABug({},{fromBlock: startBlock});

		let newVote = tmInstance.NewVote({},{fromBlock: startBlock});

		let developerStart = tmInstance.DeveloperStarted({},{fromBlock: startBlock});
		events = [];

		let d = new Date();
		let nowInSeconds = d.getTime() / 1000;
		

		updateFinish.get((err,updateEnds) => {

			for (let i = 0; i < updateEnds.length; i++) {

				let date = new Date(updateEnds[i].args.time * 1000);
				let success = (updateEnds[i].args.success)?'successful':'unsuccessful';
	
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Update Finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>" + success + "</p>"+  
				"<a href=\"/tokenHome/" + token.id + "/forum/" + 
				updateEnds[i].args.updateId.toString(16) + "\">" + 
				updateNames.get(updateEnds[i].args.updateId.toString(16)) + "</a>" +
				"</div>"; 

				events.push([updateEnds[i].args.time, html]);	
				finishedUpdates.push(updateEnds[i].args.updateId.toString(16));

			}
			
			updateStart.get((err,updateStarts) => {

				for (let i = 0; i < updateStarts.length; i++) {

					let date = new Date(updateStarts[i].args.time * 1000);
						
					html = "<div class=\"media-body\">" +
					"<h4 class=\"media-heading\">Update Started" +
					"<small> at " + date + 
					"</small></h4>" +
					"<a href=\"/tokenHome/" + token.id + "/forum/" + 
					updateStarts[i].args.updateId.toString(16) + "\">" + 
					updateNames.get(updateStarts[i].args.updateId.toString(16)) + "</a>" +
					"</div>"; 

					events.push([updateStarts[i].args.time, html]);	

					if ($.inArray(updateStarts[i].args.updateId.toString(16), finishedUpdates) < 0) {

						activeUpdate = updateStarts[i].args.updateId.toString(16);

					}
				}

				bountyFinish.get((err,bountyEnds) => {

					for (let i = 0; i < bountyEnds.length; i++) {

						let date = new Date(bountyEnds[i].args.time * 1000);

						html = "<div class=\"media-body\">" +
						"<h4 class=\"media-heading\">BountyHunt Finished" +
						"<small> at " + date + 
						"</small></h4>" +
						"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
						bountyEnds[i].args.updateId.toString(16) + "\">" + 
						updateNames.get(bountyEnds[i].args.updateId.toString(16)) + "</a></p>";

						if (bountyEnds[i].args.price == 0) {

							html += "<p>No developer was found for this update</p>";

						} else {

							html += "<p>Winner is: "+bountyEnds[i].args.winner +
							"</p><p>Price for update is: " +
							bountyEnds[i].args.price + "</p></div>";

						}

						events.push([bountyEnds[i].args.time, html]);	
						finishedBounties.push(bountyEnds[i].args.updateId.toString(16));

						if (bountyEnds[i].args.updateId.toString(16) == activeUpdate) {

							$("#update").html("<h4>Update is pending.</h4>"+
							"<a href=\"/tokenHome/" + token.id + "/forum/" +
							bountyEnds[i].args.updateId.toString(16) + "\">" +
							"Go to thread.</a>" +
							"<p>Vote is active.</p>" +
							"<p>Please vote if you haven'done so already.</p>");
						}
					}
					bountyStart.get((err, bountyStarts) => {

						for (let i = 0; i < bountyStarts.length ; i++) { 

							let date = new Date(bountyStarts[i].args.time * 1000);
							let finishDate = new Date(bountyStarts[i].args.finishTime *1000);

							html = "<div class=\"media-body\">" +
							"<h4 class=\"media-heading\">BountyHunt Started" +
							"<small> at " + date + 
							"</small></h4>" +
							"<p> for update: " + bountyStarts[i].args.updateId.toString(16); 

							if($.inArray(bountyStarts[i].args.updateId.toString(16), finishedBounties) < 0) {
			
								$("#update").html("<h4>Update is pending.</h4>"+
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								bountyStarts[i].args.updateId.toString(16) + "\" target=\"_blank\">" +
								"Go to thread.</a>" +
								"<p>BountyHunt is active.</p>");

								if (bountyStarts[i].args.finishTime > nowInSeconds) {

									$("#update").append("<p>Are you a developer and want to work on this update?</p>" +
									"<a href=\"/tokenHome/" + token.id + "/bidForBounty/" +
									bountyStarts[i].args.updateId.toString(16) + "\">" +
									"Bid for Bounty</a><br>" +
									"<a target=\"_blank\" href=\"/api/bountydesc/" + SHA256((bountyStarts[i].args.safetyHash).toString(16) + bountyStarts[i].args.updateId.toString(16)).toString() + "\">See Description</a>" +
									"<p>BountyHunt finishes on " + 
									finishDate + "</p>");

								} else if (bountyStarts[i].args.finishTime < nowInSeconds) {

									$("#update").append("<p>BountyHunt is over, end it here:<br>" +
									"<a class=\"btn btn-default blockchain\" onclick=\"App.endBounty()\">" +
									"End BountyHunt</a></p>");
								}	
							}
							events.push([bountyStarts[i].args.time, html]);	
						}
						developerStart.get((err,developerStarts) => {

							for (let i = 0; i < developerStarts.length ; i++) { 

								let date = new Date(developerStarts[i].args.time * 1000);
								let finishDate = new Date(developerStarts[i].args.finishTime *1000);

								html = "<div class=\"media-body\">" +
								"<h4 class=\"media-heading\">Developer started working.</h4>" +
								"<p> Developer: <br> " +
								developerStarts[i].args.developer +
								"Started working on update:<br>" + 
								"<a href=\"/tokenHome/" + token.id + "/forum/" +
								developerStarts[i].args.updateId.toString(16) + "\">" +
								updateNames.get(developerStarts[i].args.updateId.toString(16)) +
								"</a><br>"	
								"<small> at " + date + 
								"</small></p>";

								events.push([developerStarts[i].args.time, html]);	

								if (developerStarts[i].args.updateId.toString(16) == activeUpdate) {

									$("#update").html("<h4>Update is being developed.</h4>"+
									"<a href=\"/tokenHome/" + token.id + "/forum/" +
									developerStarts[i].args.updateId.toString(16) + "\">" +
									"Go to thread.</a>" +
									"<p>Developer is:<br>" + developerStarts[i].args.developer + "</p>"); 

									if (developerStarts[i].args.finishTime > nowInSeconds) {

										$("#update").append("<p>Deadline is: " + Date(developerStarts[i].args.finishTime) +
										"<br>Are you the developer and have finished?" +
										"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
										token.id + "/submitUpdate/" + developerStarts[i].args.updateId.toString(16) + "\">" +
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
							voteFinish.get((err, voteEnds) => {

								for (let i = 0 ; i < voteEnds.length ; i++) {

									let date = new Date(voteEnds[i].args.time * 1000);
									let success = (voteEnds[i].args.success)?'successful':'unsuccessful';	

									if (voteEnds[i].args.tag[0] == 0) {

										html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote finished" +
										"<small> at " + date + 
										"</small></h4>" +
										"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
										voteEnds[i].args.tag[1].toString(16) + "\">" + 
										updateNames.get(voteEnds[i].args.tag[1].toString(16)) + "</a></p>" +
										"<p>" + success + "</p>"+  
										"</div>"; 
											
									} else if (voteEnds[i].args.tag[0] == 1) {

										html = "<div class=\"media-body\">" +
										"<h4 class=\"media-heading\">Vote Finished" +
										"<small> at " + date + 
										"</small></h4>" +
										"<p>for bug :" + voteEnds[i].args.tag[2].toString(16) + "</p>" +
										"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
										voteEnds[i].args.tag[1].toString(16) + "\">" + 
										updateNames.get(voteEnds[i].args.tag[1].toString(16)) + "</a></p>" +
										"<p>" + success + "</p>"+  
										"</div>";
									}

									events.push([voteEnds[i].args.time, html]);	
									finishedVotes.push(voteEnds[i].args.tag.toString());
								}
								voteStart.get((err, voteStarts) => {
			
									for (let i = 0 ; i < voteStarts.length ; i++) {

										let date = new Date(voteStarts[i].args.time * 1000);
										let finishDate = new Date(voteStarts[i].args.finishTime *1000);

										if (voteStarts[i].args.tag[0] == 0) {

											html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + date + 
											"</small></h4>" +
											"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
											voteStarts[i].args.tag[1].toString(16) + "\">" + 
											updateNames.get(voteStarts[i].args.tag[1].toString(16)) + "</a></p>" +
											"</div>"; 

											if ($.inArray(voteStarts[i].args.tag.toString(), finishedVotes) < 0) {

												$("#vote").html("<h4>Vote is active.</h4>"+
												"<p>Vote is on update.<br>" +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1].toString(16) + "\">" +
												voteStarts[i].args.tag[1].toString(16) + "</a></p>" +
												"<p>Vote Count: <br><span id =\"voteYes\">0</span>% for update" +
												"<span id=\"voteNo\">0</span>% against update</p>");

												if (voteStarts[i].args.finishTime > nowInSeconds) {

													$("#vote").append("<div id=\"youVoted\">" +
													"<p>You haven't voted yet</p>" +
													"<a class=\"btn btn-default blockchain\"" +
													"href=\"/tokenHome/" + token.id + 
													"/vote\">Vote</a></div>" +
													"<p>Vote finishes on " + 
													finishDate + "</p>");

												} else if (voteStarts[i].args.finishTime < nowInSeconds) {

													$("#vote").append("<p>Deadline is over.</p>" +
													"End vote here:<br>" +
													"<a class=\"btn btn-default blockchain\" onclick=\"App.endVote()\">" +
													"End Vote</a></p>"); 
												}
													
												activeVote = voteStarts[i].args.tag.toString(); 
											}

										} else if (voteStarts[i].args.tag[0] == 1) {

											html = "<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">Vote Started" +
											"<small> at " + date + 
											"</small></h4>" +
											"<p>for bug " + voteStarts[i].args.tag[2].toString(16) + "</p>" +
											"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
											voteStarts[i].args.tag[1].toString(16) + "\">" + 
											updateNames.get(voteStarts[i].args.tag[1].toString(16)) + "</a></p>" +
											"</div>";

											if ($.inArray(voteStarts[i].args.tag.toString(), finishedVotes) < 0) {

												$("#vote").html("<h4>Vote is active.</h4>"+
												"<p>Vote is on bug" +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1].toString(16)+ "/bug/" +
												voteStarts[i].args.tag[2].toString(16) + "\">" +
												voteStarts[i].args.tag[2].toString(16) + 
												"</a><br>" +
												"<a href=\"/tokenHome/" + token.id + "/forum/" +
												voteStarts[i].args.tag[1].toString(16) + "\">" +
												"Go to thread.</a>" +
												"<p>Vote Count: <br><span id =\"voteYes\">0</span>% think it's a bug." +
												"<span id=\"voteNo\">0</span>% don't think it's a bug.</p>");

												if (voteStarts[i].args.finishTime > nowInSeconds) {

													$("#vote").append("<div id=\"youVoted\">" +
													"<p>You haven't voted yet.</p>" +
													"<a class=\"btn btn-default blockchain\"" +
													"href=\"/tokenHome/" + token.id + 
													"/vote\">Vote</a></div>" +
													"<p>Vote finishes on " + 
													finishDate + "</p>");

												} else if (voteStarts[i].args.finishTime < nowInSeconds) {

													$("#vote").append("<p>Deadline is over.</p>" +
													"End vote here:<br>" +
													"<a class=\"btn btn-default blockchain\" onclick=\"App.endVote()\">" +
													"End Vote</a></p>"); 
												}
												activeVote = voteStarts[i].args.tag.toString(); 
											}
										}
										events.push([voteStarts[i].args.time, html]);	
									}
									newVote.get((err,votes) => {

										for (let i = 0; i < votes.length ; i++) {

											if (votes[i].args.tag.toString() == activeVote){

												$("#voteYes").text(votes[i].args.yes);		
												$("#voteNo").text(votes[i].args.no);		

												if (votes[i].args.from == account){

													$("#youVoted").html("<p>Thanks for voting.<br>" +
													"Your funds will be released as soon as the vote ends.</p>");
												}
											}
										}
										auctionFinish.get((err,auctionEnds) => {

											for (let i ; i < auctionEnds.length ; i++) {

												let date = new Date(auctionEnds[i].args.time * 1000);

												html = "<div class=\"media-body\">" +
												"<h4 class=\"media-heading\">Auction Finished" +
												"<small> at " + date + 
												"</small></h4>" +
												"<p>Number " + auctionEnds[i].args.auctionId + "</p>" + 
												"<p>Sold " + aunctionEnds[i].args.amount + " " +
												token.name + " to " + auctionEnds[i].args.winner +
												" for " + auctionEnds[i].args.price + " wei." +
												"</div>";
												events.push([auctionEnds[i].args.time, html]);	
												finishedAuctions.push(auctionEnds[i].args.auctionId);
											}
											auctionStart.get((err,auctionStarts) => {

												for (let i = 0; i < auctionStarts.length ; i++) { 

													let date = new Date(auctionStarts[i].args.time * 1000);
													let finishDate = new Date(auctionStarts[i].args.finishTime *1000);

													html = "<div class=\"media-body\">" +
													"<h4 class=\"media-heading\">Auction Started" +
													"<small> at " + date + 
													"</small></h4>" +
													"<p>Number " + auctionStarts[i].args.auctionId + 
													" for " + auctionStarts[i].args.amount + " " + 
													token.name +"</p></div>"; 
													events.push([auctionStarts[i].args.time, html]);	

													if($.inArray(auctionStarts[i].args.auctionId, finishedAuctions < 0 )) {

														$("#auction").html("<h4>Auction Number" +
														auctionStarts[i].args.auctionId +
														" is active.</h4>" +
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

													for (let i = 0; i < bugHuntEnds.length ; i++) { 

														let date = new Date(bugHuntEnds[i].args.time * 1000);

														html = "<div class=\"media-body\">" +
														"<h4 class=\"media-heading\">BugHunt has finished" +
														"<small> at " + date + 
														"</small></h4>" +
														"<p>for " + "<a href=\"/tokenHome/" + token.id +
														"/forum/" + bugHuntEnds[i].args.updateId.toString(16) + "\">" + 
														updateNames.get(bugHuntEnds[i].args.updateId.toString(16)) +
														"</a></p></div>";
														finishedBugHunts.push([bugHuntEnds[i].args.updateId.toString(16), bugHuntEnds[i].args.bugHuntNumber]);
														events.push([bugHuntEnds[i].args.time, html]);	
													}
													bugHuntStart.get((err,bugHuntStarts) => {

														for (let i = 0; i < bugHuntStarts.length ; i++) { 

															let date = new Date(bugHuntStarts[i].args.time * 1000);
															let finishDate = new Date(bugHuntStarts[i].args.finishTime *1000);

															html = "<div class=\"media-body\">" +
															"<h4 class=\"media-heading\">BugHunt has started" +
															"<small> at " + date + "</small></h4>" +
															"<p>for <a href=\"/tokenHome/" + token.id +
															"/forum/" + bugHuntStarts[i].args.updateId.toString(16) + "\">" + 
															updateNames.get(bugHuntStarts[i].args.updateId.toString(16)) +
															"</a></p></div>";
															events.push([bugHuntStarts[i].args.time, html]);	

															if ($.inArray([bugHuntStarts[i].args.updateId.toString(16), 
															bugHuntStarts[i].args.bugHuntNumber], finishedBugHunts) < 0) {

																let id = SHA256(bugHuntStarts[i].args.creationTime + 
																bugHuntStarts[i].args.updatedContract + token.managerAddress).toString();

																newTokenAddress = bugHuntStarts[i].args.updatedContract; 
																bugHuntFinishTime = bugHuntStarts[i].args.finishTime;

																$("#update").html("<h4>Update has been submitted" +
																"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
																"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h4>" +
																"Contract is deployed at address:<br>" +
																newTokenAddress + "<br>Description of update is:<br>" +
																"<a target=\"_blank\" href=\"/api/bountydesc/" + 
																SHA256((bugHuntStarts[i].args.safetyHash).toString(16) + 
																bugHuntStarts[i].args.updateId.toString(16)).toString() + "\">Description</a></p>");

																activeBugHunt = [bugHuntStarts[i].args.updateId.toString(16), bugHuntStarts[i].args.bugHuntNumber];

																if (bugHuntFinishTime > nowInSeconds) {

																	$("#update").append("<p>BugHunt is active.<br>" +
																	"Have you found a bug?<br>" +
																	"<a class=\"btn btn-default\" href=\"/tokenHome/" +
																	token.id + "/submitBug/" + bugHuntStarts[i].args.updateId.toString(16) + "\">" +
																	"Submit Bug</a><br>" +
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
														wasABug.get((err, yesABug) => {

															for (let i = 0; i < yesABug.length ; i++) { 

																let date = new Date(yesABug[i].args.time * 1000);
																let finishDate = new Date(yesABug[i].args.finishTime *1000);

																html = "<div class=\"media-body\">" +
																"<h4 class=\"media-heading\">A bug was validated." + 
																"<small> at " + date + 
																"</small></h4>" +
																"<p>ID: " + yesABug[i].args.bugId.toString(16) + "</p>" +
																"<a href=\"/tokenHome/" + token.id +
																"/forum/" + yesABug[i].args.updateId.toString(16) + "\">" + 
																"Go to thread." + "</a></p>" +
																"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																" more tries to complete the update.<br>";  
																events.push([yesABug[i].args.time, html]);	
																finishedBugs.push(yesABug[i].args.bugId.toString(16));

																if ([yesABug[i].args.updateId.toString(16), yesABug[i].args.bugHuntNumber] == activeBugHunt) {

																	if (yesABug[i].args.finishTime > nowInSeconds) {

																		$("#update").html("<h4>Update is being corrected after bug was found.</h4>" +
																		"<p>The developer now has<br>" + yesABug[i].args.tries+ 
																		" more tries to complete the update.<br>" +  
																		"<p>Deadline is: " + finishDate +
																		"<br>Are you the developer and have finished?" +
																		"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
																		token.id + "/submitUpdate/" + yesABug[i].args.updateId.toString(16)+ "\">" +
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
															wasNotABug.get((err, notABug) => { 

																for (let i = 0; i < notABug.length ; i++) { 

																	let date = new Date(notABug[i].args.time * 1000);
																	let finishDate = new Date(bugHuntFinishTime *1000);

																	html = "<div class=\"media-body\">" +
																	"<h4 class=\"media-heading\">Bug was unvalidated." +
																	"<small> at " + date + 
																	"</small></h4>" +
																	"<p>ID: " + notABug[i].args.bugId.toString(16) + "</p>" +
																	"<a href=\"/tokenHome/" + token.id +
																	"/forum/" + notABug[i].args.updateId.toString(16) + "\">" + 
																	"Go to thread." + "</a></p>";

																	events.push([notABug[i].args.time, html]);	
																	finishedBugs.push(yesABug[i].args.bugId.toString(16));

																	if ([notABug[i].args.updateId.toString(16), notABug[i].args.bugHuntNumber] == activeBugHunt) {

																		$("#update").html("<h4>Update has been submitted" +
																		"<a href=\"/api/tokens/" + token.id + "/sourceCode\" target=\"_blank\"" +
																		"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h4>" +
																		"Contract is deployed at address:<br>" +
																		newTokenAddress + "</p>");

																		if (bugHuntFinishTime > nowInSeconds) {

																			$("#update").append("<p>BugHunt is active.<br>" +
																			"Have you found a bug?<br>" +
																			"<a class=\"btn btn-default\" href=\"/tokenHome/" +
																			token.id + "/submitBug/" + notABug[i].args.updateId.toString(16) + "\">"+ 
																			"Submit Bug</a><br>" +
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

																	for (let i = 0; i < bugFinds.length ; i++) { 
				
																		let date = new Date(bugFinds[i].args.time * 1000);

																		html = "<div class=\"media-body\">" +
																		"<h4 class=\"media-heading\">Bug was found." +
																		"<small> at " + date + 
																		"</small></h4>" +
																		"<p>ID: " + bugFinds[i].args.bugId.toString(16) + "</p>" +
																		"<a href=\"/tokenHome/" + token.id +
																		"/forum/" + bugFinds[i].args.updateId.toString(16) + "\">" + 
																		"Go to thread." + "</a></p>";

																		events.push([bugFinds[i].args.time, html]);	
	
																		if ($.inArray(bugFinds[i].args.bugId, finishedBugs) < 0) {

																			$("#update").html("<div class=\"media-body\">" +
																			"<h4 class=\"media-heading\">Bug was Found" +
																			"<small> at " + date + 
																			"</small></h4>" +
																			"<a href=\"/api/bugs/" + bugFinds[i].args.bugId.toString(15) + "\">" + bugFinds[i].args.bugId.toString(16) +"</a>" +
																			"<a href=\"/tokenHome/" + token.id +
																			"/forum/" + bugFinds[i].args.updateId.toString(16) + "\">" + 
																			"Go to thread.</a>" +
																			"<p>Please inform yourself and vote on<br> whether this is a bug</p>");
																		}
																	}
																	changeOverFinish.get((err,changeOverEnds) => {
																		for (let i = 0;i < changeOverEnds.length; i++) {

																			finishedChangeOvers.push(changeOverEnds[i].args.updateId.toString(16));
																		}
																		changeOverStart.get((err,changeOverStarts) => {

																			for(let i = 0;i <changeOverStarts.length; i++) {

																				if ($.inArray(changeOverStarts[i].args.updateId.toString(16), finishedChangeOvers) <0){

																					let _date = new Date(changeOverStarts[i].args.finishTime * 1000)

																					if (changeOverStarts[i].args.finishTime > nowInSeconds){ 

																						$("#update").html("<h4>Update has been implemented</h4>" +
																						"<p>You have until " + _date + " to transfer your funds.<br>" +
																						"This is your responsibility and failure to do so will <br>" +
																						"result in the complete loss of your funds.</p>" +
																						"<button class=\"btn btn-default blockchain\" onclick=\"App.transferFunds()\">" +
																						"Transfer</button>");

																					} else {

																						$("#update").html("<h4>Time to get rid of the old contract!</h4>" +
																						"<button class=\"btn btn-default blockchain\" onclick=\"App.killOldContract()\">" +
																						"Kill</button>");
																					}
																				}
																			}
																			events.sort(function(a,b){
																				return a[0] - b[0];
																			}); 
																			for (let i = 0; i < events.length ; i++) {
																				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + events[i][1] + "</div>");
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
			});
		});
	},	

	killOldContract: function() {
		tmInstance.killOldContract({from: account, gas: 400000}, (err, result) => {
			if (err) {
				alert(err);
			} else {
				alert(result);
			}
		});	
	},
	
	transferFunds: function() {
		tmInstance.transferToNewContract({from: account, gas: 400000}, (err, result) => {
			if (err) {
				alert(err);
			} else {
				alert(result);
			}
		});	
	},

	startWatch: function(){

		//CHANGEOVER
		let changeOverStart = tmInstance.ChangeOver({},{fromBlock: 'latest'});
		let changeOverFinish = tmInstance.OldContractDead({},{fromBlock: 'latest'});

		//UPDATE
		let updateStart = tmInstance.UpdateStarted({},{fromBlock: 'latest'});
		let updateFinish = tmInstance.UpdateOutcome({},{fromBlock: 'latest'});

		//VOTE
		let voteStart = tmInstance.VoteStarted({},{fromBlock: 'latest'});
		let voteFinish = tmInstance.VotingOutcome({},{fromBlock: 'latest'});

		//AUCTION
		let auctionStart = tmInstance.AuctionStarted({},{fromBlock: 'latest'});
		let auctionFinish = tmInstance.AuctionEnd({},{fromBlock: 'latest'});


		//BOUNTY
		let bountyStart = 	tmInstance.BountyStarted({},{fromBlock: 'latest'});
		let bountyFinish = tmInstance.BountyEnd({},{fromBlock: 'latest'});

		let bugFound = tmInstance.BugFound({},{fromBlock: 'latest'});

		//BUGHUNT
		let bugHuntStart = tmInstance.BugHuntStarted({},{fromBlock: 'latest'});
		let bugHuntFinish = tmInstance.BugHuntEnd({},{fromBlock: 'latest'});
		let wasABug = tmInstance.WasABug({},{fromBlock: 'latest'});
		let wasNotABug = tmInstance.WasNotABug({},{fromBlock: 'latest'});

		let newVote = tmInstance.NewVote({},{fromBlock: 'latest'});

		let developerStart = tmInstance.DeveloperStarted({},{fromBlock: 'latest'});

		changeOverFinish.watch((err,changeOverEnd) => {

			if (changeOverEnd.blockNumber != loadBlock) {

				$("#update").html("<h4>No active updates</h4>");
			}
		});

		changeOverStart.watch((err,changeOverStart) => {

			if (changeOverStart.blockNumber != loadBlock) {

				let _date = new Date(changeOverStart.args.finishTime * 1000);

				$("#update").html("<h4>Update has been implemented</h4>" +
				"<p>You have until " + _date + " to transfer your funds.<br>" +
				"This is your responsibility and failure to do so will <br>" +
				"result in the complete loss of your funds.</p>" +
				"<button class=\"btn btn-default\" onclick=\"App.transferFunds()\">" +
				"Transfer</button>");
			}
		});

		updateFinish.watch((err,updateEnd) => {

			if (updateEnd.blockNumber != loadBlock) {

				let date = new Date(updateEnd.args.time * 1000);
				let success = (updateEnd.args.success)?'successful':'unsuccessful';
				let html;
				activeUpdate = 0;
		
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Update Finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>" + success + "</p>"+  
				"<a href=\"/tokenHome/" + token.id + "/forum/" + 
				updateEnd.args.updateId.toString(16) + "\">" + 
				updateNames.get(updateEnd.args.updateId.toString(16)) + "</a>" +
				"</div>"; 
				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
				$("#update").html("<h4>No active updates.</h4>");
			}

		});

		updateStart.watch((err,updateStart) => {
			if (updateStart.blockNumber != loadBlock) {

				let date = new Date(updateStart.args.time * 1000);
				let html;
				activeUpdate = updateStart.args.updateId.toString(16);
			
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Update Started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<a href=\"/tokenHome/" + token.id + "/forum/" + 
				updateStart.args.updateId.toString(16) + "\">" + 
				updateNames.get(updateStart.args.updateId.toString(16)) + "</a>" +
				"</div>"; 
				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
			}

		});

		bountyFinish.watch((err,bountyEnd) => {

			if (bountyEnd.blockNumber != loadBlock) {

				let date = new Date(bountyEnd.args.time * 1000);
				let html;

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">BountyHunt Finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
				bountyEnd.args.updateId.toString(16) + "\">" + 
				updateNames.get(bountyEnd.args.updateId.toString(16)) + "</a></p>";
	
				if (bountyEnd.args.price == 0) {
	
					html += "<p>No developer was found for this update</p>";

				} else {

					html += "<p>Winner is: "+bountyEnd.args.winner +
					"</p><p>Price for updateis: " +
					bountyEnd.args.price + "</p></div>";
				}

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				if (activeUpdate == bountyEnd.args.updateId.toString(16)) {	

					$("#update").html("<h4>Update is pending.</h4>"+
					"<a href=\"/tokenHome/" + token.id + "/forum/" +
					bountyEnd.args.updateId.toString(16) + "\">" +
					"Go to thread.</a>" +
					"<p>Vote is active.</p>" +
					"<p>Please vote if you havenii'done so already.</p>");

				} else {

					$("#update").html("<h4>No active updates</h4>");
				}
			}
		});

		bountyStart.watch((err, bountyStart) => {

			if (bountyStart.blockNumber != loadBlock) {
		
				let date = new Date(bountyStart.args.time * 1000);
				let finishDate = new Date(bountyStart.args.finishTime *1000);

				let html;

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">BountyHunt Started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p> for update " + bountyStart.args.updateId.toString(16); 
				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
				
				$("#update").html("<h4>Update is pending.</h4>"+
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				bountyStart.args.updateId.toString(16) + "\">" +
				"Go to thread.</a>" +
				"<p>BountyHunt is active.</p>" +
				"<p>Are you a developer and want to work on this update?</p>" +
				"<a href=\"/tokenHome/" + token.id + "/bidForBounty/" +
				bountyStart.args.updateId.toString(16) + "\">" +
				"Bid for Bounty</a>" +
				"<p>BountyHunt finishes on " + 
				finishDate + "</p>");
			}
		});

		developerStart.watch((err,developerStart) => {

			if (developerStart.blockNumber != loadBlock) {

				let date = new Date(developerStart.args.time * 1000);
				let finishDate = new Date(developerStart.args.finishTime * 1000);
				let html;

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Developer started working.</h4>" +
				"<p> Developer: <br> " +
				developerStart.args.developer +
				"Started working on update:<br>" + 
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				developerStart.args.updateId.toString(16) + "\">" +
				updateNames.get(developerStart.args.updateId.toString(16)) +
				"</a><br>" +
				"<small> at " + date + 
				"</small></p>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				$("#update").html("<h4>Update is being developed.</h4>"+
				"<a href=\"/tokenHome/" + token.id + "/forum/" +
				developerStart.args.updateId.toString(16) + "\">" +
				"Go to thread.</a>" +
				"<p>Developer is:<br>" + developerStart.args.developer + "</p>" + 
				"<p>Deadline is: " + finishDate +
				"<br>Are you the developer and have finished?" +
				"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
				token.id + "/submitUpdate/" + developerStart.args.updateId.toString(16)+ "\">" +
				"Submit Update</a></p>");
			}
		});

		voteFinish.watch((err, voteEnd) => {

			if (voteEnd.blockNumber != loadBlock) {

				let date = new Date(voteEnd.args.time * 1000);
				let success = (voteEnd.args.success)?'successful':'unsuccessful';	
				let html;

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
					"<p>for bug " + voteEnd.args.tag[2] + "</p>" +
					"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
					voteEnd.args.tag[1] + "\">" + 
					updateNames.get(voteEnd.args.tag[1]) + "</a></p>" +
					"<p>" + success + "</p>"+  
					"</div>";
				}

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
				$("#vote").html("<h4>No active votes</h4>");
			}
		});

		voteStart.watch((err, _voteStart) => {

			if (_voteStart.blockNumber != loadBlock) {

				let date = new Date(_voteStart.args.time * 1000);
				let finishDate = new Date(_voteStart.args.finishTime * 1000);
				let html;

				if (_voteStart.args.tag[0] == 0) {

					html = "<div class=\"media-body\">" +
					"<h4 class=\"media-heading\">Vote Started" +
					"<small> at " + date + 
					"</small></h4>" +
					"<p>for <a href=\"/tokenHome/" + token.id + "/forum/" + 
					_voteStart.args.tag[1].toString(16) + "\">" + 
					updateNames.get(_voteStart.args.tag[1].toString(16)) + "</a></p>" +
					"</div>"; 

					$("#vote").html("<h4>Vote is active.</h4>"+
					"<p>Vote is on update.<br>" +
					"<a href=\"/tokenHome/" + token.id + "/forum/" +
					_voteStart.args.tag[1].toString(16) + "\">" +
					_voteStart.args.tag[1].toString(16) + "</a></p>" +
					"<p>Vote Count: <br><span id =\"voteYes\">0</span>% for update" +
					"<span id=\"voteNo\">0</span>% against update</p>" +
					"<p>You haven't voted yet, please do so:</p>" +
					"<a href=\"/tokenHome/" + token.id + 
					"/vote\" class=\"btn btn-default\">" +
					"Vote</a>" +
					"<p>Vote finishes on " + 
					finishDate + "</p>");

				} else if (_voteStart.args.tag[0] == 1) {

					html = "<div class=\"media-body\">" +
					"<h4 class=\"media-heading\">Vote Started" +
					"<small> at " + date + 
					"</small></h4>" +
					"<p>for bug " + _voteStart.args.tag[2].toString(16) + "</p>" +
					"<p>in <a href=\"/tokenHome/" + token.id + "/forum/" + 
					_voteStart.args.tag[1].toString(16) + "\">" + 
					updateNames.get(_voteStart.args.tag[1].toString(16)) + "</a></p>" +
					"</div>";

					$("#vote").html("<h4>Vote is active.</h4>"+
					"<p>Vote is on bug" +
					"<a href=\"/tokenHome/" + token.id + "/forum/" +
					_voteStart.args.tag[1].toString(16) + "/bug/" +
					_voteStart.args.tag[2].toString(16) + "\">" +
					_voteStart.args.tag[2].toString(16) + 
					"</a><br>" +
					"<a href=\"/tokenHome/" + token.id + "/forum/" +
					_voteStart.args.tag[1].toString(16) + "\">" +
					"Go to thread.</a>" +
					"<p>Vote Count: <br><span id =\"voteYes\">0</span>% think it's a bug." +
					"<span id=\"voteNo\">0</span>% don't think it's a bug.</p>" +
					"<p>You haven't voted yet, please do so:</p>" +
					"<a class \"btn btn-default\" href=\"/tokenHome/" + token.id + 
					"/vote>Vote</a>" +
					"<p>Vote finishes on " + 
					finishDate + "</p>");
				}
				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
			}
		});

		newVote.watch((err,vote) => {

			if (vote.blockNumber != loadBlock) {

				$("#voteYes").text(vote.args.yes);		
				$("#voteNo").text(vote.args.no);		
				
				if (vote.args.from == account){

					$("#youVoted").html("<p>Thanks for voting.<br>" +
					"Your funds will be released as soon as the vote ends.</p>");
				}
			}
		});

		auctionFinish.watch((err,auctionEnd) => {

			if (auctionEnd.blockNumber != loadBlock) {

				let date = new Date(auctionEnd.args.time * 1000);
				let html;

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Auction Finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>Number " + auctionEnd.args.auctionId + "</p>" + 
				"<p>Sold " + aunctionEnd.args.amount + " " +
				token.name + " to " + auctionEnd.args.winner +
				" for " + auctionEnd.args.price + " wei." +
				"</div>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
				$("#auction").html("<h4>No active auctions</h4" +
				"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>");
			}
		});

		auctionStart.watch((err,auctionStart) => {

			if (auctionStart.blockNumber != loadBlock) {

				let date = new Date(auctionStart.args.time * 1000);
				let finishDate = new Date(auctionStart.args.finishTime * 1000);
				let html;
	
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Auction Started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>Number " + auctionStart.args.auctionId + 
				" for " + auctionStart.args.amount + " " + 
				token.name +"</p></div>"; 

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				$("#auction").html("<h4>Auction Number" +
				auctionStart.args.auctionId +
				" is active.</h4>" +
				"<p>Selling " + auctionStart.args.amount +
				" " + token.name + ".</p>" +
				"<button class=\"btn btn-default blockchain\" onclick=\"App.withdrawBets()\">Withdraw past bets</button>" +
				"<a href=\"/tokenHome/" + token.id +
				"/auctionHouse/" + auctionStart.args.auctionId +
				"\">Enter Bidding</a>" +
				"<p>Finishes on " + finishDate + "</p>");
			}
		});	

		bugHuntFinish.watch((err,bugHuntEnd) => {

			if (bugHuntEnd.blockNumber != loadBlock) {

				let date = new Date(bugHuntEnd.args.time * 1000);
				let html;

				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">BugHunt has finished" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for " + "<a href=\"/tokenHome/" + token.id +
				"/forum/" + bugHuntEnd.args.updateId.toString(16) + "\">" + 
				updateNames.get(bugHuntEnd.args.updateId.toString(16)) +
				"</a></p></div>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
			}
		});

		let newTokenAddress, bugHuntFinishTime;

		bugHuntStart.watch((err,_bugHuntStart) => {

			if (_bugHuntStart.blockNumber != loadBlock) {

				let id = SHA256(_bugHuntStart.args.creationTime + _bugHuntStart.args.updatedContract + token.ManagerAddress).toString();
				let date = new Date(_bugHuntStart.args.time * 1000);
				let finishDate = new Date(bugHuntFinishTime *1000);
				let html;
				newTokenAddress = _bugHuntStart.args.updatedContract; 
				bugHuntFinishTime = _bugHuntStart.args.finishTime;
	
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">BugHunt has started" +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>for " + "<a href=\"/tokenHome/" + token.id +
				"/forum/" + _bugHuntStart.args.updateId.toString(16) + "\">" + 
				updateNames.get(_bugHuntStart.args.updateId.toString(16)) +
				"</a></p></div>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				$("#update").html("<h4>Update has been submitted" +
				"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
				"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h4>" +
				"Contract is deployed at address:<br>" +
				newTokenAddress + "</p>" +
				"<p>BugHunt is active.<br>" +
				"Have you found a bug?<br>" +
				"<a class=\"btn btn-default\" href=\"/tokenHome/" +
				token.id + "/submitBug/" + _bugHuntStart.args.updateId.toString(16) + "\">" +
				"Submit Bug</a><br>" +
				"Finishes at " + finishDate + "</p>");
			}
		});

		bugFound.watch((err, bugFind) => {
			if (bugFind.blockNumber != loadBlock) {

				let date = new Date(bugFind.args.time * 1000);
				let html;
		
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Bug was Found" +
				"<small> at " + date + 
				"</small></h4>" +
				"<a href=\"/api/bugs/" + bugFind.args.bugId.toString(16) + "\">" + bugFind.args.bugId.toString(16) +"</a>" +
				"<a href=\"/tokenHome/" + token.id +
				"/forum/" + bugFinds.args.updateId.toString(16) + "\">" + 
				"Go to thread.</a>" +
				"<p>Please inform yourself and vote on<br> whether this is a bug</p>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	
			}
		});

		wasABug.watch((err, yesABug) => {

			if (yesABug.blockNumber != loadBlock) {

				let date = new Date(yesABug.args.time * 1000);
				let finishDate = new Date(yesABug.args.finishTime *1000);

				let html;
	
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">A bug was validated." + 
				"<small> at " + date + 
				"</small></h4>" +
				"<p>ID: " + yesABug.args.bugId.toString(16) + "</p>" +
				"<a href=\"/tokenHome/" + token.id +
				"/forum/" + yesABug.args.updateId.toString(16) + "\">" + 
				"Go to thread." + "</a></p>" +
				"<p>The developer now has<br>" + yesABug.args.tries+ 
				" more tries to complete the update.<br>";  

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				$("#update").html("<h4>Update is being corrected after bug was found.</h4>" +
				"<p>The developer now has<br>" + yesABug.args.tries+ 
				" more tries to complete the update.<br>" +  
				"<p>Deadline is: " + finishDate +
				"<br>Are you the developer and have finished?" +
				"<br><a class=\"btn btn-default blockchain\" href=\"/tokenHome/" +
				token.id + "/submitUpdate/" + yesABug.args.updateId.toString(16)+ "\">" +
				"Submit Update</a></p>");
			}
		});

		wasNotABug.watch((err, notABug) => { 

			if (notABug.blockNumber != loadBlock) {

				let date = new Date(notABug.args.time * 1000);
				let finishDate = new Date(bugHuntFinishTime *1000);
				let html;
	
				html = "<div class=\"media-body\">" +
				"<h4 class=\"media-heading\">Bug was unvalidated." +
				"<small> at " + date + 
				"</small></h4>" +
				"<p>ID: " + notABug.args.bugId.toString(16) + "</p>" +
				"<a href=\"/tokenHome/" + token.id +
				"/forum/" + notABug.args.updateId.toString(16) + "\">" + 
				"Go to thread." + "</a></p>";

				$("#latestEvents").prepend("<div style=\"border-style:solid; border-width:1px;\">" + html + "</div>");	

				$("#update").html("<h4>Update has been submitted" +
				"<a href=\"/api/tokens/" + id + "/sourceCode\" target=\"_blank\"" +
				"class=\"btn btn-default\"><span class=\"fa fa-file-text-o\"></span></a></h4>" +
				"Contract is deployed at address:<br>" +
				newTokenAddress + "</p>" +
				"<p>BugHunt is active.<br>" +
				"Have you found a bug?<br>" +
				"<a class=\"btn btn-default\" href=\"/tokenHome/" +
				token.id + "/submitBug/" + notABug.args.updateId.toString(16) + "\">" +
				"Submit Bug</a><br>" +
				"Finishes at " + finishDate + "</p>");
			}
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

	finaliseUpdate: function() {
		tmInstance.finaliseUpdate({from: account, gas: 4000000}, (err,result) => {

			if (err){
				alert(err);
			} else {
				alert(result);
			}

		});
	},

	endVote: function() {
		tmInstance.endVote({from: account, gas: 4000000}, (err,result) => {

			if (err){
				alert(err);
			} else {
				alert(result);
			}

		});
	},

	withdrawBets: function() {
		tmInstance.withdrawReturnedBids({from: account, gas: 4000000}, (err,result) => {

			if (err){
				alert(err);
			} else {
				alert(result);
			}

		});
	},

	endAuction: function() {
		tmInstance.endAuction({from: account, gas: 4000000}, (err,result) => {

			if (err){
				alert(err);
			} else {
				alert(result);
			}

		});
	},

	endBounty: function() {
		tmInstance.endBounty({from: account, gas: 4000000}, (err,result) => {

			if (err){
				alert(err);
			} else {
				alert(result);
			}

		});
	},

	checkData: function() {
		let _date = new Date(token.creationDate);

		if (SHA256((_date.getTime() / 1000) + token.address + token.managerAddress) != token.id) {
			alert("DANGER, DATA HAS BEEN ALTERED");
		}
	},

	setAccountInfo: function(){
		self = this;
		web3.eth.getAccounts((err, accs) => {

			if (err != null){
				console.log("error " + err)
			} else if (accs.length == 0){
				console.log("there are no accounts visisble");
			} else {
				account=accs[0];
				self.setNetworkInfo();
				self.loadWallet();
			}

		});
	},

	setNetworkInfo: function(){
		let self = this;
		
		web3.version.getNetwork((err, result) => {
			
			netId = result;

			switch (netId) {
				case '1':
					startBlock = mainStartBlock;
					break;
				case '3':
					startBlock = ropstenStartBlock;
					break;
				case '4':
					startBlock = rinkebyStartBlock;
					break;		
				default:
					startBlock = 0;
					break;
			}
			self.fillPage();
		});
	},
			

	loadWallet: function() {
		tokenInstance.balanceOf(account, (err,result) => {

			if (err){
				console.log("error getting account balance" + err);
			}

			let balance = result;

			if (typeof(balance) == 'undefined') {
				balance = '0';
			}

			$("#accountBalance").text(balance);
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
