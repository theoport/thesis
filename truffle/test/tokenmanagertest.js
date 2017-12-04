var TokenManager = artifacts.require("./TokenManager.sol");
var Token = artifacts.require("./NewToken.sol");
var TokenUpdate = artifacts.require("./NewTokenUpdate.sol");


contract ('TokenManager', function(accounts) {

  it ("Set parameters of tokenManager correctly", function() {
    
    var tokenInstance;
    var tmInstance;

    var voteDuration = 5;
    var voteDurationAfter;

    var exchangeRate = [10, true];
    var exchangeRateAfter;

    var bugHuntDuration = 6;
    var bugHuntDurationAfter;

    var changeOverTime = 7;
    var changeOverTimeAfter;

    var bugExtension = 8;
    var bugExtensionAfter;

    var bountyHuntDuration = 9;
    var bountyHuntDurationAfter;

    var updateTries = 3;
    var updateTriesAfter;

    var priceHourRatio = 5;
    var priceHourRatioAfter;

    var voteDuration = 10;
    var voteDurationAfter;

    var auctionDuration = 11;
    var auctionDurationAfter;

    var etherBalance = 2;
    var etherBalanceAfter;
    
    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;

    }).then(function() {
      tmInstance.setExchangeRate(exchangeRate[0], exchangeRate[1], {from: accounts[0], gas:4700000});
      tmInstance.setBugHunt(bugHuntDuration, {from: accounts[0], gas:4700000});
      tmInstance.setChangeOverTime(changeOverTime, {from: accounts[0], gas:4700000});
      tmInstance.setBugExtension(bugHuntDuration, {from: accounts[0], gas:4700000});
      tmInstance.setBountyHunt(bountyHuntDuration, {from: accounts[0], gas:4700000});
      tmInstance.setUpdateTries(updateTries, {from: accounts[0], gas:4700000});
      tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
      tmInstance.setAuctionDuration(auctionDuration, {from: accounts[0], gas:4700000});
      tmInstance.setEtherBalance(etherBalance, {from: accounts[0], gas:4700000});
    
    }).then(function() {
      return tmInstance.getExchangeRate();
    }).then(function(result) {
      exchangeRateAfter = result; 
      return tmInstance.BUGHUNT();
    }).then(function(result) {
      bugHuntDurationAfter=result;
      return tmInstance.CHANGEOVERTIME();
    }).then(function(result) {
      changeOverTimeAfter = result; 
      return tmInstance.BUGHUNT();
    }).then(function(result) {
      bugHuntDurationAfter= result;
      return tmInstance.BOUNTYHUNT();
    }).then(function(result) {
      bountyHuntDurationAfter = result;;
      return tmInstance.UPDATETRIES();
    }).then(function(result) {
      updateTriesAfter = result;
      return tmInstance.PRICEHOURRATIO();
    }).then(function(result) {
      priceHourRatioAfter = result;
      return tmInstance.VOTEDURATION();
    }).then(function(result) {  
      voteDurationAfter = result;
      return tmInstance.AUCTIONDURATION();
    }).then(function(result) {
      auctionDurationAfter = result;
      return tmInstance.ETHERBALANCE();
    }).then(function(result) {
      etherBalanceAfter = result; 
    }).then(function() {
      assert.equal(exchangeRateAfter[0], exchangeRate[0], 'exchange rate didn\'t update properly');
      assert.equal(exchangeRateAfter[1], exchangeRate[1], 'exchange rate didn\'t update properly');
      assert.equal(bugHuntDuration, bugHuntDurationAfter, 'bughunt duration didn\'t update properly');
      assert.equal(changeOverTimeAfter, changeOverTime, 'changeOver time didn\'t update properly');
      assert.equal(bugHuntDurationAfter, bugHuntDuration, 'bugHunt duration didn\'t update properly');
      assert.equal(bountyHuntDurationAfter, bountyHuntDuration, 'bounty duration didn\'t update properly');
      assert.equal(updateTriesAfter, updateTries, 'update tries didn\'t update properly');
      assert.equal(priceHourRatioAfter, priceHourRatio, 'price/hour ratio didn\'t update properly');
      assert.equal(voteDurationAfter, voteDuration, 'vote duration didn\'t update properly');
      assert.equal(auctionDurationAfter, auctionDuration, 'auction duration didn\'t update properly');
      assert.equal(etherBalanceAfter , etherBalance + '000000000000000000', 'ether balance didn\'t update properly');
    });
  });
