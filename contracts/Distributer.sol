pragma ever-solidity >= 0.35.0;
pragma AbiHeader expire;

contract Distributer {

	uint public static _randomNonce;
	address public static _owner;
	
	constructor() public
	{
	tvm.accept();
	}
	function distribute(address[] addresses, uint128[] amounts) public pure responsible returns (bool)
	{
		bool distributed = false;
		//require(address(this).balance > total_amount + required_fee, 105);
		for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(amounts[i], false, 1);
		 }
		 distributed = true;
		 return {value: 0, bounce: false, flag: 64} distributed;
	}
	
	 function refund(address refund_destination) public view responsible returns (bool)   {
	 	bool refunded = false;
        	payable(refund_destination).transfer(0, false, 128);
        	refunded = true;
        	return {value: 0, bounce: false, flag: 64} refunded;
         }






}
