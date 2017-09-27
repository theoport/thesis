
import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewTokenUpdate is BaseToken{


	function NewTokenUpdate(
		address _manager
		) {
		manager = _manager;
		creationTime = now;
	}
	
	function lendingSystem(uint256 from, uint256 to, uint256 time) public {

	}
}
		

