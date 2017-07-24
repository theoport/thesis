import "./BaseCoin.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseCoin{
	
	bytes32 public name;

	function NewToken(
		uint256 initialAmount,
		bytes32 _name
		) {
		balances[msg.sender] = initialAmount;
		totalSupply = initialAmount;
		name = _name;
	}
}
		
