pragma solidity ^0.4.8;

import "./TokenManager.sol";

contract TokenCreator{
	
		event TokenManagerCreated (bytes32 tokenName, address tokenManagerAddress, address tokenAddress, address creator, uint creationTime);
 
	function makeTokenManager(
		uint256 initialSupply, 
		bytes32 name,
		uint256 consensusPercent,		
		uint256[2] issuanceRate,
		uint256 upperCap,
		bool contractRefunds
		) payable { 
		TokenManager manager = new TokenManager(initialSupply, name, 
																						consensusPercent, issuanceRate, upperCap, contractRefunds);


		if (!(address(manager).send(msg.value))){
			throw;
		}
	
		TokenManagerCreated(name, address(manager), manager.getTokenAddress(), tx.origin, manager.getTokenCreationTime());
	}
}
