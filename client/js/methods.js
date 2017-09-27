import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as Web3EthABI} from 'web3-eth-abi';

let Token;
let account;
let publicFunctions = []; 

window.App = {
	
	start: function() {

		self = this;

		self.checkData();	
		
		Token = web3.eth.contract(token.abi);

		web3.eth.getAccounts((err,accs) => {
			if (err != null) {
				alert(err);
			} else if (accs.length == 0) {
				alert("No accounts detected");
			} else {
				account = accs[0];
			}
		});
		self.fillFunctionArray();
		self.fillMethods();
	},

	fillFunctionArray: function() {
		console.log("abi: " + token.abi);	
		console.log("abi length: " + token.abi.length);	
		for (var i = 0; i < token.abi.length ; i++) {
			console.log(token.abi[i].constant);
			if (token.abi[i].type == 'function' && !(token.abi[i].constant)) {
				var publicAndCreator = self.isPublicAndCreator(token.abi[i]);
				if (publicAndCreator[0]){
					publicFunctions.push([token.abi[i].name, token.abi[i].inputs, token.abi[i].payable, publicAndCreator[1]]);	
				}
			}
		}
	},

	isPublicAndCreator: function(functionObject) {
	
		self = this;
		console.log("function " + functionObject.name);
		var position = token.sourceCode.indexOf("function " + functionObject.name);
		console.log(position);
		var parameterStart = token.sourceCode.indexOf("(", position);
		var parameterEnd = token.sourceCode.indexOf(")", parameterStart + 1);
		var declarationStart = token.sourceCode.indexOf("{", parameterEnd);
		var parameterString, parameters, identifiers;
		while(position >= 0 ) {
			parameterString = token.sourceCode.substring(parameterStart + 1, parameterEnd);
			identifiers = token.sourceCode.substring(parameterEnd + 1, declarationStart);
			parameters = parameterString.split(",");
			console.log(parameters);
			if (parameters[0] == "") {
				parameters = [];
			}	
			if (self.parametersMatch(parameters, functionObject)) {
				if (identifiers.includes("byManager") || identifiers.includes("private") || identifiers.includes("internal")) {
					return [false, false];
				} else { 
					if (identifiers.includes("byCreator")){
						return [true,true];
					} else {
						return [true,false];
					}
				}
			}

			position = token.sourceCode.indexOf("function " + functionObject.name, position + 1);
			parameterStart = token.sourceCode.indexOf("(", position);
			parameterEnd = token.sourceCode.indexOf(")", parameterStart + 1);
			declarationStart = token.sourceCode.indexOf("{", parameterEnd);
		}
		alert("double check token abi with mods please");
		return false	
	},

	parametersMatch: function(parameters, functionObject) {
	
		if (parameters.length != functionObject.inputs.length){
			return false;
		}

		for (var i = 0; i < parameters.length; i++) {
			var res;
			if (parameters[i][0] == ' ') {
				res = (parameters[i].substring(1)).split(" ");
			} else {
				res=parameters[i].split(" ");
			}
			console.log(res);
			functionObject.inputs[i].type;
			if (res[0] != functionObject.inputs[i].type) {
				return false;
			}
		}
		return true;
	},

	fillMethods: function() {

		var html;
		
		for (var i = 0; i < publicFunctions.length ; i++) {

			var functionString = '' + publicFunctions[i][0] + '(';
			for (var j = 0; j < publicFunctions[i][1].length - 1 ; j++) {
				functionString += publicFunctions[i][1][j].type + ',';
			}
			functionString += publicFunctions[i][1][publicFunctions[i][1].length - 1].type + ')';
			var methodId = Web3EthABI.encodeFunctionSignature(functionString);

			$("#methods").append('<br>');
			html = "";
			html += "<div class=\"form-group\" id=\"" + methodId + "\">";
			html += "<label>" + publicFunctions[i][0]; 
			if (publicFunctions[i][3]){
				html += "<small> <i>by creator only</i></small>";
			}
			html += "</label>";
			if (publicFunctions[i][2] == 'true') {
				html += "<div class=\"form-control\">Is payable: ";
				html += "<input placeholder=\"Amount in gwei\" class=\"value\">";
				html += "</div>";
			}	

			html += "<div class=\"form-inline\">";
			for (var j = 0; j < publicFunctions[i][1].length ; j++) {
				html += "<div class=\"form-group\"><label>";
				html += publicFunctions[i][1][j].name;
				html += "</label>";
				html += "<input type=\"text\" class=\"form-control\""; 
				html += " placeholder=\"" + publicFunctions[i][1][j].type + "\" /></div>";
			}

			html += "</div></div>";
			html += "<button class=\"btn btn-default blockchain\" onclick=\"App.sendTransaction(" + methodId + ")\">Send Method</button>";
			html += "<br><hr>";
			$("#methods").append(html);
			console.log(html);
		}
	},

	sendTransaction: function(_methodId) {
		var methodId = '0x' + _methodId.toString(16);
		let $inputs = $("#" + methodId);
		//.find(":input");
		console.log($inputs);	
		var _value;	
		var _data = '' + methodId;
		console.log(_data);	
		$.each($("#" + methodId + " :input"), (index,value) => {
			var _type = $(value).attr('placeholder'); 
			console.log(_type);
			var _val = $(value).val();
			console.log(_val);
			if (_type == 'value'){
				console.log("it is a value");
				_value = _val;
			} else {
				console.log("it is not a value");
				_data += (Web3EthABI.encodeParameter( ''+_type, ''+_val)).substring(2);
				console.log(_data);
			}
		});
		console.log("each finished");
		console.log(_data);
		
		if (typeof(_value) == 'undefined') {
			console.log(_data);
			web3.eth.sendTransaction({from: account, to: token.address, gas: '400000', data: _data}, (err, result) => {
				if (err) {
					alert(err);
				} else {
					alert(result);
				}
			});
		} else {
			web3.eth.sendTransaction({from: account, to: token.address, gas: '400000',value: _value, data: _data}, (err, result) => {
				if (err) {
					alert(err);
				} else {
					alert(result);
				}
			});
		}
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
			 
		
		
	