/*
  it("Should issue tokens correctly; checked at different times", function() {

    let firstCheck = 0;
    let secondCheck = 0;
    let thirdCheck = 0;

    let tmInstance;
    let tokenInstance;

    let firstCheckCompare;
    let secondCheckCompare;
    let thirdCheckCompare;

    let initialBalance = 6000;
    let m, b;
  
    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
    }).then(function() {
      return tokenInstance.getIssuanceRate();
    }).then(function(issuance) {
      m = issuance[1].toNumber();
      b = issuance[0].toNumber();
    }).then(wait(3000)).then(function() {
      tokenInstance.blockCreator({from: accounts[0], gas: 4700000});  
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {
      for (let i = 0; i < result; i++) {
        firstCheck += m * i + b;
      }
      firstCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      firstCheckCompare = result.toNumber();
      assert.equal(firstCheckCompare, firstCheck, 'first check failed');
    }).then(wait(1000)).then(function() {
      tokenInstance.blockCreator();
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {  
      for (let i = 0; i < result; i++) {
        secondCheck+= m * i + b;
      }
      secondCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      secondCheckCompare = result.toNumber();
      assert.equal(secondCheckCompare, secondCheck, 'second check failed');
    }).then(wait(2000)).then(function() {
      tokenInstance.blockCreator();
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {  
      for (let i = 0; i < result; i++) {
        thirdCheck += m * i + b;
      }
      thirdCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      thirdCheckCompare = result.toNumber();
      assert.equal(thirdCheckCompare, thirdCheck, 'third check failed');
    });
  });
*/
  it ("Set up 5 second bountyhunt and vote; too little votes; fails", function() {
    
    var tokenInstance;
    var tmInstance;
  
    var bountyDuration = 5;
    var voteDuration = 5; 
    var priceHourRatio = 100;

    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
      tokenInstance;
    }).then(function() {
      tmInstance.setBountyHunt(bountyDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
    }).then(function() {
      console.log(voteDuration);
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tokenInstance.mint(200, accounts[0]);
    }).then(function() {
      tmInstance.startBounty(1, 1, {from: accounts[0], gas: 4700000});
    }).then(function() {
      tmInstance.bidForBounty(100, {from: accounts[0], gas: 4700000})
    }).then(wait(7000)).then(function(){
      return tmInstance.endBounty({from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.submitVote(true, {from: accounts[1], gas:4700000});
    }).then(wait(7000)).then(function(){
      return tmInstance.endVote({from: accounts[0], gas:4700000});
    }).then(function(result){
      assert.equal(result.logs[1].event, "UpdateOutcome", "expected UpdateOutcome");
      assert.isNotOk(result.logs[1].args.success, 'Should not be successfull');
    });
  });

  it ("Set up 5 second bountyhunt and vote; no developers; fails", function() {
    
    var tokenInstance;
    var tmInstance;
  
    var bountyDuration = 5;
    var voteDuration = 5; 
    let bountBid = 100;
    let priceHourRatio = 100;

    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
    }).then(function() {
      tmInstance.setBountyHunt(bountyDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
    return tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
    }).then(function() {
      tokenInstance.mint(200, accounts[0]);
    }).then(function() {
      tmInstance.startBounty(1, 1, {from: accounts[0], gas: 4700000});
    }).then(wait(7000)).then(function(){
      return tmInstance.endBounty({from: accounts[0], gas:4700000});
    }).then(function(result) {
      assert.equal(result.logs[1].event, "UpdateOutcome", "expected UpdateOutcome");  
      assert.isNotOk(result.logs[1].args.success, "Shouldn't have been successful");
    });
  });


  it ("Set up successful 5 second bountyhunt and vote; developer fails to submit udpate", function() {
    
    var tokenInstance;
    let tmInstance;
  
    var bountyDuration = 5;
    var voteDuration = 5; 
    let bountyBid = 100;
    let priceHourRatio = 100;
    let voteId = [];

    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
      tokenInstance;
    }).then(function() {
      tmInstance.setBountyHunt(bountyDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
    }).then(function() {
      tokenInstance.mint(200, accounts[0]);
    }).then(function() {
      tmInstance.startBounty(1, 1, {from: accounts[0], gas: 4700000});
    }).then(function() {
      tmInstance.bidForBounty(bountyBid, {from: accounts[0], gas: 4700000})
    }).then(wait(7000)).then(function(){
      return tmInstance.endBounty({from: accounts[0], gas:4700000});
    }).then(function(result) {
      assert.equal(result.logs[1].event, "VoteStarted", "expected VoteStarted");
      voteId = result.logs[1].args.tag;
      return tmInstance.submitVote(true, {from: accounts[0], gas:4700000});
    }).then(function(result){
      assert.equal(result.logs[0].event, "NewVote", "expected NewVote");
      assert.equal(result.logs[0].args.yes, 100, 'Should win with 100%');
      assert.equal(result.logs[0].args.tag, voteId, "tag of newVote should equal tag of start vote");
      assert.equal(result.logs[0].args.no, 0, 'No one vote against');
      assert.isOk(result.logs[1].args.success, 'Vote should\'ve been successful');
      assert.equal(result.logs[2].args.updateId, 1, 'update ID should be 1');
      assert.equal(result.logs[2].args.developer, accounts[0], 'developer should be ' + accounts[0]);
    }).then(wait(2000)).then(function() {
      return tmInstance.endUpdate();
    }).then(function(result) {
      assert.equal(result.logs[0].event, "UpdateOutcome", "expected UpdateOutcome");  
      assert.isNotOk(result.logs[0].args.success, "Shouldn't have been successful");
    });
  });

  it ("Set up successful 5 second bountyHunt and vote; developer submits bug free code; update implemented", function() {
    
    var tokenInstance;
    var tmInstance;
    var tuInstance;
  
    var bountyDuration = 5;
    var voteDuration = 5; 
    let bountBid = 100;
    let priceHourRatio = 100;
    let bugHuntDuration = 5;
    let updateTries = 2;
    let changeOverTime = 5;
    let bugExtension = 5;
    let bugBounty = 10;
    let _manager;
    let _daysSinceCreation;
    let _creationTime;
  
    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
    }).then(function() {
      return tokenInstance.manager();
    }).then(function(manager) {
      _manager = manager;
      return tokenInstance.creationTime();
    }).then(function(time) {
      _creationTime = time;
      return tokenInstance.daysSinceFirstCreation();
    }).then(function(days) {
      _daysSinceCreation = days;
      return TokenUpdate.new(_manager, _creationTime, _daysSinceCreation, {from: accounts[0], gas: 4700000}); 
    }).then(function(instance) {
      return tuInstance = instance; 
    }).then(function() {
      tmInstance.setBugExtension(bugExtension, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setChangeOverTime(changeOverTime, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setUpdateTries(updateTries, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBountyHunt(bountyDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBugHunt(bugHuntDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBugBounty(bugBounty, {from: accounts[0], gas:4700000});
    }).then(function() {
      tokenInstance.mint(200, accounts[0]);
    }).then(function() {
      tmInstance.startBounty(1, 1, {from: accounts[0], gas: 4700000});
    }).then(function() {
      tmInstance.bidForBounty(100, {from: accounts[0], gas: 4700000})
    }).then(wait(7000)).then(function(){
      return tmInstance.endBounty({from: accounts[0], gas:4700000});
    }).then(function() {
      return tmInstance.submitVote(true, {from: accounts[0], gas:4700000});
    }).then(function(result){
      assert.equal(result.logs[0].event, "NewVote", "expected NewVote");
      assert.equal(result.logs[0].args.yes, 100, 'Should win with 100%');
      assert.equal(result.logs[0].args.no, 0, 'No one voted against');
      assert.isOk(result.logs[1].args.success, 'Vote should\'ve been successful');
      assert.equal(result.logs[2].args.updateId, 1, 'update ID should be 1');
      assert.equal(result.logs[2].args.developer, accounts[0], 'developer should be ' + accounts[0]);
    }).then(wait(500)).then(function() {
      return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], gas: 4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "BugHuntStarted", "expected BugHuntStarted");
    }).then(wait(7000)).then(function() {
      return tmInstance.finaliseUpdate({from: accounts[0], gas: 4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "BugHuntEnd", "expected BugHuntEnd");  
      assert.equal(result.logs[1].event, "UpdateOutcome", "expected UpdateOutcome");  
      assert.isOk(result.logs[1].args.success, "should be successful"); 
      assert.equal(result.logs[2].event, "ChangeOver", "expected ChangeOver");  
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 900, "shouldve been paid");
    }).then(function() {
      tmInstance.transferToNewContract({from: accounts[0], gas: 4700000});
    }).then(function() {
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance, 0, "account should be empty");
    }).then(wait(7000)).then(function() {
      return tmInstance.killOldContract();
    }).then(function(result) {
      assert.equal(result.logs[0].event, "OldContractDead", "expected OldContractDead");  
      return tuInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 900, "balance should have been transferred");
      return tmInstance.tokenAddress();
    }).then(function(address) {
      assert.equal(address, tuInstance.address, "New address hasnt been transferred");
    }); 
  });
