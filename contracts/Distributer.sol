pragma ever-solidity >= 0.35.0;
pragma AbiHeader expire;

contract Distributer {

	uint public static _randomNonce;
	address public static _owner;
	constructor() public
	{
	tvm.accept();
	}
	function distribute(address[] addresses, uint128[] amounts) public pure responsible returns (uint128)
	{
		for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(amounts[i], false, 1);
		 }
		 return {value: 0, bounce: false, flag: 64} amounts[addresses.length-1];
	}






}
