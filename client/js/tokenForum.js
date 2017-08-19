import {default as Web3} from 'web3'
import tokenManagerObject from '../../build/contracts/TokenManager.json';

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
		tmInstance = TokenManager.at(ctAddress);
		self.fillMaps();			
		self.fillUpdateTopics();
		self.fillIssueTopics();
		self.fillGeneralTopics();
		self.fillComments();
	},
		

	fillMaps: function() {
		
		for (let i = 0; i < users.length ; i++) {
			userMap.set(users[i].id, users[i]); 
		}

		for (let i = 0; i < issues.length ; i++) {
			issueMap.set(users[i].id, users[i]); 
		}

		for (let i = 0; i < updates.length ; i++) {
			updateMap.set(users[i].id, users[i]); 
		}

		for (let i = 0; i < generals.length ; i++) {
			generalMap.set(users[i].id, users[i]); 
		}

		for (let i = 0; i < comments.length ; i++) {
			commentMap.set(users[i].id, users[i]); 
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
					updateStatus= Array.from(updateStatusMap());
					updateStatus.sort(function(a,b) {
						return (updateMap.get(b[0])).creationDate 
											- (updateMap.get(a[0])).creationDate;
					});
					for (let i = 0; i < updateStatus.length ; i++) {
						
						// If update is still active
						if (updateStatus[i][1][0] == true) {
			
							// If update has started
							if (updateStatus[i][1][1] == true) {

							$("#active").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-color:yellow;\" class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].username +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap[updateStatus[i][0]].title +
														"</h5></div></div>"));
									
							} 

							// If update hasn't started 
							else if (updateStatus[i][1][1] == false){

							$("#active").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'id': updateStatus[i][0]})
													.html("<div class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].username +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap[updateStatus[i][0]].title +
														"</h5></div></div>"));
				
							}
						}
						// If update is finished 
						else if (updateStatus[i][1][0] == false){

							// If update was successful
							if (updateStatus[i][1][1] == true) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-volor:green;\"class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].username +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap[updateStatus[i][0]].title +
														"</h5></div></div>"));
				
							} 
		
							// If update wasn't successful	
							else if (updateStatus[i][1][1] == false) {

							$("#archived").append($("<a></a>")
													.attr({'class': 'topic topic-update',
													'id': updateStatus[i][0]})
													.html("<div style=\"background-volor:red;\"class=\"media\">" +
														"<div class=\"media-body\">" +	
														"<h4 class=\"media-heading\">" +
														userMap[updateMap[updateStatus[i][0]].userId].username +
														"<small>" +
														updateMap[updateStatus[i][0]].creationDate +
														"</small></h4>" +
														"<h5>" +
														updateMap[updateStatus[i][0]].title +
														"</h5></div></div>"));
				
			
							}
						}
					}
				}
			});
		});
	},

	fillIssueTopics: function() {

		var issueArray= Array.from(issueMap.keys());
		issueArray.sort(function(a,b) {
			return (issueMap.get(b[0])).creationDate 
								- (issueMap.get(a[0])).creationDate;
		});
		
		for (let i = 0; i < issueArray.length; i++) {

			$("#issues").append($("<a></a>")
									.attr({'class': 'topic topic-issue',
									'id': issueArray[i]})
									.html("<div class=\"media\">" +
										"<div class=\"media-body\">" +	
										"<h4 class=\"media-heading\">" +
										userMap[issueMap[issueArray[i]].userId] +
										"<small>" +
										issueMap[issueArray[i]].creationDate +
										"</small></h4>" +
										"<h5>" +
										issueMap[issueArray[i]].title +
										"</h5></div></div>"));
						
		}
	},

	fillGeneralTopics: function() {

			$("#general").append($("<a></a>")
									.attr({'class': 'topic topic-general',
									'id': issueArray[i]})
									.html("<div class=\"media\">" +
										"<div class=\"media-body\">" +	
										"<h4 class=\"media-heading\">" +
										userMap[issueMap[issueArray[i]].userId] +
										"<small>" +
										issueMap[issueArray[i]].creationDate +
										"</small></h4>" +
										"<h5>" +
										issueMap[issueArray[i]].title +
										"</h5></div></div>"));

	},

	fillComments: function() {
		
		$(".topic").on("click", function () {
			var $id = $(this).id();	
			
			$.ajax({
				type: 'GET',
				url: '/api/topic/' + $id + '/comments',
				datatype: 'json',
				async: 'false',
				success: function (responseData, textStatus, jqXHR) {


					responseData.sort(function(a, b) {
						return a.creationDate - b.creationDate;
					});
					let _userId, _date, _title, _content;
					if ($(this).hasClass('topic-update')) {
						_userId = updateMap[$id].userId;
						_date = updateMap[$id].creationDate;
						_title = updateMap[$id].title;
						_content = updateMap[$id].content;
					}
					else if ($(this).hasClass('topic-issue')) {
						_userId = issueMap[$id].userId;
						_date = issueMap[$id].creationDate;
						_title = issueMap[$id].title;
						_content = issueMap[$id].content;
					}
					else if ($(this).hasClass('topic-general')) {
						_userId = generalMap[$id].userId;
						_date = generalMap[$id].creationDate;
						_title = generalMap[$id].title;
						_content = generalMap[$id].content;
					} 
				
					$("#mainSection").html($("<div></div>")
														.attr({'id': $id,
																	'class': 'topicHeader'}));
					$("#mainSection").append($("<div></div>")
														.attr('class', 'comments'));
					$(".topicHeader").append($("<div></div>")
											.attr('class', 'media')
											.html("<div class=\"media-body\">" +
											"<h4 class=\"media-heading\">" +
											userMap[_userId].username +
											"<small>" + _date +
											"</small></h4>" +
											"<h5>" + _title +"</h5>" +
											"<p>" + _content + "</p></div>"));
											 
												
					
					for (var i = 0; i < reponseData.lentgh ; i++) {
							
						$(".comments").append($("<div></div>")
									.attr('class', 'media')
									.html("<div class=\"media-body\">" +
										"<h5 class=\"media-heading\">" +
										userMap[responseData[i].userId].username +
										"<small><i> posted at </i>" +
										responseData[i].creationDate +
										"</small></h5>" +
										"<p>" +
										responseData[i].content +
										"</p></div>"));
					}

					$("#mainSection").append($("<div></div>")
													.attr('class', 'form-inline')
													.html("<div class=\"form-group\">" +
													"<input class=\"form-control\"" +
													"type=\"text\" id=\"commentContent\"" +
													"placeholder=\"Make Comment\"></input></div>" +
													"<div class=\"form-group\"" +
													"<button class=\"btn btn-default\" id=\"makeComment\">" + 
													"Add</button></div>"));
													
											
				},
				error: 	function(jqXHR, textStatus, errorThrown) {
					console.log(textStatus);
				} 
			});
		});
	},
	
	makeComment: function() {
		
		$("#makeComment").on("click", function () {
			
			var $topicId = $(".topicHeader").id();
			var $commentContent = $("#commentContent");

			$.ajax({
				type: 'POST',
				url: '/api/comments',
				datatype: 'json',
				data: {
					userId: user.id,
					topicId: $topicId,
					creationDate: Date.now(),
					content: $commentContent	
				},
				success: function(responseData, textStatus, jqXHR) {
					$(".comments").append($("<div></div>")
									.attr('class', 'media')
									.html("<div class=\"media-body\">" +
									"<h5 class=\"media-heading\">" +
									userMap[responseData.userId].username +
									"<small><i> posted at </i>" +
									responseData.creationDate +
									"</small></h5>" +
									"<p>" +
									responseData.content +
									"</p></div>"));
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(textStatus);
				}
			});
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
		

