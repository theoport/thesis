import {default as Web3} from 'web3'
import tokenManagerObject from '../../truffle/build/contracts/TokenManager.json';
import {default as SHA256} from 'crypto-js/sha256';
import {default as configDB} from '../../config/database.js';

let userMap = new Map();
let TokenManager;
let tmInstance, tmAddress; 
let account;


window.App = {
	start: function() {
		self = this;

		self.checkData();

		TokenManager = web3.eth.contract(tokenManagerObject.abi);
		tmAddress=token.managerAddress;
		tmInstance = TokenManager.at(tmAddress);

		self.setAccountInfo();
		self.fillMaps();
		self.fillComments();
	},

	checkData: function() {
		var _date = new Date(token.creationDate);
		if (SHA256((_date.getTime() / 1000) + token.address + token.managerAddress) != token.id) {
			alert("DANGER, DATA HAS BEEN ALTERED");
		}
	},

	setAccountInfo: function(){
		web3.eth.getAccounts((err,accs) => {
			let response;
			if (err != null) {
				response = "Your account cannot be detected.<br>Please make sure you are using MetaMask or Mist.";
			}
			else if (accs.length == 0) {
				response = "You don't seem to have an account set up <br>for MetaMask or Mist, please do so.";
			}
			else {
				account = accs[0];
				response = ("Account:<br>" + accs[0]);
			}	
			$("#accountInfo").html(response);
		});
	},

	fillMaps: function() {
		console.log("fillingmaps1");

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
	},

	fillComments: function() {	
	
		comments.sort(function(a, b) {
			return a.creationDate - b.creationDate;
		});
		$("#topicHeader").append($("<div></div>")
								.attr('class', 'media')
								.html("<div class=\"media-body\">" +
								"<h4 class=\"media-heading\">" +
								userMap.get(topic.userId).username +
								"<small>" + topic.creationDate +
								"</small></h4>" +
								"<h5>" + topic.title +
								"<span class=\"badge\" id=\"upvoteCount\">" + 
								"</span></h5>" +
								"<p>" + topic.description+ "</p></div><hr>"));
												
		$.ajax({
			type: 'GET',
			url: '/api/upvoteCount/' + topic._id,
			datatype: 'json',
			success: function (responseData, textStatus, jqXHR) {
				$("#upvoteCount").html(responseData);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
			}
		});
					
		for (var i = 0; i < comments.length; i++) {
							
			$("#comments").append($("<div></div>")
									.attr('class', 'media')
									.html("<div class=\"media-body\">" +
										"<h5 class=\"media-heading\">" +
										userMap.get(comments[i].userId).username +
										"<small><i> posted at </i>" +
										comments[i].creationDate +
										"</small></h5>" +
										"<p>" +
										comments[i].content +
										"</p></div><hr>"));
		}
	},
	
	makeComment: function() {
		
			var $commentContent = $("#commentContent").val();
			console.log("making comment");

			$.ajax({
				type: 'POST',
				url: '/api/comments',
				datatype: 'json',
				data: {
					userId: user._id,
					topicId: topic._id,
					creationDate: Date.now(),
					content: $commentContent	
				},
				success: function(responseData, textStatus, jqXHR) {
					console.log("success make comment");
					$("#comments").append($("<div></div>")
									.attr('class', 'media')
									.html("<div class=\"media-body\">" +
									"<h5 class=\"media-heading\">" +
									userMap.get(responseData.userId).username +
									"<small><i> posted at </i>" +
									responseData.creationDate +
									"</small></h5>" +
									"<p>" +
									responseData.content +
									"</p></div><hr>"));
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(textStatus);
				}
			});
	},

	upvote: function() {
		
		$.ajax({
			type: 'POST',
			url: '/api/upvotes',
			data: {
				userId: user._id,
				topicId: topic._id
			},
			success: function (responseData, textStatus, jqXHR) {
				var temp = parseInt($("#upvoteCount").html());
				$("#upvoteCount").html(temp + 1);
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(errorThrown);
			}
		});
	},

	startBounty: function() {

		tmInstance.startBounty(topic._id, SHA256(topic), {from: account, gas: 4000000}, (err,res) => {
			if (err) {
				console.log(err);  
				alert("Error starting bounty");
			} else {
				alert(result);
			}
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
