import { default as Web3 } from 'web3';
import { default as SHA256} from 'crypto-js/sha256';
import { default as tokenManagerObject } from '../../truffle/build/contracts/TokenManager.json';

let activeAuction, highestBid, highestBidder, account;
let finishedAuctions;
let newHighestBid, auctionStart, auctionFinish;
let TokenManager, tmInstance;

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
      self.fillPage();
    });
  },

  fillPage: function() {
    
    finishedAuctions = [];
  
    auctionStart = tmInstance.AuctionStarted({},{fromBlock: 0});  
    auctionFinish = tmInstance.AuctionEnd({}, {fromBlock: 0});

    auctionFinish.get((err, auctionEnds) => {
      for (var i = 0; i < auctionEnds.length ; i++) {
        finishedAuctions.push(auctionEnds[i].args.auctionId); 
      }
      auctionStart.get((err,auctionStarts) => {
        for (var i = 0; i <auctionStarts.length; i++) {
          if ($.inArray(auctionStarts[i].args.auctionId, finishedAuctions) < 0) {
            activeAuction = auctionStarts[i].args.auctionId;
            $("#auctionId").html(auctionStarts[i].args.auctionId);
            $("#amountOfToken").html(auctionStarts[i].args.amount);
            var finishDate = new Date(auctionStarts[i].args.finishTime * 1000);
            $("#auctionEndTime").html(finishDate);  
            newHighestBid = tmInstance.NewHighestBid({auctionId: activeAuction});
            highestBid = 0;
            newHighestBid.get((err, bids) =>{
              for (var i = 0; i < bids.length ; i++){
                if (bids[i].args.amount > highestBid) {
                  highestBid = bids[i].args.amount;
                  highestBidder = bids[i].args.sender;
                }
              }
              if (highestBidder == account) {
                $("#youWin").html("Congrats! You hold the highest bid.");
              }
              $("#highestBid").html(highestBid);
            });
            tmInstance.getWithdrawable(account, (err, withdrawable) => {
              if (typeof(withdrawable) == 'undefined') {
                withdrawable = 0;
              }
              $("#pastBets").html(withdrawable);
              self.startWatch();
            });
            return;
          }
        }
      $(document).html("<p>Error: No active auctions</p>");
      });
    });
  },
  
  startWatch: function() {  
    newHighestBid.watch((err, bid) =>{
      if (bid.args.amount > highestBid) {
        highestBid = bid.args.amount;
        $("#highestBid").html(highestBid);

        if (bid.args.sender == account) {
          $("#youWin").html("Congrats! You hold the highest bid");
        }
        else {
          $("#youWin").html("");
        }
          
        tmInstance.getWithdrawable(account, (err, withdrawable) => {
          if (typeof(withdrawable) == 'undefined') {
            withdrawable = 0;
          }
          $("#pastBets").html(withdrawable);
        });
      }
    });
  },

  withdraw: function() {
    tmInstance.withdrawReturnedBid({from: account, gas: 4000000}, (err, result) => {
      if (err) {
        alert(err);
      } else {
        alert(result);
      }
    });
  },
      
  submitBid: function() {
    var _value = $("#bid").val();
    tmInstance.bid({from: account, gas: 4000000, value: _value}, (err,result) => {
      if (err) {
        alert(err);
      } else {
        alert(result);
      }
    });
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


