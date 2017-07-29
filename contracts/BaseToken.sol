import "./ERC20Standard.sol";

pragma solidity ^0.4.8;

contract BaseToken is ERC20Standard{

	mapping (address => uint256) balances;
	mapping (address  => mapping (address => uint256)) allowance;
	mapping (address => bool) blocked;
	mapping (uint256 => address) accountsBlocked;
	
	function balanceOf(address owner) constant returns (uint256 balance){
		balance = balances[owner];
	}

	function transfer(address to, uint256 value) returns (bool success){
		if (balances[msg.sender] < value){
			return false;
		}
		/*DO I NEED A MUTEX HERE?*/
		balances[to]+=value;
		balances[msg.sender]-=value;
		return true;
	}

	function transferFrom(address from, address to, uint256 value) returns (bool success){
		if (balances[from] >= value && allowance[from][msg.sender] >= value){
			balances[from] -= value;
			balances[to] += value;
			allowance[from][msg.sender] -= value;
			Transfer(from, to, value);
			return true;
		} else {return false;}
	}
	
	function block(address target) {
		blocked[target] = true;
		accountsBlocked[noAccountsBlocked] = target;
		noAccountsBlocked++;
	}

	function unblockAll()	{
		for (uint256 i = 0; i < noAccountsBlocked; i++) {
			blocked[accountsBlocked[i]] = false;
		}
		noAccountsBlocked = 0;
	}

	function approve(address spender, uint value) returns (bool success){
		allowance[msg.sender][spender]=value;
		Approval(msg.sender, spender, value);
		return true;
	}
	function allow(address owner, address spender) constant returns (uint256 remaining){
		return allowance[owner][spender];
	}
}	
