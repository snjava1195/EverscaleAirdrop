pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "Distributer.sol";
//Contract used for airdrop of evers
contract EverAirdrop {
    address refund_destination;
    address addr;
    uint256 refund_lock_duration_end;
    bool distributed = false;
    uint128 total_amount = 0;
    uint128 required_fee = 0.5 ever; 
    uint public static _randomNonce;
    bool[] statusArray;
    uint public nonce = 1;
    address[] public deployedContracts;
    address[] distributeAddresses;
    TvmCell public stateInit;
    string public contract_notes;
    uint counter=0;
    bool[] refunded;
    uint refundCounter=0;
    struct Status{
		bool distributed;
		address contractAddress;
	}
  
   //Modifier that allows public function to accept external calls only from contract owner
     modifier checkOwnerAndAccept{
     	require(msg.pubkey() == tvm.pubkey() , 102);
     	tvm.accept();
     	_;
    }
    
    Status[] distributed_status;
     
    // 1 ever should be enough for any possible fees
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
    modifier refundLockPassed() {
        require(now > refund_lock_duration_end, 107);
        tvm.accept();

        _;
    }
   
   //_contract_notes - name of the contract
   //_refund_destination - address where the remaining gas will be transfered after airdrop
   //_refund_lock_duration - duration for which the user will have to wait until the refund can be called
    constructor(
        string _contract_notes,
        address _refund_destination,
        uint256 _refund_lock_duration
    ) public {
        require(msg.pubkey() == tvm.pubkey(), 106);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();
        contract_notes = _contract_notes;
        refund_destination = _refund_destination;
        refund_lock_duration_end = now + _refund_lock_duration;


    }

    /**
     * @dev Distributes contract balance to the receivers from the addresses if there is enough gas on the contract. If it is first distribution with up to 100 addresses, airdrop is the sender, if not, Distributer contracts are deployed and their distribution method is triggered
    */
    function distribute(address[] _addresses, uint128[] _amounts, int8 _wid, TvmCell _code) /*balanceSufficient*/ public {
    
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
    	if(counter==0)
    	{
    	//another airdrop can't be triggered until this one ends
    	//transfer amounts[i] evers to addresses[i] address from this contract
    		for (uint i=0; i < _addresses.length; i++) {
            		payable(_addresses[i]).transfer(_amounts[i], false, 1);
            	}
       
        	distributed = true;
        }
        
        if(counter!=0)
        {
        	for (uint i=0; i < _amounts.length; i++) {
            		total_amount += _amounts[i];
            	}
            	uint128 _initialBalance = total_amount + required_fee;
        
      		deployWithMsgBody(_wid, _initialBalance, _code, total_amount);
        	Distributer(deployedContracts[counter-1]).distribute{value: 0.5 ever, callback: EverAirdrop.onDistribute}(_addresses, _amounts);
        	total_amount = 0;

      	}
      	counter++;
     }

     //Deploys Distributor contract using address.transfer
	
	function deployWithMsgBody(int8 _wid,uint128 _initialBalance,TvmCell _code, uint128 _totalAmount) public returns(address){
		TvmCell payload = tvm.encodeBody(Distributer);
		stateInit = tvm.buildStateInit({code: _code,
			contr: Distributer,
			varInit: {_randomNonce: nonce, _owner: address(this), totalAmount: _totalAmount},
			pubkey: 0
		});
		addr = address.makeAddrStd(_wid, tvm.hash(stateInit));
        	addr.transfer({stateInit:stateInit,body: payload, value: _initialBalance, bounce: false});	 
        	deployedContracts.push(addr);
		nonce++;
		return addr;
	}
	
    //Callback for Distributor's distribute method	
	
    function onDistribute(address _contractAddress, bool _distributed) public  
    {
    	 distributed_status.push(Status({
                distributed: _distributed,
                contractAddress: _contractAddress
            }));	
    	 statusArray.push(_distributed);
    	 distributeAddresses.push(_contractAddress);
    }
    
    function onRefund(bool _refunded) public
    {
    	refunded.push(_refunded);
    }    
   

     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after
     *      1. Refund lock passed
     *      2. Distribution finished
     */
   
    function refund() refundLockPassed public view {
        
        payable(refund_destination).transfer(0, false, 128);
        
        if(deployedContracts.length!=0)
        {
        	for(uint i=0;i<deployedContracts.length;i++)
        	{
        		Distributer(deployedContracts[i]).refund{value: 1 ever, callback: EverAirdrop.onRefund}(refund_destination);
        	}
        }
        
    }
    
    //retrieves addresses of the deployed Distributor contracts
    
    function getDeployedContracts() public view returns (address[])
    {
    	return deployedContracts;
    } 
    
    //gets the name of the contract
    
    function getContractNotes() public view returns (string)
    {
    	return contract_notes;
    }
    
    //gets refund lock duration

    function getRefundLockDuration() public view returns (uint256)
    {
    	return refund_lock_duration_end;
    }
    
    //gets the retrieved status array from callback, after the distribution is done in Distributor contracts
    
    function getStatus() public view returns (bool[] _distributed, address[] _addresses)
    {
    	for(uint i=0;i<distributed_status.length;i++)
    	{
    		_distributed.push(distributed_status[i].distributed);
    		_addresses.push(distributed_status[i].contractAddress);
    	}
    	return (_distributed, _addresses);
    }
    
        
 }
