/*This contract is the manager of the token and will stay the same
throughout the lifetime of a token. It keeps track of the updated  
Token contract, and resides over votes, auctions, bughunt, bountyhunts
and udpates. It can also refund the ether spent on transactions within it
in exchange for the equivalent amount in token. To activate this function, 
contractRefunds should be made truthy.*/


pragma solidity ^0.4.8;

import "./NewToken.sol";

contract TokenManager {

	 
	/* 	Variables that can be set by creator at any time.
			Realistically, changing these value should be up for vote. */

	uint256 public LOWESTETHER;
	uint256 public AUCTIONDURATION;
	uint256 public BUGEXTENSION;
	uint256 public BUGHUNT;
	uint256 public BOUNTYHUNT;
	uint256 public UPDATETRIES;
	uint256 public PRICEHOURRATIO;
	uint256 public VOTEDURATION;
	uint256 public CHANGEOVERTIME;
	uint256 public ETHERBALANCE;
	uint256 public CONSENSUSPERCENT;
	bool 		public contractRefunds;

	/* 	Variables that cannot be set by anoyone outside the contract.
			But can be accessed from other contracts. */
	
	uint 		public 		creationTime;
	address public 		tokenAddress; 		
	uint256 public 		version;			

	/* 	Variables that internal to contract. */

	enum 							subject{UPDATE, BUG} 
	bool 							changeOverActive;
	address 					creator;
	NewToken 					token;
	NewToken 					newToken;
	Vote 							vote;
	Auction 					auction;
	Update 						update;
	BountyCompetition bountyCompetition;
	Exchange 					exchange;
  
	struct Exchange {
      uint256 rate;
      bool tokenToWei;
  }

	struct BountyCompetition { 
		bool 		active;
		uint256 startTime;
		uint256 endTime;
		uint256 bestPrice;
		address bidder;
	}
	
	struct Vote{
		bool 				active;
		uint256 		totalYesVotes;
		uint256 		totalNoVotes;
		uint256 		totalPossibleVotes;
		uint256 		startTime;
		uint256 		endTime;
		uint256[3] 	tag;
	}

	struct Auction{
		bool 		active;
		uint256 amount;
		address highestBidder;
		uint256 highestBid;
		uint256 startTime;
		uint256 endTime;
		uint256 id;
		mapping (address => uint256) returnBids;
	}
	
	struct BugHunt {
		bool 		active;
		uint256 startTime;
		uint256 endTime;
		bool 		foundOne;
		uint256 descriptionHash;
		address finder;
		uint256 bugId;
	}
 
	struct Update {
		bool 		active;
		uint256 safetyHash;
		uint256 id;
		uint256 bugBounty;
		bool 		hasSubmitted;
		uint256 timeWindow;
		address developer;
		uint256 price;
		uint256 startTime;
		uint256 endTime;
		BugHunt bugHunt;
		address updatedContract;
		uint256 numberOfTries;
		uint256 timeToKill;
	}
		
	event VoteStarted(uint256 time, uint256 finishTime, uint256[3] tag);
	event VotingOutcome(uint256 time, bool success, uint256[3] tag);
	event NewVote(uint256[3] indexed tag, uint256 yes, uint256 no, address from);

	event BugHuntStarted(uint256 time, uint256 finishTime, uint256 id, uint256 creationTime, address updatedContract, uint256 safetyHash);
	event BugHuntEnd(uint256 time, uint256 updateId);
	event BugFound(uint256 indexed updateId, uint256 indexed bugId, address by, uint256 descriptionHash);
	event WasABug(uint256 updateId, uint256 bugId, uint256 finishTime, address developer, uint256 tries); 
	event WasNotABug(uint256 updateId, uint256 bugId);

	event UpdateStarted(uint256 time, uint256 updateId);
	event UpdateOutcome(uint256 time,bool success, uint256 updateId);

	event AuctionStarted(uint256 time, uint256 finishTime, uint256 auctionId, uint256 amount);
	event AuctionEnd(uint256 time, uint256 auctionId, address winner, uint256 price, uint256 amount);
	event NewHighestBid(uint256 indexed auctionId, address sender, uint256 amount);

	event BountyStarted(uint256 indexed updateId, uint256 time, uint256 finishTime, uint256 safetyHash);
	event BountyEnd(uint256 indexed updateId, uint256 time, address winner, uint256 price); 
	event NewBountyPrice(uint256 indexed updateId, uint256 amount, address bidder);

	event DeveloperStarted(uint256 time, uint256 updateId, uint256 finishTime, address developer);
	event ChangeOver(uint256 finishTime, uint256 updateId);
	event OldContractDead(uint256 updateId);

	//Constructor, creates new token

	function TokenManager(

		uint256 		_initialAmount, 
		bytes32 		_name, 
		uint256 		_consensusPercent,
		uint256[2] 	_issuanceRate,
		uint256 		_upperCap,
		bool 				_contractRefunds

	) payable {

		creator 					= tx.origin;
		ETHERBALANCE			= msg.value;
		CONSENSUSPERCENT 	= _consensusPercent;
		contractRefunds 	= _contractRefunds;
		version 					= 0;
		creationTime 			= now; 
		token 						= new NewToken(_initialAmount, _name, _issuanceRate, _upperCap, tx.origin);
		tokenAddress 			= address(token);

		}

	//getter functions
	
	function getTokenCreationTime() constant returns (uint256) {return token.creationTime();}
	function getTokenAddress() constant returns (address) {return tokenAddress;}
	function getExchangeRate() constant returns (uint256, bool) {
		return (exchange.rate, exchange.tokenToWei);
	}

	//setter functions

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

	function startBounty (uint256 _id, uint256 _safetyHash) public {

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

		require(bountyCompetition.active && now >= bountyCompetition.endTime);

		bountyCompetition.active = false;
		BountyEnd(update.id, now, bountyCompetition.bidder, bountyCompetition.bestPrice);

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

		require(!update.bugHunt.foundOne && update.bugHunt.active && update.bugHunt.endTime >= now);

		update.bugHunt.foundOne = true;
		update.bugHunt.descriptionHash = _descriptionHash;
		update.bugHunt.finder = msg.sender;
		update.endTime += VOTEDURATION;	
		update.bugHunt.bugId = _id;
		BugFound(update.id, update.bugHunt.bugId, msg.sender, _descriptionHash);
		startVote([uint256(subject.BUG), update.id, update.bugHunt.bugId]);
	
	}

	/* Starts a vote on the update and adds tag to vote, also adds developer and price to update struct
	and calculates the timewindow. Sets update to active already so noone can start 
	a new bountyhunt. Can't be called by anyone but this contract*/

	function voteOnUpdate (address _developer, uint256 _price) internal {

		require (!update.active);

		update.active = true;
		update.developer = _developer;
		update.price = _price;
		update.timeWindow = (_price / PRICEHOURRATIO);
		startVote([uint256(subject.UPDATE), update.id, 0]);
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
			
		require (now <= update.endTime && !update.hasSubmitted && update.developer == msg.sender);

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

		require(update.active && now >= update.endTime && update.hasSubmitted);

		//If paying developer fails, can't finalise update
		if (!token.transfer(update.developer, update.price)){
		    throw;
		}
		
		update.active = false;
		update.bugHunt.active = false;
		changeOverActive = true;
		newToken.initialise(token.creator(), token.name(), token.getIssuanceRate(), token.upperCap(), token.limitReached(), token.lastUpdate(), token.noAccountsBlocked(), token.totalSupply()); 	
		version++;
		update.timeToKill = now + CHANGEOVERTIME;

		uint256 amount = token.balanceOf(address(this));
		token.emptyAccount(address(this));
		newToken.add(address(this), amount);

		BugHuntEnd(now, update.id);
		UpdateOutcome(now, true, update.id);
		ChangeOver(update.timeToKill, update.id);
	}

	/* When changeOver is over, anyone can kill the old contract, 
	which is then completely replaced by new contract. */ 

	function killOldContract() public {

		require(changeOverActive && now >= update.timeToKill);

		changeOverActive = false;
		token.kill();
		tokenAddress = update.updatedContract;
		token = NewToken(tokenAddress);
		update.updatedContract = 0;
		OldContractDead(update.id);
	}

	/* Lets users transfer their funds from the old contract to the new contract,
	while change over period is active.*/

	function transferToNewContract() public {

		require(changeOverActive);

		if (token.balanceOf(msg.sender) > 0) {
			var amount = token.balanceOf(msg.sender);
			token.emptyAccount(msg.sender);
			newToken.add(msg.sender, amount); 
		}
	}

	/* Lets anyone end an update when the developer has missed the deadline,
	while change over period is active.*/

	function endUpdate() public {

		require(update.active && now >= update.endTime && !update.hasSubmitted);

		update.active = false;
		UpdateOutcome(now, false, update.id);
	}
		

	/*****************REFUEL***************/
	

	/* This function should only be called by contract when it is refuelling itself. 
	Will start an auction to the amount of token, that is calculated wiht the exchange rate. */
		
	function startAuction(uint256 amountOfToken) internal {
		auction.amount = amountOfToken;
		auction.startTime = now;
		auction.endTime = auction.startTime + AUCTIONDURATION;
		auction.active = true;
		auction.highestBidder = 0;
		auction.highestBid = 0;
		auction.id++;

		AuctionStarted(auction.startTime, auction.endTime, auction.id, auction.amount);
	}

	/* Function to submit a bid for the refuelling auction, can be called by anyone. 
	When bidding, users send the bid as value. If their bid gets beaten, they can withdraw
	the amount back. This is to prevent attackers from delaying the auction by blocking send.*/	
	
	function bid() public payable {
		
		require(now >= auction.startTime && now <= auction.endTime && msg.value > auction.highestBid);

		if (auction.highestBidder != 0){
			auction.returnBids[auction.highestBidder] += auction.highestBid;
		}

		auction.highestBidder = msg.sender;
		auction.highestBid = msg.value;		

		NewHighestBid(auction.id, msg.sender, msg.value);
	}		

	/* Function to withdraw previously beaten bids */

	function withdrawReturnedBid() public returns (bool) {

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

	/*Function to get the withdrawable amount for a user */

	function getWithdrawable(address owner) constant public returns (uint256) {
		return auction.returnBids[owner];
	}

	/*Function to end auction, can be called by anyone.
	Transfers prize to winner, and if it fails their previous bid gets added
	to their withdrawable bets */  
		
	function endAuction() public {

		require(auction.active && now >= auction.endTime);

		auction.active = false;

		if (!(token.transfer(auction.highestBidder, auction.amount))) {
			auction.returnBids[auction.highestBidder] += auction.highestBid;
			return;
		}
		AuctionEnd(now, auction.id, auction.highestBidder, auction.highestBid, auction.amount);
	}
		
		
	/******************VOTE*********************/

	/*Function to start vote, can only be called by contract,
	as only token manager is allowed to schedule votes */
	
	
	function startVote(uint256[3] _tag) internal {

		require(!vote.active);

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

	/*Function to submit binary vote. Freezes account until end of vote
	and automatically checks if a majority was reached or beaten, to end vote */ 

	function submitVote (bool yes) public returns (bool){

		require (vote.active && !(token.isBlocked(msg.sender)) && now >= vote.startTime && now <= vote.endTime );

		if (token.balanceOf(msg.sender) > 0) {

			token.block(msg.sender);

			if (yes) {
				vote.totalYesVotes += token.balanceOf(msg.sender);
			}
			else {
				vote.totalNoVotes += token.balanceOf(msg.sender);
			}

			NewVote(vote.tag, (vote.totalYesVotes * 100) / vote.totalPossibleVotes, (vote.totalNoVotes * 100) / vote.totalPossibleVotes, msg.sender);
			if ((((vote.totalYesVotes * 100) / vote.totalPossibleVotes) > CONSENSUSPERCENT) || (((vote.totalNoVotes * 100)  / vote.totalPossibleVotes) > (100 - CONSENSUSPERCENT))) {
				endVote();
				return true;
			}
			return true;
		}
	}
	
	/*Function to end vote, can be called by anyone.
	Either time is over or majority was reached or beaten.
	Checks if vote was on update or bug, and performs appropriate
	actions for given outcome*/

	function endVote() public returns (bool){

		require(vote.active);
		token.unblockAll();

		if (((vote.totalYesVotes * 100) / vote.totalPossibleVotes) >= CONSENSUSPERCENT){
			
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

			VotingOutcome(now, true, vote.tag);

		} else if (now >= vote.endTime || vote.active && ((vote.totalNoVotes * 100)/ vote.totalPossibleVotes) > (100 - CONSENSUSPERCENT)) {

			vote.active = false;

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

			VotingOutcome(now, false, vote.tag);
		} 
	}

	/*******************MODIFIERS******************/

	
	modifier byCreator(){
		require (msg.sender == creator);
		_;
	}

	/*Tracks the gas used in a transaction and refunds that amount at the end
	adds it to the returnBids mapping from auction. Checks if sender has enough token in the beginning
	and checks if ether, falls below lowest ether balance at the end to start auction. */

	modifier canRefund(){

		if (contractRefunds){
			
			require(token.balanceOf(msg.sender) > gasToToken(msg.gas));
			var gasUsed = msg.gas;
		
		}
			_;

		if (contractRefunds){
	
			gasUsed -= msg.gas;
			if (token.transferToCentral(msg.sender, gasToToken(gasUsed))){
				auction.returnBids[msg.sender] += (gasUsed * tx.gasprice);
			}

			uint256 _balance = this.balance;

			if (_balance < LOWESTETHER) {
				startAuction(weiToToken(ETHERBALANCE = _balance));
			}
		}
	} 


	function gasToToken(uint256 amount) constant returns (uint256){
		return weiToToken(amount) / tx.gasprice;
	}

	/*Function to convert wei to token. As solidity cannot do floating points,
	a bool is needed to indicate whether the exchange rate is above or below 1,
	prompting multiplication or division respectively. The exchange rate is stored
	as multiplied by 100 to inprove accuracy.*/
	
	function weiToToken(uint256 amount) constant returns (uint256){
		
		if (exchange.tokenToWei == true){
			return (amount * 100) / (exchange.rate);
		}
		else if (exchange.tokenToWei == false){
			return (amount * exchange.rate ) / 100;
		}
	}
}