/*
  it("IN UPDATE: Tokens should still be issued correctly, checked at different times", function() {

    let firstCheck = 0;
    let secondCheck = 0;
    let thirdCheck = 0;

    let tmInstance;
    let tokenInstance;

    let firstCheckCompare;
    let secondCheckCompare;
    let thirdCheckCompare;

    let initialBalance = 6000;
    let m, b;
  
    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return Token.at(address);
    }).then(function(instance) {
      tokenInstance = instance;
    }).then(function() {
      return tokenInstance.getIssuanceRate();
    }).then(function(issuance) {
      m = issuance[1].toNumber();
      b = issuance[0].toNumber();
    }).then(wait(3000)).then(function() {
      tokenInstance.blockCreator({from: accounts[0], gas: 4700000});  
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {
      for (let i = 0; i < result; i++) {
        firstCheck += m * i + b;
      }
      firstCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      firstCheckCompare = result.toNumber();
      assert.equal(firstCheckCompare, firstCheck, 'first check failed');
    }).then(wait(1000)).then(function() {
      tokenInstance.blockCreator();
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {  
      for (let i = 0; i < result; i++) {
        secondCheck+= m * i + b;
      }
      secondCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      secondCheckCompare = result.toNumber();
      assert.equal(secondCheckCompare, secondCheck, 'second check failed');
    }).then(wait(2000)).then(function() {
      tokenInstance.blockCreator();
    }).then(function() {
      return tokenInstance.getDays();
    }).then(function(result) {  
      for (let i = 0; i < result; i++) {
        thirdCheck += m * i + b;
      }
      thirdCheck += initialBalance;
      return tokenInstance.getTotalSupply();
    }).then(function(result) {
      thirdCheckCompare = result.toNumber();
      assert.equal(thirdCheckCompare, thirdCheck, 'third check failed');
      return tokenInstance.balanceOf(tmInstance.address);
    }).then(function(balance) {
    });
  });
*/

  it ("IN UPDATE: Set up successful 5 second bountyhunt and vote, developer submits without bug in second try, update implemented", function() {
    
    var tokenInstance;
    var tmInstance;
    var tuInstance;
    var tuuInstance;
  
    var bountyDuration = 5;
    var voteDuration = 5; 
    let bountBid = 100;
    let priceHourRatio = 100;
    let bugHuntDuration = 5;
    let updateTries = 2;
    let changeOverTime = 5;
    let bugExtension = 5;
    let bugBounty = 10;

    let _manager;
    let _creationTime;
    let _daysSinceCreation;
  
    return TokenManager.deployed().then(function(instance) {
      tmInstance = instance;  
      return instance.tokenAddress();
    }).then(function(address) {
      return TokenUpdate.at(address);
    }).then(function(instance) {
      tuInstance = instance;
    }).then(function() {
      return tuInstance.manager();
    }).then(function(manager) {
      _manager = manager;
      return tuInstance.creationTime();
    }).then(function(time) {
      _creationTime = time;
      return tuInstance.daysSinceFirstCreation();
    }).then(function(days) {
      _daysSinceCreation = days;
      return TokenUpdate.new(_manager, _creationTime, _daysSinceCreation, {from: accounts[0], gas: 4700000}); 
    }).then(function(instance) {
      return tuuInstance = instance;  
    }).then(function() {
      tmInstance.setBugExtension(bugExtension, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setChangeOverTime(changeOverTime, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBugBounty(bugBounty, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setUpdateTries(updateTries, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBountyHunt(bountyDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setBugHunt(bugHuntDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setVoteDuration(voteDuration, {from: accounts[0], gas:4700000});
    }).then(function() {
      tmInstance.setPriceHourRatio(priceHourRatio, {from: accounts[0], gas:4700000});
    }).then(function() {
      tuInstance.mint(200, accounts[0]);
    }).then(function() {
      return tmInstance.startBounty(1, 1, {from: accounts[0], gas: 4700000});
    }).then(function() {
      tmInstance.bidForBounty(100, {from: accounts[0], gas: 4700000})
    }).then(wait(7000)).then(function(){
      return tmInstance.endBounty({from: accounts[0], gas:4700000});
    }).then(function() {
      return tmInstance.submitVote(true, {from: accounts[0], gas:4700000});
    }).then(function(result){
      assert.equal(result.logs[0].event, "NewVote", "expected NewVote");
      assert.equal(result.logs[0].args.yes, 100, 'Should win with 100%');
      assert.equal(result.logs[0].args.no, 0, 'No one voted against');
      assert.isOk(result.logs[1].args.success, 'Vote should\'ve been successful');
      assert.equal(result.logs[2].args.updateId, 1, 'update ID should be 1');
      assert.equal(result.logs[2].args.developer, accounts[0], 'developer should be ' + accounts[0]);
    }).then(wait(500)).then(function() {
      return tmInstance.submitUpdate(tuuInstance.address, {from: accounts[0], gas: 4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "BugHuntStarted", "expected BugHuntStarted");
      return tmInstance.foundBug(1, 1, {from: accounts[1], gas: 4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "BugFound", "expected BugFound");  
      assert.equal(result.logs[1].event, "VoteStarted", "expected VoteStarted");  
      return tmInstance.submitVote(true, {from: accounts[0], gas:4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "NewVote", "expected NewVote");  
      assert.equal(result.logs[1].event, "VotingOutcome", "expected VoteStarted");  
      assert.isOk(result.logs[1].args.success, "expected successful vote"); 
      assert.equal(result.logs[2].event, "BugHuntEnd", "expected BugHuntEnd");  
      assert.equal(result.logs[3].event, "WasABug", "expected WasABug");  
      tmInstance.submitUpdate(tuuInstance.address, {from: accounts[0], gas: 4700000});
    }).then(wait(7000)).then(function() {
      return tmInstance.finaliseUpdate({from: accounts[0], gas: 4700000});
    }).then(function(result) {
      assert.equal(result.logs[0].event, "BugHuntEnd", "expected BugHuntEnd");  
      assert.equal(result.logs[1].event, "UpdateOutcome", "expected UpdateOutcome");  
      assert.isOk(result.logs[1].args.success, "should be successful"); 
      assert.equal(result.logs[2].event, "ChangeOver", "expected ChangeOver");  
    }).then(function() {
      tmInstance.transferToNewContract({from: accounts[0], gas: 4700000});
    }).then(function() {
      return tuInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance, 0, "account should be empty");
    }).then(wait(7000)).then(function() {
      return tmInstance.killOldContract();
    }).then(function(result) {
      assert.equal(result.logs[0].event, "OldContractDead", "expected OldContractDead");  
      return tuuInstance.balanceOf(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 1190, "balance should have been transferred");
      return tmInstance.tokenAddress();
    }).then(function(address) {
      assert.equal(address, tuuInstance.address, "New address hasnt been transferred");
    }); 
  });
});

function wait(ms) {
  return function(x) {
    return new Promise (resolve => setTimeout(() => resolve(x), ms));
  };
}
