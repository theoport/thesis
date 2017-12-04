import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';

import NewTokentxt from '../../public/txt/NewToken.txt';
import BaseTokentxt from '../../public/txt/BaseToken.txt';
import ERC20Standardtxt from '../../public/txt/ERC20Standard.txt';

import createTokenObject from '../../truffle/build/contracts/TokenCreator.json';
import tokenObject from '../../truffle/build/contracts/NewToken.json';

let ropstenStartBlock = 1590000;

let CreateToken; 
let ctAddress;
let ctInstance;
let account;
let netId;
let loadBlock;

window.App = {
  start: function() {

    let self=this;
    
    CreateToken = web3.eth.contract(createTokenObject.abi);
    
    self.setDefault();
    self.setAccountInfo();
    self.setNetworkInfo();

  },  

  setStatus: function(msg){
    var status = document.getElementById("status");
    status.innerHTML = msg;
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
  
  //Setting network info field
  setNetworkInfo: function() {
    let self = this;  
    web3.version.getNetwork((err,result) => {
    
      netId = result;
      console.log(" id is " + netId);
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

      switch(netId) {
        case '1':
          network = "main";
          break;
        case '3':
          network = "ropsten";
          break;
        case '4':
          network = "rinkeby";
          break;    
        default:
          network = "private";
          break;
      } 

      ctAddress = obj;
      $("#networkInfo").html("Connected to " + network + " network.<br>ID: " + netId);  
      web3.eth.getBlockNumber((err, result) => {
        loadBlock = result;
        self.startWatch();
      });
    });
  },

  startWatch: function() {
    let self = this;
    ctInstance = CreateToken.at(ctAddress);

    //start watching contract 
    var anEvent = ctInstance.TokenManagerCreated();
    anEvent.watch( function(err, result) {
    console.log(result.blockNumber);
    console.log(loadBlock);
      if (err) {
        console.log(err);
      } else if (result.blockNumber != loadBlock){

        self.setStatus("Success: " + web3.toAscii(result.args.tokenName) + " created at " + result.args.tokenAddress
        + "<br> with manager at " + result.args.tokenManagerAddress);

        let _description = $("#description").val(); 
        let _sourceCode = NewTokentxt + BaseTokentxt + ERC20Standardtxt;
        let _date = new Date(result.args.creationTime.toNumber() * 1000);
        let _id = SHA256(result.args.creationTime + result.args.tokenAddress + result.args.tokenManagerAddress);
        console.log("HERE");
        $.ajax({
          type: 'POST',
          url: '/api/tokens',
          data: {
            id: _id.toString(),
            name: web3.toAscii(result.args.tokenName).replace(/\u0000/g, ''),
            creator: result.args.creator,
            address: result.args.tokenAddress,
            managerAddress: result.args.tokenManagerAddress,
            creationDate: _date,
            previousAddress: "0",
            firstTokenId: "0",
            description: _description,
            abi: tokenObject.abi,
            sourceCode: _sourceCode 
          },
          datatype: 'json',
          success: function(responseData, textStatus, jqXHR) {
            console.log("Token saved to db");
          },
            
          error: function(jqXHR, textStatus, errorThrown) { 
            console.log(errorThrown);
            console.log("token not saved");
          }
        });
      } 
    });
  },

  setDefault: function() {
    $("#accountInfo").html("...Loading account information.");
    $("#networkInfo").html("...Loading network information.");
  },

  makeNewToken: function(){
    let self = this;
    self.setStatus("Please wait while the token contract is deployed to the blockchain. <br> Don't close the window.");
    let name = $("#name").val();
    let _value = $("#value").val() + '000000000000000000';
    let amount = $("#initialAmount").val();
    let consensusPercent = $("#consensusPercent").val();
    let str = $("#issuanceRate").val();
    let issuanceRate = str.split(",");
    issuanceRate.reverse();
    console.log(issuanceRate);
    let upperCap = $("#upperCap").val();
    let contractRefunds = ($("#contractRefunds").val() == 'true')?true:false;
    
    ctInstance.makeTokenManager(amount, name, consensusPercent, issuanceRate, upperCap, contractRefunds, {from: account, gas: 4000000, value: parseInt(_value)}, (err, result) => {
      if (err) {
        console.log(err);
        self.setStatus("Error creating new Coin");
      }
      else {
        
        alert("success: " + result);
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

$(document).ready(function() {
  $("#nameInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please enter the name that you wish your currency to be called.");
  });
  $("#amountInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please enter the initial amount that you wish your currency to be created with. These token will be stored in the account of the token manager and are accessible for the creator of the token only.");
  });
  $("#issuanceInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please enter the rate at which your token should be issued in the form y = mx + b, where y specified the amount of token issued on a particular day x, where x is the amount of days since creation. In case y takes a negative value or the total amount of token exceeds the upper cap, the issuance rate is set to zero. ");
  });
  $("#refundInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please choose whether the token manager refund ether spent on transactions and instead deduct the equivalent amount of token from the sender's account. This option is discourages when first creating a token, as the token will not have value in the beginning.");
  });
  $("#capInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please enter the maximum amount of token to ever be in circulation.");
  });
  $("#consensusInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please enter the amount of consensus required to implement updates on the token.");
  });
  $("#descriptionInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "Please give a short description of what you intend to achieve with this new token. New users will be able to see this description and join your effort in making it a success.");
  });
  $("#valueInfo").hover(function() {
    $(this).css('cursor', 'pointer').attr('title', "This amount of ether will be sent to the contract and deducted from your account. The contract will use this ether to refund transactions. If you want the contract to refund, it will need some ether!");
  });
});
  

