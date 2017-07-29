pragma solidity ^0.4.8;

import "./NewToken.sol";

contract TokenCreator{
	
	uint256 constant PARAMETERS = 4;
	
	event TokenManagerCreated (bytes32 tokenName, address at);
 
	function makeTokenManager(
		uint256 initialSupply, 
		uint256 issuanceRate,
		bytes32 name,
		uint256 consensusPercent,		
		uint256[NOPARAMETERS] issuanceRate,
		bool contractRefunds
		) { 
		TokenManager manager = new TokenManager(initialSupply, issuanceRate, name, 
																						consensusPercent, issuanceRate, contractRefunds);
		TokenManagerCreated(name,address(manager));
	}
}
