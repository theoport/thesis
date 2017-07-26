import "./NewToken.sol"

pragma solidity ^0.4.8;

contract TokenManager {

	uint256 constant PARAMETERS = 7;
	address token;
	uint256 private consensusPercent;
	uint256 private initialAmount;
	uint256[PARAMETERS] private issuanceRate;
	bool private contractRefunds;
	uint256 private version;

	struct Vote{
		bool active;
		uint256 totalVotes;
		uint256 totalPossibleVotes;
		uint256 startTime;
		uint256 endTime;
		uint256 id;
	}

	
	event TokenCreated(bytes32 name, address at);
	event VotingOutcome(bool success, uint256 id);

	function TokenManager(
		uint256 _initialAmount, 
		uint256 _issuanceRate, 
		bytes32 _name, 
		uint256 _consensusPercent,
		uint256[PARAMETERS] _issuanceRate,
		bool _contractRefunds
	) {
		initialAmount = _initialAmount;
		issuanceRate = _issuanceRate;
		consensusPercent = _consensusPercent;
		issuanceRate = _issuanceRate;
		contractRefunds = _contractRefunds;
		version = 1;
		token = address(new NewToken(_initialAmount, _name));
		TokenCreated(_name, address(token));
		}

	function sellMyTokens

	
	function startUpdateVote(uint256 startTime, uint256 duration, bytes32 name){
		Vote.totalPossibleVotes = token.totalSupply() - token.getBalance(address(this));
		assert(startTime > now);
		Vote.startTime = startTime;
		Vote.endTime = startTime + duration;
		Vote.id = id;
	}
	
	function voteForUpdate() canRefund returns (bool){
		if (now >= startTime && now <= endTime ) {
			Votes.totalVotes += token.balanceOf(msg.sender);
			token.block(msg.sender);
			return true;
		}
		return false;
	}

	function endUpdateVote() canRefund returns (bool){
		if (now < Vote.endTime || !Vote.active) {
			return false;
		}
		Vote.active = false;
		if ((totalVotes / totalPossibleVotes) > consensusPercent){
			VotingOutcome(true, Vote.id);
		} else {
			VotingOutcome(false, Vote.id);
		}
	}

	function auction()
	
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

	function gasToToken(uint256 amount, uint256 exchange, bool largerThan) constant returns (uint256){
		
		if (largerThan == true){
			return (amount * tx.gasprice) / (exchange / 100);
		}
		else if (largerThan == false){
			return (amount * tx.gasprice * exchange ) / 100;
		}
	}

		
