import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewToken2 is BaseToken{


	function NewToken2(
			
		
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

	function redistributeWealth() byCreator {
		
	}

	function borrow() {

	}
}

		
