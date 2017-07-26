pragma solidity ^0.4.8;

import "./NewToken.sol";

contract TokenCreator{
	
	event TokenCreated(bytes32 indexed name, address tokenAddress);
	 
	function makeToken(uint256 initialSupply, bytes32 name) returns (address){ 
		NewToken bc = (new NewToken(initialSupply,name));
		TokenCreated(name,address(bc));
		bc.transfer(msg.sender, initialSupply);
		return address(bc);
	}
}
