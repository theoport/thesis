pragma solidity ^0.4.8;

import "./TokenManager.sol";

contract TokenCreator{
	
	event TokenManagerCreated (bytes32 tokenName, address at);
 
	function makeTokenManager(
		uint256 initialSupply, 
		bytes32 name,
		uint256 consensusPercent,		
		uint256[4] issuanceRate,
		bool contractRefunds
		) { 
		TokenManager manager = new TokenManager(initialSupply, name, 
																						consensusPercent, issuanceRate, contractRefunds);
		TokenManagerCreated(name,address(manager));
	}
}
