pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "Distributer.sol";
import "Tip31Distributer.sol";
import "TIP31TokenRoot.sol";
import "TIP31TokenWallet.sol";
import "IAcceptTokensTransferCallback.sol";
import 'InternalOwner.sol';
import 'CheckPubKey.sol';
//import 'RandomNonce.sol';
import "MsgFlag.sol";
import 'TokenWallet.sol';
//Contract used for airdrop of evers
contract Airdrop is InternalOwner, CheckPubKey, IAcceptTokensTransferCallback{
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
    uint128 public totalAmount=0;
    uint256 public recipientNumber=0;
    uint256 public creationDate;
    address senderAddress;
    address public tokenRootAddress;
    address walletAddress;
    uint flag;
    uint128 deposit = 0;
    uint128 private transferGas = 0.8 ever;
    uint128 numberOfRecipients;
    string public status="Preparing";
    uint256 public batches=0;
    address[] public allRecipients;
    uint128[] public allAmounts;
    uint public messageValue;
    uint128 public balanceWallet;
    string[] public transactionHashes;
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
        uint256 _refund_lock_duration,
        TvmCell _newCode,
        address _sender_address,
        address _token_root_address,
        uint256 _number_of_recipients,
        uint128 _total_amount
    ) public {
        require(msg.pubkey() == tvm.pubkey(), 106);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();
        
        contract_notes = _contract_notes;
        refund_destination = _refund_destination;
        refund_lock_duration_end = now + _refund_lock_duration;
        creationDate = now;
        senderAddress = _sender_address;
        tokenRootAddress = _token_root_address;
        totalAmount = _total_amount;
        recipientNumber = _number_of_recipients;
        flag = 0;
        batches = _number_of_recipients/99;
        if((_number_of_recipients%99)!=0)
        {
        	batches++;
        }
        if(tokenRootAddress.value != 0)
        {
        	setOwnership(_sender_address);
        	setUpTokenWallet();
        	flag=1;
        }
	//buildAirdropCode(msg.sender);
	tvm.setcode(_newCode);
	status="Deployed";
    }
    
    function setUpTokenWallet() internal view 
    {
        // Deploy token wallet
        TIP31TokenRoot(tokenRootAddress).deployWallet{
            value: 1 ever,
            callback: Airdrop.receiveTokenWalletAddress
        }(
            address(this),
            0.5 ever
        );
    }
    
    function receiveTokenWalletAddress(
        address wallet
    ) external 
    {
        require(msg.sender == tokenRootAddress, 30004);
        walletAddress = wallet;
    }
    
    /**
     * @dev Distributes contract balance to the receivers from the addresses if there is enough gas on the contract. Distributer contracts are deployed and their distribution method is triggered
    */
    function distribute(address[] _addresses, uint128[] _amounts, int8 _wid,uint128 _totalAmount) public {
    
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        tvm.accept();
        if(flag==0)
        {
        	//everything runs smoothly, continue with distribution
		if(deployedContracts.length==distributedContracts.length)
		{
	    	//transfer amounts[i] evers to addresses[i] address from this contract
		uint128 _initialBalance = _totalAmount + required_fee;
		address distributer = deployWithMsgBody(_wid, _initialBalance, _totalAmount);
		Distributer(distributer).distribute{value: 0.5 ever, callback: Airdrop.onDistribute}(_addresses, _amounts);
		}
		
		//if something went wrong and the distribution wasn't triggered but the distributer was deployed and has enough funds for distribution, trigger again
		else
		{
			uint index = deployedContracts.length-1;
			Distributer(deployedContracts[index]).distribute{value: 0.5 ever, callback: Airdrop.onDistribute}(_addresses, _amounts);
		}
        }
        else
        {
        	TvmCell payload = tvm.encodeBody(Tip31Distributer, tokenRootAddress, _addresses, _amounts, address(this), senderAddress);
	stateInit = tvm.buildStateInit({code: distributerCode,
					 contr: Tip31Distributer,
					 varInit: {_randomNonce: nonce, _owner: address(this)},
					 pubkey: tvm.pubkey()
					});
       addr = address.makeAddrStd(_wid, tvm.hash(stateInit));
       numberOfRecipients = uint128(_addresses.length);
       uint128 initialBalance = numberOfRecipients*0.3 ever;
       
       require(deposit>=_totalAmount, 1001);
        addr.transfer({stateInit:stateInit,body: payload, value: initialBalance, bounce: false});	
    	TvmCell _empty;
		
        	deployedContracts.push(addr);
		nonce++;
		
		TIP31TokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(_totalAmount, addr, 0.5 ever, address(this), true, _empty);
		
		deposit = deposit-_totalAmount;
		status = "Executed";
        }
        
        messageValue = msg.value;
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
    function onDistribute(bool _distributed, uint128 amount, uint256 recipientNr) public  
    {
    	address distributer = getDistributorAddress(nonce-1);
        require(msg.sender == distributer, 101);
    	 distributedContracts.push(_distributed);
    	 if(distributedContracts.length==batches)
    	 {
    	 	status="Executed";
    	 }
    	 else
    	 {
    	 	status="Executing";
    	 }
    	 //totalAmount+=amount;
    	// recipientNumber+=recipientNr;
    }
    
    
     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after refund lock passed
     */
    function refund() refundLockPassed public {
        
        if(flag==0)
        {
    		payable(refund_destination).transfer(0, false, 128);
    		status = "Redeemed";
        }
        else
        {
        	tvm.accept();
            TokenWallet(deployedContracts[0]).balance{value: 0.1 ever, callback: onBalance, flag: 0}();
        	for(uint i=0;i<deployedContracts.length;i++)
        	{
        		Tip31Distributer(deployedContracts[i]).refund{value:0.1 ever, flag:0}();
        	}
            
        	TokenWallet(walletAddress).sendSurplusGas{value: 0.1 ever, flag: 0}(senderAddress);
        	payable(senderAddress).transfer(0, false, 128);
        	status="Redeemed";
        
        }
    }

    function onBalance(uint128 balance) public 
    {
        balanceWallet = balance;
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
    
    function onAcceptTokensTransfer(
        address tokenRoot,
        uint128 amount,
        address sender,
        address senderWallet,
        address remainingGasTo,
        TvmCell payload
    ) external override 
    {
	tvm.accept();
        walletAddress = msg.sender;
        deposit = deposit + amount;
    }
    
    function setRecipients(address[] recipients/*, uint128[] amounts*/) public /*returns (address[])*/
    {
        tvm.accept();
    	for(uint i=0;i<recipients.length;i++)
    	{
    	allRecipients.push(recipients[i]);
    	//allAmounts.push(amounts[i]);
    	}
    	messageValue = messageValue + msg.value;
    	//return allRecipients;
    }
    
    function setAmounts(uint128[] amounts) public
    {
        tvm.accept();
    	for(uint i=0;i<amounts.length;i++)
    	{
    		allAmounts.push(amounts[i]);
    	}
    	
    	messageValue = messageValue+msg.value;
    }
    
    function setTransaction(string transaction) public
    {
        tvm.accept();
        transactionHashes.push(transaction);
    }
    
   
 }
