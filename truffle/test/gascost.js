var TokenManager = artifacts.require("./TokenManager.sol");
var Token = artifacts.require("./NewToken.sol");
var TokenUpdate = artifacts.require("./NewTokenUpdate.sol");
console.log("Hello");
contract ('TokenManager', function(accounts) {

	it ("Should measure gas", function() {

		var tokenInstance, tmInstance, tuInstance;
		var _manager, _creationTime, _daysSinceCreation;

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
			tuInstance = instance;	
		}).then(function() {
			tmInstance.setBugExtension(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setChangeOverTime(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugBounty(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setUpdateTries(2, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugHunt(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setVoteDuration(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setPriceHourRatio(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			return tmInstance.setBountyHunt(1, {from: accounts[0], gas:4700000});
		}).then(function(result) {
			console.log("Setting a parameter costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tokenInstance.mint(200, accounts[0], {from: accounts[0], gas: 4700000});
		}).then(function() {
			return tokenInstance.transfer(accounts[1], 10, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Transfering token costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(1,1, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Starting a bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Ending a failed bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(2,2, {from: accounts[0], gas: 4700000}); 
		}).then(function() {
			return tmInstance.bidForBounty(20, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Bidding for bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result){
			console.log("Ending successful bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Voting and causing an update vote to succeed costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], fas: 4700000});
		}).then(function(result) {
			console.log("Submitting an update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.foundBug(1, 1, {from: accounts[2], gas: 4700000});
		}).then(function(result) {
			console.log("Finding a bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[0], gas: 4700000});	
		}).then(function(result) {
			console.log("Voting and causing bug vote to succeed costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			return tmInstance.finaliseUpdate({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Finalising update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[1], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[2], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.killOldContract({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Killing old contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
		});
	});

	it ("Should measure gas", function() {

		var tokenInstance, tmInstance, tuInstance;
		var _manager, _creationTime, _daysSinceCreation;

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
			tuInstance = instance;	
		}).then(function() {
			tmInstance.setBugExtension(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setChangeOverTime(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugBounty(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setUpdateTries(2, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugHunt(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setVoteDuration(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setPriceHourRatio(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			return tmInstance.setBountyHunt(1, {from: accounts[0], gas:4700000});
		}).then(function(result) {
			console.log("Setting a parameter costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tokenInstance.mint(200, accounts[0], {from: accounts[0], gas: 4700000});
		}).then(function() {
			return tokenInstance.transfer(accounts[1], 10, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Transfering token costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(1,1, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Starting a bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Ending a failed bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(2,2, {from: accounts[0], gas: 4700000}); 
		}).then(function() {
			return tmInstance.bidForBounty(20, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Bidding for bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result){
			console.log("Ending successful bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Voting and causing an update vote to succeed costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], fas: 4700000});
		}).then(function(result) {
			console.log("Submitting an update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.foundBug(1, 1, {from: accounts[2], gas: 4700000});
		}).then(function(result) {
			console.log("Finding a bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[0], gas: 4700000});	
		}).then(function(result) {
			console.log("Voting and causing bug vote to succeed costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			return tmInstance.finaliseUpdate({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Finalising update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[1], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.transferToNewContract({from: accounts[2], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Transferring funds to new contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.killOldContract({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Killing old contract costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
		});
	});

	it ("Should measure more gas", function() {
		
		var tokenInstance, tmInstance, tuInstance;
		var _manager, _creationTime, _daysSinceCreation;

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
			tuInstance = instance;	
		}).then(function() {
			tmInstance.setBugExtension(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setChangeOverTime(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugBounty(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setUpdateTries(2, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setBugHunt(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setVoteDuration(1, {from: accounts[0], gas:4700000});
		}).then(function() {
			tmInstance.setPriceHourRatio(10, {from: accounts[0], gas:4700000});
		}).then(function() {
			return tmInstance.setBountyHunt(1, {from: accounts[0], gas:4700000});
		}).then(function(result) {
			console.log("Setting a parameter costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tokenInstance.mint(200, accounts[0], {from: accounts[0], gas: 4700000});
		}).then(function() {
			return tokenInstance.transfer(accounts[1], 10, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Transfering token costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(1,1, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Starting a bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Ending a failed bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(2,2, {from: accounts[0], gas: 4700000}); 
		}).then(function() {
			return tmInstance.bidForBounty(10, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Bidding for bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result){
			console.log("Ending successful bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(false, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Voting and causing an update vote to fail costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(1,1, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Starting a bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Ending a failed bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.startBounty(2,2, {from: accounts[0], gas: 4700000}); 
		}).then(function() {
			return tmInstance.bidForBounty(20, {from: accounts[0], gas: 4700000});
		}).then(wait(3000)).then(function(result) {
			console.log("Bidding for bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.endBounty({from: accounts[0], gas: 4700000});
		}).then(function(result){
			console.log("Ending successful bounty costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[0], gas: 4700000});
		}).then(function(result) {
			console.log("Voting and causing an update vote to succeed costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitUpdate(tuInstance.address, {from: accounts[0], fas: 4700000});
		}).then(function(result) {
			console.log("Submitting an update costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.foundBug(1, 1, {from: accounts[2], gas: 4700000});
		}).then(function(result) {
			console.log("Finding a bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(true, {from: accounts[1], gas: 4700000});
		}).then(function(result) {
			console.log("Voting on bug costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
			return tmInstance.submitVote(false, {from: accounts[0], gas: 4700000});	
		}).then(function(result) {
			console.log("Voting and causing bug vote to fail costs: ");
			console.log(result.receipt.gasUsed + " gas.\n");	
		});
	});
});

function wait(ms) {
	return function(x) {
		return new Promise (resolve => setTimeout(() => resolve(x), ms));
	};
}
