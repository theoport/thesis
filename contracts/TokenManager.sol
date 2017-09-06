pragma solidity ^0.4.8;

import "./NewToken.sol";

contract TokenManager {

	 
	/* Constants that are set permanently at deployment of contract.
	Could also make it possible to set them after deployment, but
	would have to require further voting, as otherwise too much 
	trust is put in the hands of the creator.*/

	uint256 public LOWESTETHER = 1 ether;

		uint256 public AUCTIONDURATION;
		uint256 public BUGEXTENSION;
		uint256 public BUGHUNT;
		uint256 public BOUNTYHUNT;
		uint256 public UPDATETRIES;
		uint256 public PRICEHOURRATIO;
		uint256 public VOTEDURATION;
		uint256 public CHANGEOVERTIME;
		uint256 public ETHERBALANCE;

	enum subject{UPDATE, BUG} 
	bool changeOverActive;
	address creator;
	uint public creationTime;
	address public tokenAddress; // address of the token managed by this contract
	address public newTokenAddress;
	NewToken token;
	NewToken newToken;
	uint256 public consensusPercent;	// percentage required for any vote to succeed
	bool public contractRefunds;	// does the contract refund, can be updated
	uint256 public version;	// version number of token
	Vote vote;
	Auction auction;
	Update update;
	BountyCompetition bountyCompetition;
	Exchange public exchange;
  
	struct Exchange {
      uint256 rate;
      bool tokenToWei;
  }

	/* Struct for competition between developers on who can implement the update 
	for the best price. While a competition is active, no other competition can be started.*/
			
	struct BountyCompetition { 
		uint256 startTime;
		uint256 endTime;
		uint256 bestPrice;
		address bidder;
		bool active;
	}
	
	/* Struct for vote of any kind. Each vote gets a unique id which increases by one 
	for every new vote. While a vote is happening, no other votes can be started. 
	Voters get amount of votes proprtional to their token balance. Once voted, the account
	is blocked and only unblocked at the end of the vote. A vote ends by either exceeding the 
	time limit or surpassing the required percentage.*/

	struct Vote{
		bool active;
		uint256 totalYesVotes;
		uint256 totalNoVotes;
		uint256 totalPossibleVotes;
		uint256 startTime;
		uint256 endTime;
		uint256[3] tag;
	}

	/* Auction struct, at the moment only used for refuelling. To avoid attacks, bids that
	have been overbidded will not immediately get sent back to the bidder but will be added
	to the mapping returnBids and can be withdrawn by the bidder. Amount is the amount of
	tokens that is being sold.*/

	struct Auction{
		uint256 amount;
		bool active;
		address highestBidder;
		uint256 highestBid;
		uint256 startTime;
		uint256 endTime;
		uint256 id;
		mapping (address => uint256) returnBids;
	}
	
	/* BugHunt represents the time phase after a developer submitted the upgraded token 
	contract, in which anyone can search for bugs. If one is found, the hash of its description
	is logged and the finder is rewarded a price in token once the community has voted that this 
	is indeed a bug. The price for finding a bug is deducted from the reward for the upgraded contract,
	as otherwise developer and bug-hunter can cooperate to make more money.*/
 
	struct BugHunt {
		uint256 startTime;
		uint256 endTime;
		bool active;
		bool foundOne;
		uint256 descriptionHash;
		address finder;
		uint256 bugId;
	}

	/* Update is for the time starting with bountyHunt and ending with the submission of the updated contract. 
	Even updates that don't get voted through or dont find any developers willing to implement it receive a 
	unique id. When an update is active, no new updates can be proposed. When the update is submitted, the bughunt
	begins, and if one is found, the developer gets BUGEXTENSION more days to fix it. An update finishes when a 
	developer submits bug-free code or when the time limit passes. In which case the developer is paid nothing and no
	update is implemented. The timewindow is proportional to the price a developer will receive upon completion, where
	the ratio can be changed. This is to stop attackers from offering very low prices and delaying the updates by not doing
	anything. Not at all perfect yet.*/
 
	struct Update {
		uint256 safetyHash;
		uint256 id;
		uint256 bugBounty;
		bool hasSubmitted;
		uint256 timeWindow;
		address developer;
		uint256 price;
		bool active;
		uint256 startTime;
		uint256 endTime;
		BugHunt bugHunt;
		address updatedContract;
		uint256 numberOfTries;
		uint256 timeToKill;
	}
		
	event VoteStarted(uint256 time, uint256 finishTime, uint256[3] tag);
	event BugHuntEnd(uint256 time, uint256 updateId);
	event VotingOutcome(uint256 time, bool success, uint256[3] tag);
	event UpdateOutcome(uint256 time,bool success, uint256 updateId);
	event NewHighestBid(uint256 indexed auctionId, address sender, uint256 amount);
	event AuctionEnd(uint256 time, uint256 auctionId, address winner, uint256 price, uint256 amount);
	event Failure(uint256 time, bytes32 message, uint256 id);
	event NewBountyPrice(uint256 indexed updateId, uint256 amount, address bidder);
	event BountyEnded(uint256 indexed updateId, uint256 time, address winner, uint256 price); 
	event BountyStarted(uint256 indexed updateId, uint256 time, uint256 finishTime, uint256 safetyHash);
	event BugFound(uint256 indexed updateId, uint256 indexed bugId, address by, uint256 descriptionHash);
	event AuctionStarted(uint256 time, uint256 finishTime, uint256 auctionId, uint256 amount);
	event BugHuntStarted(uint256 time, uint256 finishTime, uint256 id, uint256 creationTime, address updatedContract, uint256 safetyHash);
	event UpdateStarted(uint256 time, uint256 updateId);
	event DeveloperStarted(uint256 time, uint256 updateId, uint256 finishTime, address developer);
	event WasABug(uint256 updateId, uint256 bugId, uint256 finishTime, address developer, uint256 tries); 
	event WasNotABug(uint256 updateId, uint256 bugId);
	event NewVote(uint256[3] indexed tag, uint256 yes, uint256 no, address from);
	event ChangeOver(uint256 finishTime, uint256 updateId);
	event OldContractDead(uint256 updateId);

	//Constructor, creates new token

	function TokenManager(
		uint256 _initialAmount, 
		bytes32 _name, 
		uint256 _consensusPercent,
		uint256[2] _issuanceRate,
		uint256 _upperCap,
		bool _contractRefunds
	) payable {
		creator 					= tx.origin;
		ETHERBALANCE			= msg.value;
		consensusPercent 	= _consensusPercent;
		contractRefunds 	= _contractRefunds;
		version 					= 0;
		creationTime 			= now; 
		token 						= new NewToken(_initialAmount, _name, _issuanceRate, _upperCap, tx.origin);
		tokenAddress 			= address(token);
		}
	function getTokenCreationTime() constant returns (uint256) {return token.creationTime();}
	function getTokenAddress() constant returns (address) {return tokenAddress;}
	function getExchangeRate() constant returns (uint256, bool) {
		return (exchange.rate, exchange.tokenToWei);
	}
	function setBugBounty(uint256 percent) {update.bugBounty = percent;}
	function setContractRefunds(bool _x) public byCreator {contractRefunds = _x;}	
	function setExchangeRate(uint256 _rate, bool _tokenToWei) byCreator {
		exchange.rate = _rate;
		exchange.tokenToWei = _tokenToWei;
	}
	function setBugHunt (uint256 _hunt) byCreator {BUGHUNT = _hunt;}
	function setChangeOverTime (uint256 _time) byCreator {CHANGEOVERTIME = _time;}
	function setBugExtension (uint256 _extension) byCreator {BUGEXTENSION = _extension;}
	function setBountyHunt(uint256 _huntDuration) byCreator {BOUNTYHUNT = _huntDuration;}
	function setUpdateTries (uint256 _tries) byCreator {UPDATETRIES = _tries;}
	function setPriceHourRatio(uint256 _ratio) public byCreator {PRICEHOURRATIO= _ratio;}
	function setVoteDuration(uint256 _duration) public byCreator {VOTEDURATION = _duration;}
	function setAuctionDuration(uint256 _duration) public byCreator {AUCTIONDURATION = _duration;}
	function setEtherBalance(uint256 _balance) public byCreator {ETHERBALANCE = _balance * (1 ether);}

	//Fallback function
	function () payable {
	}
	
	/**************BOUNTYHUNT***********/

	/* This function can be called by anyone, but should only really be called
	when there is enough interest exists for an update. Think about solution.
	It sets the udpate version number, name and description and logs it for future
	referral. After the bounty is started, anyone can compete for the job for the 
	specified amount of time.*/

	function startBounty (uint256 _id, uint256 _safetyHash)public{
		require (!changeOverActive && !bountyCompetition.active && !update.active);
		bountyCompetition.active = true;
		bountyCompetition.startTime = now;
		bountyCompetition.endTime = bountyCompetition.startTime + BOUNTYHUNT;
		bountyCompetition.bestPrice = 0;
		update.id= _id;
		update.safetyHash = _safetyHash;
		UpdateStarted(bountyCompetition.startTime, update.id);
		BountyStarted(update.id, bountyCompetition.startTime, bountyCompetition.endTime, _safetyHash);
	}

	/* Lets anyone bid for bounty, if one is active. Frontend takes care of 
	making sure people know what they're voting for, but contract will also log
	a bid alongside the update id for future referral */
		
	function bidForBounty (uint256 price) public {
		require((now >= bountyCompetition.startTime && now <= bountyCompetition.endTime)); 
		if (price < bountyCompetition.bestPrice || bountyCompetition.bestPrice == 0) {
			bountyCompetition.bestPrice = price;
			bountyCompetition.bidder = msg.sender;
			NewBountyPrice(update.id, price, msg.sender); 
		}
	}
	
	/* Function ends bounty, can be called by anyone as long as time is over and 
	it hasn't been ended already. Goes straight into starting a vote for the update. */

	function endBounty () public {
		require(now >= bountyCompetition.endTime);
		require(bountyCompetition.active);
		bountyCompetition.active = false;
		BountyEnded(update.id, now, bountyCompetition.bidder, bountyCompetition.bestPrice);
		if (bountyCompetition.bestPrice == 0){
			UpdateOutcome(now, false, update.id);
		} else {
			voteOnUpdate(bountyCompetition.bidder, bountyCompetition.bestPrice);
		}
	}

	/**************UPDATE TOKEN**************/

	/* Function to signal you found a bug, submits description hash, 
	and immediately starts a vote on whether it is a bug or not.*/
	

	function foundBug (uint256 _descriptionHash, uint256 _id) public {
		assert(update.bugHunt.active && update.bugHunt.endTime > now);
		if (update.bugHunt.foundOne) {
			Failure(now, "found", 7);
			return;
		}
		update.bugHunt.foundOne = true;
		update.bugHunt.descriptionHash = _descriptionHash;
		update.bugHunt.finder = msg.sender;
		//IS IT REALLY A BUG?	GIVE TIME FOR BUG FINDER AND DEVELOPER TO DISCUSS
		update.endTime += VOTEDURATION;	
		update.bugHunt.bugId = _id;
		BugFound(update.id, update.bugHunt.bugId, msg.sender, _descriptionHash);
		startVote([uint256(subject.BUG), update.id, update.bugHunt.bugId]);
	}

	/* Starts a vote on the update and adds tag to vote, also adds developer and price to update struct
	and calculates the timewindow. Sets update to active already so noone can start 
	a new bountyhunt. Can't be called by anyone but this contract*/

	function voteOnUpdate (address _developer, uint256 _price) internal {
		if (update.active) {
			Failure(12,"D",12);
		} else {
		//require (!update.active);
		update.developer = _developer;
		update.price = _price;
		update.timeWindow = (_price / PRICEHOURRATIO);
		update.active = true;
		startVote([uint256(subject.UPDATE), update.id, 0]);
		}
	}
	
	/* If vote is successfull, start update, can only be called by this contract */

	function startUpdate () internal{
		update.numberOfTries = UPDATETRIES;
		update.hasSubmitted = false;
		update.startTime = now;
		update.endTime = update.startTime + update.timeWindow;
		DeveloperStarted(update.startTime, update.id, update.endTime, update.developer);
	}

	/* Function to submit an update, must be sent by developer before end of time window.
	Starts bughunt and sets address of possible new contract. js can then check if contracts
	match.*/
	
	function submitUpdate (address _updatedContract) public{
			
		require (!update.hasSubmitted && update.developer == msg.sender);
		assert(now <= update.endTime);
		update.hasSubmitted = true;
		update.bugHunt.active = true;
		update.bugHunt.startTime = now;
		update.bugHunt.endTime = update.bugHunt.startTime + BUGHUNT;
		update.endTime = now + BUGHUNT;
		update.updatedContract = _updatedContract;	
		newToken = NewToken(update.updatedContract);
		BugHuntStarted(update.bugHunt.startTime, update.bugHunt.endTime, update.id, newToken.creationTime(), update.updatedContract, update.safetyHash);
	}

	/* If no bugs are found, time passes and anyone can finalise the update, sending the 
	price to the developer. */	

	function finaliseUpdate() public {
		assert(update.active && now >= update.endTime && update.hasSubmitted);
		if (!token.transfer(update.developer, update.price)){
		    Failure(now, "Couldn't pay developer", 8);
		    return;
		}
		
		newToken.initialise(token.creator(), token.name(), token.getIssuanceRate(), token.upperCap(), token.limitReached(), token.lastUpdate(), token.noAccountsBlocked(), token.totalSupply()); 	
		update.active = false;
		update.bugHunt.active = false;
		version++;
		BugHuntEnd(now, update.id);
		UpdateOutcome(now, true, update.id);
		changeOverActive = true;
		update.timeToKill = now + CHANGEOVERTIME;
		var amount = token.balanceOf(address(this));
		token.emptyAccount(address(this));
		newToken.add(address(this), amount);
		ChangeOver(update.timeToKill, update.id);
	}

	function killOldContract() public {
		require(changeOverActive && now >= update.timeToKill);
		changeOverActive = false;
		token.kill();
		tokenAddress = update.updatedContract;
		token = NewToken(tokenAddress);
		update.updatedContract = 0;
		OldContractDead(update.id);
	}

	function transferToNewContract() public {
		require(changeOverActive);
		if (token.balanceOf(msg.sender) > 0) {
			var amount = token.balanceOf(msg.sender);
			token.emptyAccount(msg.sender);
			newToken.add(msg.sender, amount); 
		}
	}

	function endUpdate() public {
		assert(update.active && now >= update.endTime && !update.hasSubmitted);
		update.active = false;
		UpdateOutcome(now, false, update.id);
	}
		

	/*****************REFUEL***************/
	
	function startAuction(uint256 amountOfToken) {
		auction.amount = amountOfToken;
		auction.startTime = now;
		auction.endTime = auction.startTime + AUCTIONDURATION;
		auction.active = true;
		auction.highestBidder = 0;
		auction.highestBid = 0;
		auction.id++;
		AuctionStarted(auction.startTime, auction.endTime, auction.id, auction.amount);
	}
	
	function bid() payable {
		
		assert(now >= auction.startTime && now <= auction.endTime);
		assert(msg.value > auction.highestBid);
		if (auction.highestBidder != 0){
			auction.returnBids[auction.highestBidder] += auction.highestBid;
		}
		auction.highestBidder = msg.sender;
		auction.highestBid = msg.value;		
		NewHighestBid(auction.id, msg.sender, msg.value);
	}		

	function withdrawReturnedBid() returns (bool) {
		if (auction.returnBids[msg.sender] > 0)	{
			var temp = auction.returnBids[msg.sender];
			auction.returnBids[msg.sender] = 0;
			if (!msg.sender.send(temp)) {
				auction.returnBids[msg.sender] = temp;
				return false;
			}
			return true;
		}
	}

	function getWithdrawable(address owner) constant returns (uint256) {
		return auction.returnBids[owner];
	}
		
	function endAuction(){
		assert(auction.active);
		assert(now >= auction.endTime);
		auction.active = false;
		if (!(token.transfer(auction.highestBidder, auction.amount))) {
			auction.returnBids[auction.highestBidder] += auction.highestBid;
			Failure(now, "Ending auction failed", 9);
			return;
		}
		AuctionEnd(now, auction.id, auction.highestBidder, auction.highestBid, auction.amount);
	}
		
		
	/******************VOTE*********************/
	
	function startVote(uint256[3] _tag) internal {
		if (vote.active) {
			Failure(13,"H",13);
		} else {
		//require(!vote.active);
		vote.totalPossibleVotes = token.totalSupply() - token.balanceOf(address(this));
		vote.totalNoVotes = 0;
		vote.totalYesVotes = 0;
		vote.active = true;
		vote.startTime = now;
		vote.endTime = vote.startTime + VOTEDURATION;
		vote.tag = _tag;
		token.block(address(this));
		VoteStarted(vote.startTime, vote.endTime, _tag); 
		}
	}

	function submitVote (bool yes) returns (bool){
		if (!vote.active) {
			Failure(2,"AAA",2);
/*
		} else if (token.isBlocked(msg.sender)) {
			Failure(3,"AAA",2);
		} else if (now < vote.startTime) {
			Failure(now,"AAA",vote.startTime);
		} else if (now > vote.endTime) {
			Failure(now, "CCCCC", vote.endTime);
*/
		} else {

		//require (vote.active && !(token.isBlocked(msg.sender)) && now >= vote.startTime && now <= vote.endTime );
		if (token.balanceOf(msg.sender) > 0) {
			token.block(msg.sender);
			if (yes) {
				vote.totalYesVotes += token.balanceOf(msg.sender);
			}
			else {
				vote.totalNoVotes += token.balanceOf(msg.sender);
			}
			NewVote(vote.tag, (vote.totalYesVotes * 100) / vote.totalPossibleVotes, (vote.totalNoVotes * 100) / vote.totalPossibleVotes, msg.sender);
			if (((vote.totalYesVotes / vote.totalPossibleVotes) * 100) > consensusPercent || ((vote.totalNoVotes / vote.totalPossibleVotes) * 100) > (100 - consensusPercent)) {
				endVote();
				return true;
			}
			return true;
		}
		}
	}

	function endVote() returns (bool){
		if (!vote.active) {
			Failure(4,"DDD",4);
		} else if(vote.totalPossibleVotes == 0) {
			Failure(5,"EEE",5);
		} else  {
		//require(vote.active);
		token.unblockAll();
		if (((vote.totalYesVotes / vote.totalPossibleVotes) * 100) >= consensusPercent){
			
			VotingOutcome(now, true, vote.tag);
			vote.active = false;
			if (uint256(vote.tag[0]) == uint256(subject.BUG)) {
				update.bugHunt.foundOne = false;
				update.bugHunt.active = false;
				token.transfer(update.bugHunt.finder, (update.price / (100 / update.bugBounty)));

				if (--update.numberOfTries <= 0) {
					update.endTime = now;
					update.active = false;
					BugHuntEnd(now, update.id);
					UpdateOutcome(now, false, update.id);
					return true;
				}	

				update.price -= (update.price / (100 / update.bugBounty));
				update.endTime = now + BUGEXTENSION;
				update.hasSubmitted = false;
				BugHuntEnd(now, update.id);
				WasABug(update.id, update.bugHunt.bugId, update.endTime, update.developer, update.numberOfTries);
				return true;
			} else if (uint256(vote.tag[0]) == uint256(subject.UPDATE)) { 
				startUpdate();
				return true;
			}	

		} else if (now >= vote.endTime || vote.active && ((vote.totalNoVotes / vote.totalPossibleVotes) * 100) > (100 - consensusPercent)) {
			vote.active = false;
			VotingOutcome(now, false, vote.tag);
			if (uint256(vote.tag[0]) == uint256(subject.UPDATE)) {
				update.active = false;
				UpdateOutcome(now, false, update.id);	
				return true;
			}
			else if (uint256(vote.tag[0]) == uint256(subject.BUG)) {
				update.bugHunt.foundOne = false;
				WasNotABug(update.id, update.bugHunt.bugId);
				return true;
			}
		} 
		}
	}

	/*******************REFUND******************/

	
	modifier byCreator(){
		require (msg.sender == creator);
		_;
	}

	modifier canRefund(){
		_;
/*		
		if (contractRefunds){
			
			assert(token.balanceOf(msg.sender) > gasToToken(msg.gas));
			var gasUsed = msg.gas;
		
		}
			_;
		if (contractRefunds){
	
			gasUsed -= msg.gas;
			token.transferToCentral(msg.sender, gasToToken(gasUsed));
			if (!(msg.sender).send(gasUsed * tx.gasprice)){
				Failure(now, "Couldn't refund", 10);
				token.transfer(msg.sender, gasToToken(gasUsed));
			} 
			uint256 _balance = this.balance;
			if (_balance < LOWESTETHER) {
				startAuction(weiToToken(ETHERBALANCE = _balance));
			}
		}
*/
	} 


	//should probably be done frontend;
	function gasToToken(uint256 amount) constant returns (uint256){
		return weiToToken(amount) * tx.gasprice;
	}

	
	function weiToToken(uint256 amount) constant returns (uint256){
		
		if (exchange.tokenToWei == true){
			return (amount) / (exchange.rate / 100);
		}
		else if (exchange.tokenToWei == false){
			return (amount * exchange.rate ) / 100;
		}
	}
}
