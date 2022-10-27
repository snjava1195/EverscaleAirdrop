pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;

//Contract interface file

interface IStorage {
	function getCreditLimit() external;
}

interface IStorageUser {
	function setCreditLimit(uint128[] amounts) external;
	
}
