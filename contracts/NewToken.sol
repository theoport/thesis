import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseToken{
	
	bytes32 public name;
	address manager;

	function NewToken(
		uint256 _initialAmount,
		bytes32 _name,
		uint256[2] _issuanceRate,
		uint256 _upperCap,
		uint256 _creationTime
		) {
		manager = msg.sender;
		balances[address(msg.sender)] = _initialAmount;
		totalSupply = _initialAmount;
		creationTime = _creationTime;
		name = _name;
		issuanceRate = _issuanceRate;
		upperCap = _upperCap;
	}
}
		
