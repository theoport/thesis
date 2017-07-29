import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseToken{
	
	bytes32 public name;
	address manager;

	function NewToken(
		uint256 initialAmount,
		bytes32 _name
		) {
		manager = msg.sender;
		balances[tx.origin] = initialAmount;
		totalSupply = initialAmount;
		name = _name;
	}
}
		
