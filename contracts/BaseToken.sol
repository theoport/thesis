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

	event Debug(uint256 numberOne, uint256 numberTwo, bytes32 stringOne, bytes32 stringTwo);
	
	function getIssuanceRate() constant public returns(uint256[2]){
		return issuanceRate;
	}

	function setSupply(uint256 amount) {
		totalSupply = amount;
	}

	function mint(uint256 amount, address to) byCreator updateSupply {
		if (balances[manager] >= amount) {
			balances[manager] -= amount;
			balances[to] += amount;
		}
	}
	
	modifier byCreator() {
		assert(msg.sender == creator);
		_;
	}

	modifier byManager() {
		assert(msg.sender == manager);
		_;
	}

	modifier updateSupply() {
		if(!limitReached) {
			uint256 daysPassed = (now - creationTime + daysSinceFirstCreation)/ (1 minutes); 
			if (daysPassed > lastUpdate) {

				for (uint i = lastUpdate; i < daysPassed; i++) {

					uint temp = issuanceRate[1] * i + issuanceRate[0];	

					if (temp <= 0) {
						limitReached = true;
						break;
					}

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
				lastUpdate = daysPassed;
			}
		}
		_;
	}

	function initialise(bytes32 _name, uint256[2] _issuanceRate, uint256 _daysSinceFirstCreation, uint256 _upperCap, bool _limitReached, uint256 _lastUpdate, uint256 _noAccountsBlocked, uint256 _totalSupply) byManager {
		assert(!hasBeenInitialised);
		name = _name;
		issuanceRate = _issuanceRate;
		daysSinceFirstCreation = _daysSinceFirstCreation;
		upperCap = _upperCap;
		limitReached = _limitReached;
		lastUpdate = _lastUpdate;
		noAccountsBlocked = _noAccountsBlocked;
		totalSupply = _totalSupply;
		hasBeenInitialised = true;
	}
		
	function kill () byManager {
		selfdestruct(manager);
	}

	function getTotalSupply() constant public returns (uint256) {
		uint256 _totalSupply = totalSupply;

		if(!limitReached) {
			
			uint256 daysPassed = (now - creationTime + daysSinceFirstCreation)/ (1 minutes); 
	
			if (daysPassed > lastUpdate) {
				uint256 temp;
				for (uint256 i = lastUpdate; i < daysPassed; i++) {

					temp = issuanceRate[1] * i + issuanceRate[0];	

					if (temp < 0) {
						break;
					}

					_totalSupply += temp;

					if (_totalSupply >= upperCap) {
						_totalSupply = upperCap;
						break;
					}
				}
				lastUpdate = daysPassed;
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

	function transferToCentral(address from, uint256 value) byManager updateSupply returns (bool success){
		if (balances[from] >= value) {
			balances[from] -=value;
			balances[manager] += value;
		} else {
			return false;
		}
	}

	function emptyAccount(address owner) byManager {
		balances[owner] = 0;
	}

	function add(address account,uint256 amount) byManager {
		balances[account] += amount;
	}
	
	
	function block(address target) byManager {
		blocked[target] = true;
		accountsBlocked[noAccountsBlocked++] = target;
	}

	function unblockAll()	byManager {
		for (uint256 i = 0; i < noAccountsBlocked; i++) {
			blocked[accountsBlocked[i]] = false;
		}
		noAccountsBlocked = 0;
	}
	
	function isBlocked(address account) returns (bool) {
		if (blocked[account] == true) {
			return true;
		} else {
			return false;
		}
	}
			

	function approve(address spender, uint256 value) returns (bool success){
		allowance[msg.sender][spender]=value;
		Approval(msg.sender, spender, value);
		return true;
	}
	function allow(address owner, address spender) constant returns (uint256 remaining){
		return allowance[owner][spender];
	}
}
