pragma ever-solidity >= 0.35.0;
pragma AbiHeader expire;

contract Distributer {

	address public static _owner;
	uint128 public static totalAmount;
	uint public static _randomNonce;
	constructor() public
	{
	tvm.accept();
	}
	function distribute(address[] addresses, uint128[] amounts) public view responsible returns (address, bool){
		require(address(this).balance>totalAmount, 105);
	    tvm.accept();
		bool distributed = false;
		//require(address(this).balance > total_amount + required_fee, 105);
		for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(amounts[i], false, 1);
		 }
		 distributed = true;
		 //Status status = Status(distributed, address(this));
		 return {value: 0, bounce: false, flag: 64} (address(this), distributed);
	
	}
	 function refund() public view responsible returns (bool)   {
	 	bool refunded = false;
        	payable(_owner).transfer(0, false, 128);
        	refunded = true;
        	return {value: 0, bounce: false, flag: 64} refunded;
         }

         

}





