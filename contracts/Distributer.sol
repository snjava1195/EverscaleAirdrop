pragma ever-solidity >= 0.35.0;
pragma AbiHeader expire;

contract Distributer {

    uint public static _randomNonce;
	address public static _owner;
	uint128 public static totalAmount;
	bool distributed = false;
	string forLoopResult;
	constructor() public
	{
	tvm.accept();
	}
	function distribute(address[] addresses, uint128[] amounts) public responsible returns (address, bool){
		//require(address(this).balance>totalAmount, 105);
        tvm.accept();
        
        if (address(this).balance>totalAmount) {
            
		//require(address(this).balance > total_amount + required_fee, 105);
		for(uint i=0;i<addresses.length;i++)
		{
		 payable(addresses[i]).transfer(amounts[i], false, 1);
		 }
		 distributed = true;
		 //Status status = Status(distributed, address(this));
		 forLoopResult = "first";
        } else {
            distributed = false;
             forLoopResult = "second";
            selfdestruct(address(this));
            refund();

        }

       
	   return {value: 0, bounce: false, flag: 128} (address(this), distributed);
		
	
	}
	 function refund() public view responsible returns (bool)   {
	 	bool refunded = false;
        	payable(_owner).transfer(0, false, 128);
        	refunded = true;
        	return {value: 0, bounce: false, flag: 64} refunded;
         }
        function testFunc() public responsible returns(string){
            string input;
            if (forLoopResult == "first") {
                input = forLoopResult;
            } else {
                input = forLoopResult;
            }
            return { value: 0, bounce: false, flag: 64 } input;
        }


          function getBalance()public pure responsible returns(uint){
            tvm.accept();
            uint distributorBalance = address(this).balance;
           return { value: 0, bounce: false, flag: 64 } distributorBalance;
          } 
          
          function getDistributed() public view returns(bool)
          {
          	return distributed;
          }

}





