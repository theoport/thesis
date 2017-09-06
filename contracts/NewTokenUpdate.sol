import "./BaseToken.sol";

pragma solidity ^0.4.8;

contract NewTokenUpdate is BaseToken{

	function NewTokenUpdate(address _manager, uint256 lastCreationTime, uint256 _daysSinceFirstCreation){
		manager = _manager;
		creationTime = now;
		daysSinceFirstCreation = creationTime - lastCreationTime + _daysSinceFirstCreation; 
	}
}
