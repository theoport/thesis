import {default as Web3} from 'web3'
import tokenManagerObject from '../../build/contracts/TokenManager.json';
import {default as configDB} from '../../config/database.js';

let TokenManager;
let tmAddress, tmInstance;
var userMap = new Map();
var updateMap = new Map();
var issueMap = new Map();
var generalMap = new Map();
var updateStatus = [];

window.App = {
	start: function() {
		
		self = this;
	
		TokenManager = web3.eth.contract(tokenManagerObject.abi);
		tmAddress = token.managerAddress;	
		tmInstance = TokenManager.at(tmAddress);
		self.fillMaps();			
		self.fillUpdateTopics();
		self.fillIssueTopics();
		self.fillGeneralTopics();
	},
		

	fillMaps: function() {

		var $id = token.id;
		
		$.ajax({
			type: 'GET',
			url: '/api/users',
			datatype: 'json',
			async: false,
			success: function(responseData, textStatus, jqXHR) {
			
				for (let i = 0; i < responseData.length ; i++) {
					userMap.set(responseData[i]._id, responseData[i]); 
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			}
		});

		$.ajax({
			type: 'GET',
			url: '/api/topics/' + $id,
			datatype: 'json',
			async: false,
			success: function(responseData, textStatus, jqXHR) {
			
				for (let i = 0; i < responseData.length ; i++) {
					switch (responseData[i].categoryId) {
					
						case configDB.updateId:
							updateMap.set(responseData[i]._id, responseData[i]); 
							break;
						case configDB.issueId:	
							issueMap.set(responseData[i]._id, responseData[i]); 
							break;	
						case configDB.generalId:	
							generalMap.set(responseData[i]._id, responseData[i]); 
							break;
					}
				}
				console.log(updateMap);
				for (var key of updateMap.keys()) {
					updateStatus.push([key,[true,false]]); 
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			}
		});
	},
	
	fillUpdateTopics: function() {

		var updateStatusMap = new Map(updateStatus);	
		var updateStart = tmInstance.UpdateStarted({}, {fromBlock: 0, toBlock: 'latest'});
		updateStart.get(function (err, logs) {
			if (err) {
				console.log(err);
				return;
			} else {
				console.log("update starts logs are" + logs);
				for (let i = 0; i < logs.length ; i++) { 

					updateStatusMap.set(logs[i].args.updateId.toString(16), [true, true]);	
				}
			}
			var updateFinish = tmInstance.UpdateOutcome({}, {fromBlock: 0, toBlock: 'latest'});
			updateFinish.get(function (err, logs) {
				if (err) {
					console.log(err);	
					return;
				} else {
					console.log("update finish logs are: " + logs);
					for (let i = 0; i < logs.length ; i++) {
						if (logs[i].args.success == true) {
							updateStatusMap.set(logs[i].args.updateId.toString(16), [false, true]);
						} else { 
							updateStatusMap.set(logs[i].args.updateId.toString(16), [false, false]);
						}
					}
					updateStatus= Array.from(updateStatusMap);
					console.log(updateStatus);
					if (updateStatus.length > 1) {
						updateStatus.sort(function(a,b) {
							return (updateMap.get(b[0])).creationDate 
												- (updateMap.get(a[0])).creationDate;
						});
					}
					for (let i = 0; i < updateStatus.length ; i++) {
						
						// If update is still active
						if (updateStatus[i][1][0] == true) {
			
							// If update has started
							if (updateStatus[i][1][1] == true) {

							$("#active").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'href': './forum/' + updateStatus[i][0]})
													.html("<div style=\"background-color:yellow;\" class=\" form-inline media\">" +
														"<div class=\"form-group\"><div class=\"media-body\">" +	
														"<h4 class=\"media-heading form-control\">" +
														userMap.get(updateMap.get(updateStatus[i][0]).userId).username +
														"<small>" +
														updateMap.get(updateStatus[i][0]).creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap.get(updateStatus[i][0]).title +
														"</h5></div></div>" +
														"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
														updateStatus[i][0] + "\"></span></div></div>"));
									
							} 

							// If update hasn't started 
							else if (updateStatus[i][1][1] == false){

							$("#active").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'href': './forum/' + updateStatus[i][0]})
													.html("<div class=\"form-inline media\">" +
														"<div class=\"form-group\"><div class=\"media-body\">" +	
														userMap.get(updateMap.get(updateStatus[i][0]).userId).username +
														"<small>" +
														updateMap.get(updateStatus[i][0]).creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap.get(updateStatus[i][0]).title +
														"</h5></div></div>" +
														"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
														updateStatus[i][0] + "\"></span></div></div>"));
				
							}
						}
						// If update is finished 
						else if (updateStatus[i][1][0] == false){

							// If update was successful
							if (updateStatus[i][1][1] == true) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'href': './forum/' + updateStatus[i][0]})
													.html("<div style=\"background-color:green;\"class=\" form-inline media\">" +
														"<div class=\"form-group\"><div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap.get(updateMap.get(updateStatus[i][0]).userId).username +
														"<small>" +
														updateMap.get(updateStatus[i][0]).creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap.get(updateStatus[i][0]).title +
														"</h5></div></div>" +
														"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
														updateStatus[i][0] + "\"></span></div></div>"));
				
							} 
		
							// If update wasn't successful	
							else if (updateStatus[i][1][1] == false) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'href': './forum/' + updateStatus[i][0]})
													.html("<div style=\"background-color:red;\"class=\"form-inline media\">" +
														"<div class=\"form-group\"><div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap.get(updateMap.get(updateStatus[i][0]).userId).username +
														"<small>" +
														updateMap.get(updateStatus[i][0]).creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap.get(updateStatus[i][0]).title +
														"</h5></div></div>" +
														"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
														updateStatus[i][0] + "\"></span></div></div>"));
				
			
							}
						}
						$.ajax({
							type: 'GET',
							url: '/api/upvoteCount/' + updateStatus[i][0],
							datatype: 'json',
							success: function (responseData, textStatus, jqXHR) {
								$("#upvoteCount" + updateStatus[i][0]).html(responseData);
							},
							error: function (jqXHR, textStatus, errorThrown) {
							}
						});
					}
				}
			});
		});
	},

	fillIssueTopics: function() {

		var issueArray= Array.from(issueMap.keys());
		if (issueArray.length > 1) {
			issueArray.sort(function(a,b) {
				return (issueMap.get(b)).creationDate 
									- (issueMap.get(a)).creationDate;
			});
		}
		
		for (let i = 0; i < issueArray.length; i++) {

			$("#issues").append($("<a></a>")
									.attr({'class': 'topic topic-issue',
									'href': './forum/' + issueArray[i]})
									.html("<div class=\"media form-inline\">" +
										"<div class=\"form-group\"><div class=\"media-body\">" +	
										"<h4 class=\"media-heading\">" +
										userMap.get(issueMap.get(issueArray[i]).userId).username +
										"<small>" +
										issueMap.get(issueArray[i]).creationDate +
										"</small></h4>" +
										"<h5>" +
										issueMap.get(issueArray[i]).title +
										"</h5></div></div>" +
										"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
										issueArray[i] + "\"></span></div></div>"));
						
			$.ajax({
				type: 'GET',
				url: '/api/upvoteCount/' + issueArray[i],
				datatype: 'json',
				success: function (responseData, textStatus, jqXHR) {
					$("#upvoteCount" + issueArray[i]).html(responseData);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				}
			});
				
		}
	},

	fillGeneralTopics: function() {

		var generalArray= Array.from(generalMap.keys());
		if (generalArray.length > 1) {
			generalArray.sort(function(a,b) {
				return (generalMap.get(b)).creationDate 
									- (generalMap.get(a)).creationDate;
			});
		}
		
		for (let i = 0; i < generalArray.length; i++) {

			$("#general").append($("<a></a>")
									.attr({'class': 'topic topic-general',
									'href': './forum/' + generalArray[i]})
									.html("<div class=\"media form-inline\">" +
										"<div class\"form-group\"><div class=\"media-body\">" +	
										"<h4 class=\"media-heading\">" +
										userMap.get(generalMap.get(generalArray[i]).userId).username +
										"<small>" +
										generalMap.get(generalArray[i]).creationDate +
										"</small></h4>" +
										"<h5>" +
										generalMap.get(generalArray[i]).title +
										"</h5></div></div>" +
										"<div class=\"form-group\"><span class=\"badge\" id=\"upvoteCount" +
										generalArray[i] + "\"></span></div></div>"));

			$.ajax({
				type: 'GET',
				url: '/api/upvoteCount/' + generalArray[i],
				datatype: 'json',
				success: function (responseData, textStatus, jqXHR) {
					$("#upvoteCount" + generalArray[i]).html(responseData);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				}
			});
		}
	},
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
		

