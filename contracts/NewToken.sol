import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseToken{
	
	bytes32 public name;
	address manager;

	function NewToken(
		uint256 _initialAmount,
		bytes32 _name,
		uint256[2] _issuanceRate,
		uint256 _upperCap
		) {
		manager = msg.sender;
		balances[address(this)] = _initialAmount;
		creationTime = 0;
		totalSupply = _initialAmount;
		name = _name;
		issuanceRate = _issuanceRate;
		upperCap = _upperCap;
	}
}
		
