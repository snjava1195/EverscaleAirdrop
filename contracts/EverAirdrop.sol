pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "Distributer.sol";
//Contract used for airdrop of evers
contract EverAirdrop {
    address[] addresses;
    uint128[] amounts;
    address[] newAddresses;
    uint128[] newAmounts;
    uint128[] totalArrAmounts;
    address refund_destination;
    address addr;
    uint256 refund_lock_duration_end;
    bool distributed = false;
    uint total_amount = 0;
    uint batch = 0;
    uint required_fee = 1000000000; 
    uint128 private transferGas = 0.8 ever;
    uint public static _randomNonce;
    uint public nonce = 1;
    uint mapSize=0;
    address[] public deployedContracts;
    TvmCell public stateInit;
    uint128 public amount;
    string public contract_notes;
    mapping(uint256 => address[]) public mappingAddress;
    mapping(uint256 => uint128[]) public mappingAmounts;
    
    event EverDropEmit(
        address[] _mappingAddress,
        uint128[] _mappingAmounts
    );
      
   //Modifier that allows public function to accept external calls only from contract owner
     modifier checkOwnerAndAccept{
     	require(msg.pubkey() == tvm.pubkey() , 102);
     	tvm.accept();
     	_;
    }
     
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
        string _contract_notes,
        address _refund_destination,
        address[] _addresses,
        uint128[] _amounts,
        uint256 _refund_lock_duration
    ) public {
        //require(msg.pubkey() == tvm.pubkey(), 106);
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();

	for (uint i=0;i<3;i++){
	        
		for(uint j = i*2;j <=i*2+1;j++){
			newAddresses.push(_addresses[j]);
			newAmounts.push(_amounts[j]);
		}
		mapSize++;
		
		mappingAddress[i] = newAddresses;
		mappingAmounts[i] = newAmounts;
		delete newAddresses;
		delete newAmounts;
		
	emit EverDropEmit(mappingAddress[i],mappingAmounts[i]);
	}
        
       
        contract_notes = _contract_notes;
        addresses = _addresses;
        amounts = _amounts;
        refund_destination = _refund_destination;
        refund_lock_duration_end = now + _refund_lock_duration * 1 days;

	//calculates total amount to be sent based on the amounts from the list
        for (uint i=0; i < amounts.length; i++) {
            total_amount += amounts[i];
        }
    }

    /**
     * @dev Distributes contract balance to the receivers from the addresses if there is enough gas on the contract and no other distribution is triggered from this contract
    */
   // function distribute() balanceSufficient distributedStatus(false) public {
    	//another airdrop can't be triggered until this one ends
    //    distributed = true;
        //transfer amounts[i] evers to addresses[i] address from this contract
      
   //     for (uint i=0; i < addresses.length; i++) {
    //        payable(addresses[i]).transfer(amounts[i], false, 1);
    //        }
      
    //    }
        
        function sendOverload() external view {
        	
        	for(uint i=0;i<deployedContracts.length;i++)
       {
        		Distributer(deployedContracts[i]).distribute{value: 1 ever, callback: EverAirdrop.onDistribute}(mappingAddress[i], mappingAmounts[i]);
        	}
        
        }
        
	function deployOverloadContracts(TvmCell _code) public{

		for(uint i=0;i<mapSize;i++)
		{
			deployWithMsgBody(0,40,_code);
		}
	} 
	
	
	function deployWithMsgBody(int8 _wid,uint128 _initialBalance,TvmCell _code) public returns(address){
	
		TvmCell payload = tvm.encodeBody(Distributer);
		stateInit = tvm.buildStateInit({code: _code,
			contr: Distributer,
			varInit: {_randomNonce: nonce, _owner: address(this)},
			pubkey: 0
		});
		addr = address.makeAddrStd(_wid, tvm.hash(stateInit));
        	addr.transfer({stateInit:stateInit,body: payload, value: _initialBalance , bounce: false});	 
        	deployedContracts.push(addr);
		nonce++;
		return addr;
	}
	
    function onDistribute(uint128 _amount) public  
    {
    	amount = _amount;
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
    
    function getDeployedContracts() public view returns (address[])
    {
    	return deployedContracts;
    } 
    
    function getContractNotes() public view returns (string)
    {
    	return contract_notes;
    }

    function getRefundLockDuration() public view returns (uint256)
    {
    	return refund_lock_duration_end;
    }

    function getAmount() public view returns (uint128)
    {
    	return amount;
    }
    
    function getPubkey() public view returns(uint256)
    {
    	uint256 key = tvm.pubkey();
    	return key;
    }
 }
