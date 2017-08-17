import {default as configDB} from '../../config/database.js';
import tokenManagerObject from '../../build/contract/TokenManager.json';

let TokenManager;
let tmAddress, tmInstance, netId;
var userMap = new Map();
var updateMap = new Map();
var issueMap = new Map();
var generalMap = new Map();
var commentMap = new Map();
var updateStatus = [];

window.App = {
	start: function() {
		
		self = this;
	
		TokenManager = web3.eth.contract(tokenManagerObject.abi);
		tmAddress = token.managerAddress;	
		tmInstance = TokenManager.at(ctAddress);
		self.fillMaps();			
		self.fillUpdateTopics();
		self.fillIssueTopics();
		self.fillGeneralTopics();

	fillMaps(): function() {
		
		for (let i = 0; i < users.length ; i++) {
			userMap.set(users[i]._id, users[i]); 
		}

		for (let i = 0; i < issues.length ; i++) {
			issueMap.set(users[i]._id, users[i]); 
		}

		for (let i = 0; i < updates.length ; i++) {
			updateMap.set(users[i]._id, users[i]); 
		}

		for (let i = 0; i < generals.length ; i++) {
			generalMap.set(users[i]._id, users[i]); 
		}

		for (let i = 0; i < comments.length ; i++) {
			commentMap.set(users[i]._id, users[i]); 
		}
		
		for (var key of updateMap.keys()) {
			updateStatus.push([key,[true,false]]); 
		}
	},
	
	fillUpdateTopics: function() {

		var updateStatusMap = new Map(updateStatus);	

		var updateStart = TokenManager.UpdateStarted();
		updateStart.get(function (err, logs) {
			if (err) {
				console.log(err);
				return;
			} else {
				for (let i = 0; i < logs.length ; i++) { 
					updateStatusMap.set(logs[i].args.id, [true, true]);	
				}
			}
			var updateFinish = TokenManager.UpdateOutcome();
			updateFinish.get(function (err, logs) {
				if (err) {
					console.log(err);	
					return;
				} else {
					for (let i = 0; i < logs.length ; i++) {
						if (logs.args.success == true) {
							updateStatusMap.set(logs[i].args.id, [false, true]);
						} else { 
							updateStatusMap.set(logs[i].args.id, [false, false]);
						}
					}
					updateStatus= Array.from(updateStatusMap);
					updateStatus.sort(function(a,b) {
						return (updateMap.get(b[0])).creationDate 
											- (updateMap.get(a[0])).creationDate;
					});
					for (let i = 0; i < updateStatus.length ; i++) {
						
						// If update is still active
						if (updateStatus[i][1][0] == true) {
			
/*
							$("#active").append($("<a></a>")
													.attr('class', 'topic')
													.attr('id', updateStatus[i][0])
													.html("<div class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].name +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<p>" +
														updateMap[updateStatus[i][0]].title +
														"</p></div></div>"));
															
													*/	
									
							// If update has started
							if (updateStatus[i][1][1] == true) {

							$("#active").append($("<a></a>")
													.attr({'class': 'topic',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-color:yellow;\" class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].name +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<p>" +
														updateMap[updateStatus[i][0]].title +
														"</p></div></div>"));
									
							} 

							// If update hasn't started 
							else if (updateStatus[i][1][1] == false){

							$("#active").append($("<a></a>")
													.attr({'class': 'topic',
													'id': updateStatus[i][0]})
													.html("<div class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].name +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<p>" +
														updateMap[updateStatus[i][0]].title +
														"</p></div></div>"));
				
							}
						}
						// If update is finished 
						else if (updateStatus[i][1][0] == false){

							// If update was successful
							if (updateStatus[i][1][1] == true) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-volor:green;\"class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].name +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<p>" +
														updateMap[updateStatus[i][0]].title +
														"</p></div></div>"));
				
							} 
		
							// If update wasn't successful	
							else if (updateStatus[i][1][1] == false) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-volor:red;\"class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].name +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<p>" +
														updateMap[updateStatus[i][0]].title +
														"</p></div></div>"));
				
			
							}
						}
					}
				}
			});
		});
	},
							
					
				





	
	startWatch: function() {
		
		

			
				
		
 
