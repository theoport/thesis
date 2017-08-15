pragma solidity ^0.4.8;

import "./TokenManager.sol";

contract TokenCreator{
	
		event TokenManagerCreated (bytes32 tokenName, address tokenManagerAddress, address tokenAddress, address creator);
//		event TokenManagerCreated (bytes32 tokenName, address tokenManagerAddress);
 
	function makeTokenManager(
		uint256 initialSupply, 
		bytes32 name,
		uint256 consensusPercent,		
		uint256[2] issuanceRate,
		uint256 upperCap,
		bool contractRefunds
		) { 
		TokenManager manager = new TokenManager(initialSupply, name, 
																						consensusPercent, issuanceRate, upperCap, contractRefunds);
	
		TokenManagerCreated(name, address(manager), manager.getTokenAddress(), tx.origin);
//		TokenManagerCreated(name,address(manager));
	}
}
