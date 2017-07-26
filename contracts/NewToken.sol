import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseToken{
	
	bytes32 public name;
	address creator;

	function NewToken(
		uint256 initialAmount,
		bytes32 _name
		) {
		balances[msg.sender] = initialAmount;
		totalSupply = initialAmount;
		name = _name;
	}
}
		
