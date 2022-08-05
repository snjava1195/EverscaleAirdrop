pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;

//Contract used for airdrop of evers
contract EverAirdrop {

  
    uint48 [] timeStamps;
    address[] addresses;
    uint128[] amounts;
    address refund_destination;
    uint256 refund_lock_duration_end;
    bool distributed = false;
    uint total_amount = 0;
    uint required_fee = 1000000000; 
    uint128 private transferGas = 0.8 ever;
    
    // 1 TON should be enough for any possible fees
    // The rest of the balance can always be refunded
    // Checks whether the contract has enough evers for airdrop along with the sending fee  
    modifier balanceSufficient {
        require(address(this).balance > total_amount + required_fee, 105);
        tvm.accept();

        _;
    }
    
    // Checks the status of the contract, if distributed is false, distribute() method can be triggered, otherwise not
    modifier distributedStatus(bool status) {
        require(distributed == status, 108);
        tvm.accept();

        _;
    }

    // Checks whether refund lock time has passed and distribution is over
    modifier refundLockPassedOrDistributionIsOver() {
        require((distributed == true) || (now > refund_lock_duration_end), 107);
        tvm.accept();

        _;
    }
   
    constructor(
        address _refund_destination,
        address[] _addresses,
        uint128[] _amounts,
        uint256 _refund_lock_duration
    ) public {
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();
	
        addresses = _addresses;
        amounts = _amounts;
        refund_destination = _refund_destination;
        refund_lock_duration_end = now + _refund_lock_duration;
	
	//calculates total amount to be sent based on the amounts from the list
        for (uint i=0; i < amounts.length; i++) {
            total_amount += amounts[i];
        }
    }
    
    /**
     * @dev Distributes contract balance to the receivers from the addresses if there is enough gas on the contract and no other distribution is triggered from this contract
    */
    function distribute() balanceSufficient distributedStatus(false) public {
    	//another airdrop can't be triggered until this one ends
        distributed = true;
        //transfer amounts[i] evers to addresses[i] address from this contract
        for (uint i=0; i < addresses.length; i++) {
            payable(addresses[i]).transfer(amounts[i], false, 1);

        }
        // transfer is done, another airdrop can start
       // distributed = false;
   }               	          
                  	       

     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after
     *      1. Refund lock passed
     *      2. Distribution finished
     */
    
    function refund() refundLockPassedOrDistributionIsOver public view {
        payable(refund_destination).transfer(0, false, 128);
    }
    
     function get_required_amount() external view returns(uint) {
        return total_amount + required_fee;
    }
 }
