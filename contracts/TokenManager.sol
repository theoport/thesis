pragma solidity ^0.4.8;

import "./NewToken.sol";

contract TokenManager {

	 
	/* Constants that are set permanently at deployment of contract.
	Could also make it possible to set them after deployment, but
	would have to require further voting, as otherwise too much 
	trust is put in the hands of the creator.*/

	uint256 constant PARAMETERS = 4;
	uint256 constant INFOS = 3;
	uint256 constant LOWESTETHER = 1 ether;

		uint256 AUCTIONDURATION;
		uint256 BUGEXTENSION;
		uint256 BUGHUNT;
		uint256 BOUNTYHUNT;
		uint256 UPDATETRIES;
		uint256 HOURPRICERATIO;
		uint256 VOTEDURATION;
		uint256 ETHERBALANCE;

	enum subject{UPDATE, BUG} 
	address creator;
	uint public creationTime;
	address public tokenAddress; // address of the token managed by this contract
	NewToken token;
	uint256 private consensusPercent;	// percentage required for any vote to succeed
	uint256 private initialAmount;	// initial amount of token
	bool private contractRefunds;	// does the contract refund, can be updated
	uint256 public version;	// version number of token
	Vote vote;
	Auction auction;
	Update update;
	BountyCompetition bountyCompetition;
	Exchange exchange;
  
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
		mapping (uint256 => address) accountsThatVoted;
		uint256 voteCount;
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
		bool active;
		bool foundOne;
		uint256 descriptionHash;
		address finder;
		uint256 id;
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
		uint numberOfTries;
	}
		
	event VoteStarted(uint256 time, uint256[3] tag);
	event BugHuntEnd(uint256 time, uint256 updateId);
	event VotingOutcome(uint256 time, bool success, uint256[3] tag);
	event UpdateOutcome(uint256 time,bool success, uint256 updateId);
	event NewHighestBid(address sender, uint256 amount, uint256 auctionId);
	event AuctionEnd(uint256 time, uint256 auctionId, address winner, uint256 price, uint256 amount);
	event Failure(uint256 time, bytes32 message, uint256 id);
	event NewBountyPrice(uint256 amount, address bidder, uint256 updateId);
	event BountyEnded(uint256 time, address winner, uint256 price, uint256 updateId); 
	event BountyStarted(uint256 time, uint256 updateId);
	event BugFound(address by, uint256 updateId, uint256 bugId, uint256 descriptionHash);
	event AuctionStarted(uint256 time, uint256 auctionId, uint256 amount);
	event BugHuntStarted(uint256 time, uint256 id);
	event UpdateStarted(uint256 time, uint256 updateId, uint256 safteyHash);
	event DeveloperStarted(uint256 time, uint256 updateId, uint256 finishTime, uint256 developer);
	event WasABug(uint256 updateId, uint256 bugId, uint256 finishTime, address developer, uint256 tries); 
	event WasNotABug(uint256 updateId, uint256 bugId);
	event NewVote(uint256[3] tag, uint256 yes, uint256 no);

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
		initialAmount			= _initialAmount;
		consensusPercent 	= _consensusPercent;
		contractRefunds 	= _contractRefunds;
		version 					= 0;
		creationTime 			= now; 
		token 						= new NewToken(_initialAmount, _name, _issuanceRate, _upperCap, creationTime);
		tokenAddress 			= address(token);
		}

	function getTokenAddress() constant returns (address) {return tokenAddress;}
	function setContractRefunds(bool _x) public byCreator {contractRefunds = _x;}	
	function setExchangeRate(uint256 _rate, bool _tokenToWei) byCreator {
		exchange.rate = _rate;
		exchange.tokenToWei = _tokenToWei;
	}
	function setBugHunt (uint256 _hunt) byCreator {BUGHUNT = _hunt * (1 days);}
	function setBugExtension (uint256 _extension) byCreator {BUGEXTENSION = _extension * (1 days);}
	function setBountyHunt(uint256 _huntDuration) byCreator {BOUNTYHUNT = _huntDuration * (1 days);}
	function setUpdateTries (uint256 _tries) byCreator {UPDATETRIES = _tries;}
	function setHourPriceRatio(uint256 _ratio) public byCreator {HOURPRICERATIO = _ratio;}
	function setVoteDuration(uint256 _duration) public byCreator {VOTEDURATION = _duration * (1 hours);}
	function setAuctionDuration(uint256 _duration) public byCreator {AUCTIONDURATION = _duration;}
	function setEtherBalance(uint256 _balance) public byCreator {ETHERBALANCE = _balance;}
	
	/**************BOUNTYHUNT***********/

	/* This function can be called by anyone, but should only really be called
	when there is enough interest exists for an update. Think about solution.
	It sets the udpate version number, name and description and logs it for future
	referral. After the bounty is started, anyone can compete for the job for the 
	specified amount of time.*/

	function startBounty (uint256 _id, uint256 _safetyHash)public{
		require (!bountyCompetition.active && !update.active);
		bountyCompetition.active = true;
		bountyCompetition.startTime = now;
		bountyCompetition.endTime = bountyCompetition.startTime + BOUNTYHUNT;
		bountyCompetition.bestPrice = 0;
		update.id= _id;
		UpdateStarted(update.id, _safetyHash, bountyCompetition.startTime);
		BountyStarted(update.id);
	}

	/* Lets anyone bid for bounty, if one is active. Frontend takes care of 
	making sure people know what they're voting for, but contract will also log
	a bid alongside the update id for future referral */
		
	function bidForBounty (uint256 price) public {
		assert(now >= bountyCompetition.startTime && now <= bountyCompetition.endTime);
		if (price < bountyCompetition.bestPrice || bountyCompetition.bestPrice == 0) {
			bountyCompetition.bestPrice = price;
			bountyCompetition.bidder = msg.sender;
			NewBountyPrice(price, msg.sender, update.id); 
		}
	}
	
	/* Function ends bounty, can be called by anyone as long as time is over and 
	it hasn't been ended already. Goes straight into starting a vote for the update. */

	function endBounty ()public{
		assert(bountyCompetition.active);
		assert(now >= bountyCompetition.endTime);
		bountyCompetition.active = false;
		BountyEnded(bountyCompetition.bidder, bountyCompetition.bestPrice, update.id);
		if (bountyCompetition.bestPrice == 0){
			UpdateOutcome(false, update.id);
		} else {
			voteOnUpdate(bountyCompetition.bidder, bountyCompetition.bestPrice);
		}
	}
			

	/**************UPDATE TOKEN**************/

	/* Function to signal you found a bug, submits description hash, 
	and immediately starts a vote on whether it is a bug or not.*/
	

	function foundBug (uint256 _descriptionHash, uint256 _id) public {
		assert(update.bugHunt.active);
		if (update.bugHunt.foundOne) {
			Failure(now, "A bug was already found", update.id);
			return;
		}
		update.bugHunt.foundOne = true;
		update.bugHunt.descriptionHash = _descriptionHash;
		update.bugHunt.finder = msg.sender;
		//IS IT REALLY A BUG?	GIVE TIME FOR BUG FINDER AND DEVELOPER TO DISCUSS
		update.endTime += VOTEDURATION;	
		update.bugHunt.bugId = _id;
		BugFound(msg.sender, update.id, update.bugHunt.bugId, _descriptionHash);
		startVote([uint256(subject.BUG), update.id, update.bugHunt.bugId]);
	}

	/* Starts a vote on the update and adds tag to vote, also adds developer and price to update struct
	and calculates the timewindow. Sets update to active already so noone can start 
	a new bountyhunt. Can't be called by anyone but this contract*/

	function voteOnUpdate (address _developer, uint256 _price) internal {
		require (!update.active);
		update.developer = _developer;
		update.price = _price;
		update.timeWindow = _price * HOURPRICERATIO * (1 hours);
		update.active = true;
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
		assert (update.developer == msg.sender);
		assert(now <= update.endTime);
		hasSubmitted = true;
		update.bugHunt.active = true;
		update.endTime = now + BUGHUNT;
		update.updatedContract = _updatedContract;	
		BugHuntStarted(now, update.id, update.updatedContract);
	}

	/* If no bugs are found, time passes and anyone can finalise the update, sending the 
	price to the developer. */	

	function finaliseUpdate() public {
		assert(update.active && now >= update.endTime && hasSubmitted);
		if (!token.transfer(update.developer, update.price)){
		    Failure(now, "Couldn't pay developer", update.id);
		    return;
		}
		tokenAddress = update.updatedContract;
		token = NewToken(tokenAddress);
		version++;
		update.active = false;
		BugHuntEnd(now, update.id);
		UpdateOutcome(true, update.id);
	}

	function endUpdate() public {
		assert(update.active && now >= update.endTime && !hasSubmitted);
		update.active = false;
		UpdateOutcome(false, update.id);
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
		AuctionStarted(auction.startTime, auction.id, auction.amount);
	}
	
	function bid() payable {
		
		assert(now >= auction.startTime && now <= auction.endTime);
		assert(msg.value > auction.highestBid);
		if (auction.highestBidder != 0){
			auction.returnBids[auction.highestBidder] += auction.highestBid;
		}
		auction.highestBidder = msg.sender;
		auction.highestBid = msg.value;		
		NewHighestBid(msg.sender, msg.value, auction.id);
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
		
	function endAuction(){
		assert(auction.active);
		assert(now >= auction.endTime);
		auction.active = false;
		if (!(token.transfer(auction.highestBidder, auction.amount))) {
			auction.returnBids[auction.highestBidder] += auction.highestBid;
			Failure(now, "Ending auction failed", auction.id);
			return;
		}
		AuctionEnd(now, auction.id, auction.highestBidder, auction.highestBid, auction.amount);
	}
		
		
	/******************VOTE*********************/
	
	function startVote(uint256[3] _tag) canRefund {
		assert(!vote.active);
		vote.totalPossibleVotes = token.totalSupply() - token.balanceOf(address(this));
		vote.totalNoVotes = 0;
		vote.totalYesVotes = 0;
		vote.active = true;
		vote.startTime = now;
		vote.endTime = vote.startTime + VOTEDURATION;
		vote.tag = _tag;
		VoteStarted(vote.startTime, _tag); 
	}
	
	function submitVote (bool yes) {
		if (now >= vote.startTime && now <= vote.endTime ) {
			if (yes) {
				vote.totalYesVotes += token.balanceOf(msg.sender);
			}
			else {
				vote.totalNoVotes += token.balanceOf(msg.sender);
			}
			token.block(msg.sender);
			NewVote(vote.tag, (vote.totalYesVotes * 100) / vote.totalPossibleVotes,(vote.totalNoVotes * 100) / vote.totalPossibleVotes);
		}
	}

	function endVote() canRefund returns (bool){
		if (vote.active && ((vote.totalYesVotes / vote.totalPossibleVotes) * 100) > consensusPercent){
			
			VotingOutcome(true, vote.tag);
			vote.active = false;
			if (uint256(vote.tag[0]) == uint256(subject.BUG)) {
				update.bugHunt.foundOne = false;
				update.bugHunt.active = false;
				token.transfer(update.bugHunt.finder, update.bugBounty);

				if (--update.numberOfTries <= 0) {
					update.endTime = now;
					BugHuntEnd(update.id, now);
					UpdateOutcome(false, update.id);
					return;
				}	

				update.price -= update.bugBounty;
				update.endTime = now + BUGEXTENSION;
				BugHuntEnd(update.id, now);
				WasABug(update.id, update.bugHunt.bugId, update.endTime, update.developer, update.numberOfTries);
			} else if (uint256(vote.tag[0]) == uint256(subject.UPDATE)) { 
				startUpdate();
			}	

		} else if (vote.active && now >= vote.endTime || vote.active && ((vote.totalNoVotes / vote.totalPossibleVotes) * 100) > (100 - consensusPercent)) {
			vote.active = false;
			VotingOutcome(false, vote.tag);
				if (uint256(vote.tag[0]) == uint256(subject.UPDATE)) {
					UpdateOutcome(false, update.id);	
				}
				else if (uint256(vote.tag[0]) == uint256(subject.BUG)) {
					WasNotABug(update.id, update.bugHunt.bugId);
		} 
	}

	/*******************REFUND******************/

	
	modifier byCreator(){
		require (msg.sender == creator);
		_;
	}

	modifier canRefund(){
		
		if (contractRefunds){
			
			assert(token.balanceOf(msg.sender) > gasToToken(msg.gas));
			var gasUsed = msg.gas;
		
		}
			_;

		if (contractRefunds){
	
			gasUsed -= msg.gas;
			token.transferFrom(msg.sender, address(this), gasToToken(gasUsed));
			if (!(msg.sender).send(gasUsed * tx.gasprice)){
				Failure(now, "Couldn't refund", uint256(msg.sender));
			} 
			uint256 _balance = this.balance;
			if (_balance < LOWESTETHER) {

				startAuction(weiToToken(ETHERBALANCE = _balance));
			}
		} 
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
