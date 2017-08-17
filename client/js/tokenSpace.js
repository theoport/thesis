import {default as Web3} from 'web3';
import {default as SHA256} from 'crypto-js/sha256';

import createTokenObject from '../../build/contracts/TokenCreator.json';

let CreateToken;
let ctAddress, ctInstance, netId;
let tokens = [];

window.App = {
	start: function() {
	
		self=this;	
		CreateToken = web3.eth.contract(createTokenObject.abi);

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
			var anEvent = ctInstance.TokenManagerCreated({},{fromBlock: 0, toBlock: 'latest'});
			anEvent.get(function(err,logs) {
				if (err) {
					console.log(err);	
				} else {
					console.log(logs);

					for (var i = 0; i < logs.length ; i++) {
						console.log(logs[i].args.creationTime.toNumber());
						var id = SHA256((logs[i].args.creationTime).toNumber() + logs[i].args.tokenAddress);
						console.log(id.toString());
						tokens.push(id.toString()); 
					}

					self.makeList();
				}
			});
		});
	},
	
	makeList: function() {
		$.ajax({
			type: 'GET',
			url: '/api/tokens',
			datatype: 'json',
			success: function(responseData, textStatus, jqXHR) {

				var tempId;
				var tempAddr;
				var tempName;
				var tempDesc;

				for (var i = 0; i < responseData.length; i++) {
					tempId = '' + responseData[i].id;	
					tempAddr = '' + responseData[i].address;
					tempName = '' + responseData[i].name;
					tempDesc = '' + responseData[i].description;
					if (($.inArray(tempId,tokens)) >= 0) {
						$("#tokenList").append($("<option></option>")
															.attr('value', tempId)
															.text(tempName + ", " + tempAddr)); 
						$("#descriptionList").append($("<tr></tr>")
															.html("<td>" + tempName + "</td><td>" + tempDesc + "</td>")); 
					}
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log(textStatus);			
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
});




