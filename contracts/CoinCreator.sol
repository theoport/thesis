pragma solidity ^0.4.8;

import "./NewToken.sol";

contract CoinCreator{
	
	event CoinCreated(bytes32 indexed name, address coinAddress);
	 
	function makeNewCoin(uint256 initialSupply, bytes32 name) returns (address){ 
		NewToken bc = (new NewToken(initialSupply,name));
		CoinCreated(name,address(bc));
		bc.transfer(msg.sender, initialSupply);
		return address(bc);
	}
	
}
