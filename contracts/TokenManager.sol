import "./NewToken.sol"

pragma solidity ^0.4.8;

contract TokenManager {

	 
	/* Constants that are set permanently at deployment of contract.
	Could also make it possible to set them after deployment, but
	would have to require further voting, as otherwise too much 
	trust is put in the hands of the creator.*/

	uint256 constant PARAMETERS = 4;
	uint256 constant INFOS = 3;
	uint256 constant BUGEXTENSION = 3 days;
	uint256 constant INSECTHUNT = 1 days;
	uint256 constant NOTICETIME = 1 days;
	uint256 constant BOUNTYHUNT = 1 days;

	enum subject{UPDATE, BUG}; 
	uint256 private etherBalance; // etherbalance to which the contract refuels itself
	address public tokenAddress;	// address of the token managed by this contract
	uint256 private consensusPercent;	// percentage required for any vote to succeed
	uint256 private initialAmount;	// initial amount of token
	uint256[PARAMETERS] private issuanceRate;	// how fast should the token be issued, if at all
	bool private contractRefunds;	// does the contract refund, can be updated
	uint256 public version = 1;	// version number of token
	uint256 auctionDuration;	// duration of refuelling auction
	uint256 voteDuration;	// duration of vote
	uint256 hourPriceRatio; //ratio of how much time developer gets per unit token price
	Vote vote = Vote({id:0, voteCount:0});	
	Auction auction = Auction({id:0});
	Update update = Update({version:1});
	BountyCompetition bountycompetition;

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
		uint256 totalVotes;
		uint256 totalPossibleVotes;
		uint256 startTime;
		uint256 endTime;
		uint256 id;
		mapping (uint256 => address) accountsThatVoted;
		uint256 voteCount;
		uint256[INFOS] tag;
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
	
	/* InsectHunt represents the time phase after a developer submitted the upgraded token 
	contract, in which anyone can search for bugs. If one is found, the hash of its description
	is logged and the finder is rewarded a price in token once the community has voted that this 
	is indeed a bug. The price for finding a bug is deducted from the reward for the upgraded contract,
	as otherwise developer and bug-hunter can cooperate to make more money.*/
 
	struct InsectHunt {
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
		uint256 descriptionHash;
		uint256 bugBounty;
		uint256 timeWindow;
		uint256 version;
		bytes32 name;
		address developer;
		uint256 price;
		bool active;
		uint256 startTime;
		uint256 endTime;
		InsectHunt insectHunt;
		address updatedContract;
	}
		
	event TokenCreated(bytes32 name, address at);
	event VoteScheduled(uint256 time, uint256 id, uint256[INFOS] tag);
	event VotingOutcome(bool success, uint256 id);
	event NewHighestBid(address sender, uint256 amount, uint256 auctionId);
	event AuctionEnd(uint256 id, address winner, uint256 price);
	event Failure(uint256 time, bytes32 message);
	event NewBountyPrice(uint256 amount, address bidder, uint256 updateVersion);
	event BountyEnded(address winner, uint256 price, uint256 version); 
	event BountyStarted(uint256 updateVersion, uint256 descriptionHash, uint256 name);
	event Bugfound(address by, uint256 updateVersion, uint256 bugId, uint256 descriptionHash);
	event AuctionStarted(uint256 startTime, uint256 id, uint256 amount);

	//Constructor, creates new token

	function TokenManager(
		uint256 _initialAmount, 
		uint256 _issuanceRate, 
		bytes32 _name, 
		uint256 _consensusPercent,
		uint256[PARAMETERS] _issuanceRate,
		bool _contractRefunds
	) {
		creationTime = now;
		etherBalance = msg.value;
		initialAmount = _initialAmount;
		issuanceRate = _issuanceRate;
		consensusPercent = _consensusPercent;
		issuanceRate = _issuanceRate;
		contractRefunds = _contractRefunds;
		version = 1;
		token = address(new NewToken(_initialAmount, _name));
		TokenCreated(_name, token);
		}

	function getTokenAddress() returns (address) {return token;}
	/**************BOUNTYHUNT***********/

	/* This function can be called by anyone, but should only really be called
	when there is enough interest exists for an update. Think about solution.
	It sets the udpate version number, name and description and logs it for future
	referral. After the bounty is started, anyone can compete for the job for the 
	specified amount of time.*/

	function startBounty (uint256 _descriptionHash, bytes32 _name)public{
		require (!bountyCompetition.active && !update.active);
		bountyCompetition.active = true;
		bountyCompetition.startTime = now;
		bountyCompetition.endTime = bountyCompetition.startTime + BOUNTYHUNT;
		update.descriptionHash = _descriptionHash;
		update.name = _name;
		update.version++;
		BountyStarted(update.version, update.descriptionHash, update.name);
	}

	/* Lets anyone bid for bounty, if one is active. Frontend takes care of 
	making sure people know what they're voting for, but contract will also log
	a bid alongside the update id for future referral */
		
	function bidForBounty (amount256 price)public {
		assert(now >= bountyCompetition.startTime && now <= bountyCompetition.endTime);
		if (price < bestPrice) {
			bountyCompetition.bestPrice = price;
			bountyCompetition.bidder = msg.sender;
			NewBountyPrice(price, msg.sender, update.version); 
		}
	}
	
	/* Function ends bounty, can be called by anyone as long as time is over and 
	it hasn't been ended already. Goes straight into starting a vote for the update. */

	function endBounty ()public{
		assert(bountyCompetition.active);
		assert(now >= bountyCompetition.endTime);
		bountyCompetition.active = false;
		BountyEnded(bountyCompetition.bidder, bountyCompetition.bestPrice, update.version);
		voteOnUpdate(bountyCompetition.bidder, bountyCompetition.bestPrice);
	}
			

	/**************UPDATE TOKEN**************/

	/* Function to signal you found a bug, submits description hash, 
	and immediately starts a vote on whether it is a bug or not.*/
	

	function foundBug (uint256 _descriptionHash) public {
		assert(update.insectHunt.active);
		if (update.insectHunt.foundOne) {
			Failure(now, "Someone else has already found a bug", update.version);
			return;
		}
		update.insectHunt.foundOne = true;
		update.insectHunt.descriptionHash = _descriptionHash;
		update.insectHunt.finder = msg.sender;
		//IS IT REALLY A BUG?	GIVE TIME FOR BUG FINDER AND DEVELOPER TO DISCUSS
		update.endTime += NOTICETIME;	
		update.insectHunt.id++;
		BugFound(msg.sender, update.version, update.insectHunt.id, _descriptionHash);
		startVote([BUG, update.version, update.insectHunt.id]);
	}

	/* Starts a vote on the update and adds tag to vote, also adds developer and price to update struct
	and calculates the timewindow. Sets update to active already so noone can start 
	a new bountyhunt. Can't be called by anyone but this contract*/

	function voteOnUpdate (address _developer, uint256 _price) internal {
		require (!update.active);
		update.developer = _developer;
		update.price = _price;
		update.timeWindow = _price * hourPriceRatio hours;
		update.active = true;
		startVote([tag.UPDATE, update.version, 0]);
	}
	
	/* If vote is successfull, start update, can only be called by this contract */

	function startUpdate () internal{
		update.insectHunt.id = 0;
		update.startTime = now;
		update.endTime = update.startTime + update.timeWindow;
	}

	/* Function to submit an update, must be sent by developer before end of time window.
	Starts bughunt and sets address of possible new contract. js can then check if contracts
	match.*/
	
	function submitUpdate (address _updatedContract) public{
		assert (update.developer = msg.sender);
		assert(now <= update.endTime);
		update.insectHunt.active = true;
		update.endTime = now + INSECTHUNT;
		update.updatedContract = _updatedContract;
	}

	/* If no bugs are found, time passes and anyone can finalise the update, sending the 
	price to the developer. */	

	function finaliseUpdate() public {
		assert(update.active && now >= update.endtime);
		token.transfer(update.price, update.developer);
		token = update.updatedContract;
		version = update.version;
		update.active = false;
	}

	/*****************REFUEL***************/
	
	function startAuction(uint256 amountOfToken) {
		auction.amount = amountOfToken;
		auction.startTime = now;
		auction.endTime = auction.startTime + auctionDuration;
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
			returnBids[highestBidder] += highestBid;
		}
		highestBidder = msg.sender;
		highestBid = msg.value;		
		NewHighestBid(msg.sender, msg,value, auction.id);
	}		

	function withdrawReturnedBid() returns (bool) {
		if (returnBids[msg.sender] > 0)	{
			var temp = returnBids[msg.sender];
			returnBids[msg.sender] = 0;
			if (!msg.sender.send(temp)) {
				returnBids[msg.sender] = temp;
				return false;
			}
			return true;
		}
	}
		
	function endAuction(){
		assert(auction.active);
		assert(now >= auction.endTime);
		auction.active = false;
		if (!(token.transfer(auction.amount, auction.highestBidder)) {
			returnedBids[highestBidder] += highestBid;
			Failure(now, "Ending auction failed", auction.id);
			return;
		}
		AuctionEnd(Auction.id, Auction.highestBidder, Auction.highestBid);
	}
		
		
	/******************VOTE*********************/
	
	function startVote(uint256[INFOS] _tag){
		assert(!vote.active);
		vote.totalPossibleVotes = token.totalSupply() - token.getBalance(address(this));
		vote.active = true;
		vote.startTime = now;
		vote.endTime = vote.startTime + voteDuration;
		vote.id++;
		vote.tag = _tag;
		VoteScheduled(vote.id, vote.startTime, _tag); 
	}
	
	function vote() canRefund returns (bool){
		assert();
		if (now >= startTime && now <= endTime ) {
			vote.totalVotes += token.balanceOf(msg.sender);
			token.block(msg.sender);
			return true;
		}
		return false;
	}

	function endVote() canRefund returns (bool){
		if (vote.active && (totalVotes / totalPossibleVotes) > consensusPercent){
			
			VotingOutcome(true, vote.id);
			vote.active = false;
			switch(vote.tag[0]){
				case (subject.BUG):
					update.insectHunt.foundOne = false;
					update.insectHunt.active = false;
					token.transfer(update.insectHunt.finder, bugBounty);
					update.price -= bugBounty;
					update.endTime =  now + BUGEXTENSION days;
					break;
				case (subject.UPDATE):
					startUpdate();	
					break;
			return true;
			
		} else if (vote.active && now >= vote.endTime {
			vote.active = false;
			VotingOutcome(false, vote.id);
			return true;
		} 
		return false;
	}

	/*******************REFUND******************/

	modifiers canRefund(uint256 amount, uint exchange, bool largerThan){
		
		if (contractRefunds){
			
			assert(token.balanceOf(msg.sender) > gasToToken(msg.gas, exchange, largerThan));
			var gasUsed = msg.gas;
		
		}
			_;

		if (contractRefunds){
	
			gasUsed -= msg.gas;
			token.transferFrom(msg.sender, address(this), gasToToken((gasUsed, exchange, largerThan));
			(msg.sender).send(gasUsed * tx.gasprice);

		}
	}


	//should probably be done frontend;
	function gasToToken(uint256 amount, uint256 exchange, bool largerThan) constant returns (uint256){
		return weiToToken(amount, exchange, largerThan) * tx.gasprice;
	}

	
	function weiToToken(uint256 amount, uint256 exchange, bool largerThan) constant returns (uint256){
		
		if (largerThan == true){
			return (amount) / (exchange / 100);
		}
		else if (largerThan == false){
			return (amount * exchange ) / 100;
		}
	}
