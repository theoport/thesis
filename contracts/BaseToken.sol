/*This contract forms the base of the token and contains all the functions that are required
by the TokenManager to operate correctly. New updated tokens must inherit from this contract,
which should not be changed.*/ 

import "./ERC20Standard.sol";

pragma solidity ^0.4.8;

contract BaseToken is ERC20Standard{

	uint256 public noAccountsBlocked = 0;
	uint256[2] public issuanceRate;
	uint256  public lastUpdate = 0;
	uint256 public creationTime;
	uint256 public upperCap;
	bool public limitReached = false;
	bytes32 public name;
	address public manager;
	address public creator;

	
	bool public hasBeenInitialised; 
	uint256 public daysSinceFirstCreation;
	
	mapping (address => uint256) balances;
	mapping (address  => mapping (address => uint256)) allowance;
	mapping (address => bool) blocked;
	mapping (uint256 => address) accountsBlocked;

	
	function getIssuanceRate() constant public returns(uint256[2]){
		return issuanceRate;
	}

	/*Let's the creator mint tokens from the tokenmanager contract.
	*/

	function mint(uint256 amount, address to) byCreator updateSupply {
		if (balances[manager] >= amount && !blocked[manager]) {
			balances[manager] -= amount;
			balances[to] += amount;
		}
	}

	/*Function to intialise state after update has been submitted,
	which must inherit from this contract.*/

	function initialise(address _creator, bytes32 _name, uint256[2] _issuanceRate, uint256 _upperCap, bool _limitReached, uint256 _lastUpdate, uint256 _noAccountsBlocked, uint256 _totalSupply) byManager {
		assert(!hasBeenInitialised);
		creator = _creator;
		name = _name;
		issuanceRate = _issuanceRate;
		upperCap = _upperCap;
		limitReached = _limitReached;
		lastUpdate = _lastUpdate;
		noAccountsBlocked = _noAccountsBlocked;
		totalSupply = _totalSupply;
		hasBeenInitialised = true;
	}
		
	/*Function to kill contract after new contract was submitted.
	Can only be done by manager*/

	function kill () byManager {
		selfdestruct(manager);
	}

	/*Returns the total supply of token, without updating balances.*/

	function getTotalSupply() constant public returns (uint256) {

		uint256 _totalSupply = totalSupply;

		if(!limitReached) {
			
			uint256 daysPassed = (now - creationTime + daysSinceFirstCreation); 
	
			if (daysPassed > lastUpdate) {
				uint256 temp;
				for (uint256 i = lastUpdate; i < daysPassed; i++) {

					temp = issuanceRate[1] * i + issuanceRate[0];	

					if (temp < 0) {
						if (issuanceRate[1] <= 0) {
							break;
						}
					} else {

						_totalSupply += temp;

						if (_totalSupply >= upperCap) {
							_totalSupply = upperCap;
							break;
						}
					}
				}
			}
		}
		return _totalSupply;
	}
	
	function balanceOf(address owner) constant returns (uint256 balance){
		balance = balances[owner];
	}

	function transfer(address to, uint256 value) updateSupply returns (bool success){
		if (balances[msg.sender] < value || blocked[msg.sender] || blocked[to]){
			return false;
		}
		balances[to]+=value;
		balances[msg.sender]-=value;
		return true;
	}

	function transferFrom(address from, address to, uint256 value) updateSupply returns (bool success){
		if (balances[from] >= value && allowance[from][msg.sender] >= value){
			balances[from] -= value;
			balances[to] += value;
			allowance[from][msg.sender] -= value;
			Transfer(from, to, value);
			return true;
		} else {return false;}
	}

	/*TokenManager always has right to take funds from accounts,
	is needed for the refund function.*/

	function transferToCentral(address from, uint256 value) byManager updateSupply returns (bool success){
		if (balances[from] >= value) {
			balances[from] -=value;
			balances[manager] += value;
		} else {
			return false;
		}
	}

	/*Lets tokenmanager empty an account for change over period,
	in which users transfer funds from old contract to new contract*/

	function emptyAccount(address owner) byManager {
		balances[owner] = 0;
	}
	
	/*Lets the manager add funds to accounts in new update.*/

	
	function add(address account,uint256 amount) byManager {
		balances[account] += amount;
	}
	
	/*Lets the manager block account to secure their vote.*/
	
	function block(address target) byManager {
		blocked[target] = true;
		accountsBlocked[noAccountsBlocked++] = target;
	}

	/*Lets the manager unblock all accounts after vote is finished.*/

	function unblockAll()	byManager {
		for (uint256 i = 0; i < noAccountsBlocked; i++) {
			blocked[accountsBlocked[i]] = false;
		}
		noAccountsBlocked = 0;
	}
	
	function isBlocked(address account) returns (bool) {
		return blocked[account];
	}
			
	/*User can allow another user to spend funds on their behalf.*/

	function approve(address spender, uint256 value) returns (bool success){
		allowance[msg.sender][spender]=value;
		Approval(msg.sender, spender, value);
		return true;
	}

	/*Checks amount that spender can spend on behalf of owner.*/
	function allow(address owner, address spender) constant returns (uint256 remaining){
		return allowance[owner][spender];
	}
	
	/*---modifiers---*/
	
	modifier byCreator() {
		assert(msg.sender == creator);
		_;
	}

	modifier byManager() {
		assert(msg.sender == manager);
		_;
	}

	/*Updates total supply of token. Equivalent to issuing 
	the token, but it is done passively.*/

	modifier updateSupply() {

		if(!limitReached) {
			uint256 daysPassed = (now - creationTime + daysSinceFirstCreation); 
			if (daysPassed > lastUpdate) {

				for (uint i = lastUpdate; i < daysPassed; i++) {

					uint temp = issuanceRate[1] * i + issuanceRate[0];	

					if (temp <= 0) {
						if (issuanceRate[1] <= 0) {
							limitReached = true;
							break;
						}
					} else {

						balances[manager] += temp;
						totalSupply += temp;

						if (totalSupply >= upperCap) {
							uint previous = totalSupply;
							totalSupply = upperCap;
							balances[manager] -= (previous - totalSupply);
							limitReached = true;
							break;
						}
					}
				}
				lastUpdate = daysPassed;
			}
		}
		_;
	}
}
