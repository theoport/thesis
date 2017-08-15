pragma solidity ^0.4.8;

/*ERC20 standard:*/

contract ERC20Standard{
	
	uint256 public totalSupply;

	function balanceOf(address owner) constant returns (uint256 balance);
	function transfer(address to, uint256 value) returns (bool success);
	function approve(address spender, uint value) returns (bool success);
	function allow(address owner, address spender) constant returns (uint256 remaining);
	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(address indexed owner, address indexed spender, uint256 value);

}

