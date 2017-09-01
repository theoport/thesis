import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken is BaseToken{


	function NewToken(
		uint256 _initialAmount,
		bytes32 _name,
		uint256[2] _issuanceRate,
		uint256 _upperCap,
		address _creator
		) {
		daysSinceFirstCreation = 0;
		creator = _creator;
		manager = msg.sender;
		balances[address(msg.sender)] = _initialAmount;
		totalSupply = _initialAmount;
		creationTime = now;
		name = _name;
		issuanceRate = _issuanceRate;
		upperCap = _upperCap;
		hasBeenInitialised = true;
	}
}
		
