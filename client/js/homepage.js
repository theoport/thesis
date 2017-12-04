//import "../stylesheets/app.css";

import { default as Web3} from 'web3';

window.App = {
  start: function() {
    var self = this;
    self.setDefault();
    self.setAccountInfo();
    self.setNetworkInfo();
  },
  
  setStatus: function(msg){
    $("#status").html(msg);
  },

  setDefault: function() {
    $("#accountInfo").html("...Loading account information.");
    $("#networkInfo").html("...Loading network information.");
  },

  //Setting account info field 
  setAccountInfo: function(){
    $("#accountInfo").html(() => {
      web3.eth.getAccounts((err,accs) => {

        if (err != null) {
          return "Your account cannot be detected.<br>Please make sure you are using MetaMask or Mist.";
        }

        if (accs.length == 0) {
          return "You don't seem to have an account set up <br>for MetaMask or Mist, please do so.";
        }

        else {
          return ("You are successfully connected through account<br>" + accs[0] + ".");
        } 
      });
    });
  },
  
  //Setting network info field
  setNetworkInfo: function() {
    $("#networkInfo").html(() => {
      web3.version.getNetwork((error,result) => {
        netId = result;

        switch (netId) {
          case '1':
            return "You are connected to the mainnet.";
          case '3':
            return "You are connected to the Ropsten testnet.";
          case '4':
            return "You are connected to the Rinkeby testnet."
          default:
            return "Please make sure you are either connected <br> to the mainnet or the Rinkeby or Ropsten testnets.";
        }
      });
    });
  }
};

window.addEventListener('load', () => {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  self = this;
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } 

  App.start();
});
  
      
