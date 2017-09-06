/*This contract is updatable and should be used to implement new token methods.
The constructor should be changed by the update developer as only the manager address,
creation time, and days since forst creation of the token should be set by the update
developer. All other parameters are synchronized by the TokenManager once an update is
approved.*/



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
		
