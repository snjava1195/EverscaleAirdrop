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

    
	function distribute(address[] addresses, uint128[] amounts) public responsible returns (address, bool){
        tvm.accept();
    
            
	for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(amounts[i], false, 1);
		 }
		 distributed = true;
     
	   return {value: 0, bounce: false, flag: 128} (address(this), distributed);
		
	
	}
             
}