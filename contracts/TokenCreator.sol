pragma solidity ^0.4.8;

import "./TokenManager.sol";

contract TokenCreator{
	
		event TokenManagerCreated (bytes32 tokenName, address tokenManagerAddress, address tokenAddress, address creator, uint creationTime);
		event TellTheTime(uint time);
 
	function makeTokenManager(
		uint256 initialSupply, 
		bytes32 name,
		uint256 consensusPercent,		
		uint256[2] issuanceRate,
		uint256 upperCap,
		bool contractRefunds
		) { 
		TellTheTime(now);
		TokenManager manager = new TokenManager(initialSupply, name, 
																						consensusPercent, issuanceRate, upperCap, contractRefunds);
	
		TokenManagerCreated(name, address(manager), manager.getTokenAddress(), tx.origin, manager.creationTime());
	}
}
