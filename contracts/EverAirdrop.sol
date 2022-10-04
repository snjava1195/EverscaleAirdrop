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
    TvmCell public static distributerCode;
    bool[] statusArray;
    uint public nonce = 1;
    address[] public deployedContracts;
    bool[] distributedContracts;
    TvmCell public stateInit;
    string public contract_notes;

 

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
	buildAirdropCode(msg.sender);

    }
    
    /**
     * @dev Distributes contract balance to the receivers from the addresses if there is enough gas on the contract. Distributer contracts are deployed and their distribution method is triggered
    */
    function distribute(address[] _addresses, uint128[] _amounts, int8 _wid,uint128 _totalAmount) public {
    
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        tvm.accept();
        
        //everything runs smoothly, continue with distribution
        if(deployedContracts.length==distributedContracts.length)
        {
    	//transfer amounts[i] evers to addresses[i] address from this contract
        uint128 _initialBalance = _totalAmount + required_fee;
        address distributer = deployWithMsgBody(_wid, _initialBalance, _totalAmount);
        Distributer(distributer).distribute{value: 0.5 ever, callback: EverAirdrop.onDistribute}(_addresses, _amounts);
        }
        
        //if something went wrong and the distribution wasn't triggered but the distributer was deployed and has enough funds for distribution, trigger again
        else
        {
        	uint index = deployedContracts.length-1;
        	Distributer(deployedContracts[index]).distribute{value: 0.5 ever, callback: EverAirdrop.onDistribute}(_addresses, _amounts);
        }
     }

    //Deploys Distributor contract using address.transfer
    function deployWithMsgBody(int8 _wid,uint128 _initialBalance, uint128 _totalAmount) public returns(address){
		
	TvmCell payload = tvm.encodeBody(Distributer);
	stateInit = tvm.buildStateInit({code: distributerCode,
					 contr: Distributer,
					 varInit: {_randomNonce: nonce, _owner: address(this), totalAmount: _totalAmount},
					 pubkey: 0
					});
        addr = address.makeAddrStd(_wid, tvm.hash(stateInit));
        addr.transfer({stateInit:stateInit,body: payload, value: _initialBalance, bounce: false});	 
        	
        deployedContracts.push(addr);
  	nonce = deployedContracts.length+1;
	return addr;
    }
	

    //returns list of all created Distributers accessible by nonce
    function getDistributorAddress(uint _nonce) public view returns(address){
        return deployedContracts[_nonce-1];
    }

    //Callback for Distributor's distribute method
    function onDistribute(bool _distributed) public  
    {
    	address distributer = getDistributorAddress(nonce-1);
        require(msg.sender == distributer, 101);
    	 distributedContracts.push(_distributed);
    }
    
    
     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after refund lock passed
     */
    function refund() refundLockPassed public view {
        
    	payable(refund_destination).transfer(0, false, 128);
        
    }
    
    //Builds specific contract code based on the owner's address
    function buildAirdropCode(address ownerAddress) public pure returns(TvmCell)
    {
    	TvmCell airdropCode = tvm.code();
    	TvmBuilder salt;
    	salt.store(ownerAddress);
    	return tvm.setCodeSalt(airdropCode, salt.toCell());
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
    
    function getDistributedContracts() public view returns(bool[])
    {
    	return distributedContracts;
    }
    
    function getCodeHash() public returns(uint256)
    {
    	TvmCell contractCode = buildAirdropCode(refund_destination);
    	return tvm.hash(contractCode);
    }
 }
