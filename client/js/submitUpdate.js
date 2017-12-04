import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../truffle/build/contracts/TokenManager.json';

import BaseTokentxt from '../../public/txt/BaseToken.txt';
import ERC20Standardtxt from '../../public/txt/ERC20Standard.txt';

let TokenManager, tmInstance;
let NewToken, newTokenInstance;
let account;

window.App = {
  start: function() {

    self = this;
    self.checkData();

    TokenManager=web3.eth.contract(tokenManagerObject.abi); 
    tmInstance = TokenManager.at(token.managerAddress);
    
    web3.eth.getAccounts((err,accs) => {
      if (err != null) {
        alert(err);
      } else if (accs.length == 0) {
        alert("No accounts detected");
      } else {
        account = accs[0];
      }
    });
  },
      
  submitUpdate: function() {

    let abiFile = $("#ABI").prop('files')[0];
    let sourceCodeFile = $("#sourceCode").prop('files')[0];
    let _address = $("#address").val();
    let _abi, _sourceCode, creationTime;

    let readerABI = new FileReader();

    readerABI.onload = ((abi) => {

      _abi = JSON.parse(abi.target.result);
      let readerSource = new FileReader();
      readerSource.onload = ((sourceCode) => {

        _sourceCode = sourceCode.target.result + BaseTokentxt + ERC20Standardtxt;
        NewToken = web3.eth.contract(_abi);
        newTokenInstance = NewToken.at(_address); 
        console.log(newTokenInstance);
      
        newTokenInstance.creationTime((err, result) => {
  
          creationTime = result.toNumber();
          console.log("in order");
          console.log(creationTime);
          console.log(_address);
          console.log(token.managerAddress);
        
          if (err) {
            console.log(err);
          } 
          let _date = new Date(creationTime * 1000);
          let firstId = token.firstTokenId =='0'? token.id : token.firstTokenId;
      

          tmInstance.submitUpdate(_address, {from: account, gas: 4000000}, (err, result) => {
            if (err) {
              alert(err);
            } else {

              $.ajax({
                type: 'POST',
                url: '/api/tokens',
                datatype: 'json',
                data: {
                  id: SHA256(creationTime + _address + token.managerAddress).toString(),
                  description: token.description,
                  name: token.name,
                  creationDate: _date,
                  creator: token.creator,
                  managerAddress: token.managerAddress,
                  previousAddress: token.address,
                  abi: _abi,
                  firstTokenId: firstId,
                  address: _address,
                  sourceCode: _sourceCode 
                },
                success: function(responseData, textStatus, jqXHR) {
                  console.log("token saved to db");
                }
              }); 
            }
          });
        });
      });
      readerSource.readAsText(sourceCodeFile);  
    });
    readerABI.readAsText(abiFile);
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




