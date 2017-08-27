import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';

let Token;
let account;
let publicFunctions = []; 

window.App = {
	
	start: function() {

		self = this;

		self.checkData();	
		
		Token = web3.eth.contract(token.abi);

		self.fillFunctionArray();
		self.fillMethods();
	},

	fillFunctionArray: function() {
		
		for (var i = 0; i < token.abi.length ; i++) {
			if (token.abi[i].type == 'function' && self.isPublic(token.abi[i])) {
				publicFunctions.push([token.abi[i].name, token.abi[i].inputs, token.abi[i].payable]);	
			}
		}
	},

	isPublic: function(functionObject) {
	
		self = this;

		var position = token.sourceCode.indexOf("function " + functionObject.name);
		var parameterStart = token.sourceCode.indexOf("(", position);
		var parameterEnd = token.sourceCode.indexOf(")", parameterStart + 1);
		var declarationStart = token.sourceCode.indexOf("{", parameterEnd);
		var parameterString, parameters, identifiers;
		while(position >=0 ) {
			parameterString = token.sourceCode.substring(parameterStart, parameterEnd);
			identifiers = token.sourceCode.substring(parameterEnd + 1, declarationStart);
			parameters = parameterString.split(",");
	
			console.log(parameters);
		
			if (self.parametersMatch(parameters, functionObject)) {
				if (indentifiers.includes("private") || identifiers.includes("internal")) {
					return false;
				} else { 
					return true;
				}
			}

			position = token.sourceCode.indexOf("function " + functionObject.name);
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
			var res=parameters[i].split(" ");
			if (res[0] != functionObject.inputs[i].type) {
				return false;
			}
		}
		return true;
	},

	fillMethods: function() {

		var html;
		
		for (var i = 0; i < publicFunctions.length ; i++) {

			$("#methods").append('<br>');
			html = "";
			html += "<div class=\"form-group\" id=\"" + methodId + "\">";
			html += "<label>" + publicFunction[i][0] + "</label>";
			if (publicFunctions[i][2]) {
				html += "<div class=\"form-control\">Is payable: ";
				html += "<input placeholder=\"Amount in gwei\" class=\"value\">";
				html += "</div>";
			}	

			var functionString = '' + publicFunctions[i][0] + '(';
			for (var j = 0; j < publicfunctions[i][1].length ; j++) {
				functionString += publicFunctions[i][1][j].type + ',';
			}
			functionString += ')';
			var methodId = web3.eth.abi.encodeFunctionSignature(functionString);
			html += "<div class=\"form-inline\">";
			for (var j = 0; j < publicfunctions[i][1].length ; j++) {
				html += "<div class=\"form-group\"><label>";
				html += publicFunctions[i][1][j].name;
				html += "</label>";
				html += "<input type=\"text\" class=\"form-control\""; 
				html += " class=\"" + publicFunctions[i][1][j].type + "\" ";
				html += " placeholder=\"" + publicFunctions[i][1][j].type + "\"></div>";
			}

			html += "<button class=\"btn btn-default blockchain\" onclick=\"App.sendTransaction(" + methodId + ")\">Send Method</button>";
			html += "</div></div>";
			$("#methods").append(html);
		}
	},

	sendTransaction: function(methodId) {
		
		$inputs = $("#" + methodId + " :input");
		var _value;	
		var _data = '' + methoId;
		$.each($inputs, (index, value) => {
			console.log($(this).val());
			var _type = $(this).attr('class'); 
			var _val = $(this).val();
			if (_type == 'value'){
				_value = _val;
			} else {
				_data += web3.eth.abi.encodeParameter( ''+_type, ''+_val);
			}
		});
		
		if (typeof(value) == 'undefined') {
			
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
			 
		
		
	
