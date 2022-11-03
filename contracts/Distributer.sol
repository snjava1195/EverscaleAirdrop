pragma ever-solidity >= 0.35.0;
pragma AbiHeader expire;

contract Distributer {

    uint public static _randomNonce;
	address public static _owner;
	uint128 public static totalAmount;
	bool distributed = false;
	
    constructor() public
	{
	tvm.accept();
	}

    
	function distribute(address[] addresses, uint256[] amounts) public responsible returns (bool, uint256, uint256){
        tvm.accept();
    
	for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(uint128(amounts[i]), false, 1);
		 }
		 distributed = true;
		// uint addrLen = addresses.length;
     
	   return {value: 0, bounce: false, flag: 128} (distributed, totalAmount, addresses.length);
		
	
	}
             
}
