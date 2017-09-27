import {default as Web3} from 'web3';
import {default as SHA256} from 'crypto-js/sha256';

import createTokenObject from '../../truffle/build/contracts/TokenCreator.json';
import tokenManagerObject from '../../truffle/build/contracts/TokenManager.json';

let CreateToken, TokenManager;
let ctAddress, ctInstance, netId;
let tmAddress, tmInstance;
let tokens = [];
let creationTimes = [];

window.App = {
	start: function() {
	
		self=this;	
		CreateToken = web3.eth.contract(createTokenObject.abi);
		TokenManager = web3.eth.contract(tokenManagerObject.abi);

		web3.version.getNetwork((err,result) => {
		
			netId = result;
			let temp = "createTokenObject.networks.netId.address"; 
			let t = temp.split(".");
			let obj = createTokenObject;
			let network;
			for (var i = 0; i < (t.length - 1); i++) {
	
				if (t[i] == "networks") {
					obj = obj[netId];
				} else {
					obj = obj[t[i+1]];	
				}
			}
			
			ctAddress = obj;
			ctInstance = CreateToken.at(ctAddress);
			let anEvent = ctInstance.TokenManagerCreated({}, {fromBlock: 0, toBlock: 'latest'});
			anEvent.get(function(err,logs) {
				if (err) {
					console.log(err);	
				} else {

					for (let i = 0; i < logs.length ; i++) {
						if (i == logs.length -1)
							self.getCreationTimes(logs[i].args.tokenManagerAddress, true);
						else 
							self.getCreationTimes(logs[i].args.tokenManagerAddress, false);
					}
				}
			});
		});
	},

	getCreationTimes: function(_tmAddress, finished) {
	
		self = this;
	
		tmInstance = TokenManager.at(_tmAddress);
		tmInstance.getTokenCreationTime((err,result) => {
			creationTimes.push([_tmAddress, result.toNumber()]);
			if (finished){
				for (let i = 0; i < creationTimes.length ; i++) {
					self.pushToken(creationTimes[i][0], creationTimes[i][1]);
				}
			}	
		});
	},

	pushToken: function(_tmAddress, _time) {
		tmInstance = TokenManager.at(_tmAddress);

		tmInstance.getTokenAddress((err, result) => {
			let tokenAddress = result;
			if (err) {
				console.log(err);
			} else {	
				console.log("In order");
				console.log(_time);
				console.log(tokenAddress);
				console.log(_tmAddress);
				let id = SHA256(_time + tokenAddress + _tmAddress).toString();
				console.log(id);

				$.ajax({
					type: 'GET',
					url: '/api/tokens/' + id,
					datatype: 'json',
					success: function(responseData, textStatus, jqXHR) {

						let tempId;
						let tempAddr;
						let tempName;
						let tempDesc;

						tempId = '' + responseData.id;	
						tempAddr = '' + responseData.address;
						tempName = '' + responseData.name;
						tempDesc = '' + responseData.description;
						$("#tokenList").append($("<option></option>")
															.attr('value', tempId)
															.text(tempName + ", " + tempAddr)); 
						$("#descriptionList").append($("<tr></tr>")
															.html("<td>" + tempName + "</td><td><h6>" + tempDesc + "</h6></td>")); 
					},
					error: function(jqXHR, textStatus, errorThrown) {
						console.log(textStatus);			
					}
				});
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

$(document).ready(function(){
	$("#hideShow").click(function() {
		$("#descriptionList").toggle();
	});
	$("#enterToken").click(function() {
		window.location.href='/tokenHome/' + $("#tokenList").val();
	});
});




