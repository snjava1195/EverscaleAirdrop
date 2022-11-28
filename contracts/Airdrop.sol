pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "./Interfaces/TIP31TokenRoot.sol";
import "./Interfaces/TIP31TokenWallet.sol";
import "./Interfaces/IAcceptTokensTransferCallback.sol";
import './Helpers/InternalOwner.sol';
import './Helpers/CheckPubKey.sol';
import "./Libraries/MsgFlag.sol";
import './Tip3/TokenWallet.sol';
//Contract used for airdrop of evers
contract Airdrop is InternalOwner, CheckPubKey, IAcceptTokensTransferCallback{
    address refund_destination;
    uint256 refund_lock_duration_end;
    uint128 total_amount = 0;
    string public contract_notes;
    uint128 public totalAmount=0;
    uint256 public recipientNumber=0;
    uint256 public creationDate;
    address senderAddress;
    address public tokenRootAddress;
    address walletAddress;
    uint flag;
    uint deposit = 0;
    string public status="Preparing";
    uint256 public batches=0;
    string[] public transactionHashes;
    mapping(uint=>address[]) public batchAddresses;
    mapping(uint=>uint256[]) public batchAmounts;
    uint counter=0;
    uint counterRec=0;
    uint public usao=0;
    uint public length = 0;
    event BatchDone(uint batchProcesses);
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
	tvm.setcode(_newCode);
	status="Deploying";
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


    function callDistribute() internal returns(bool finished)
    {
        
        uint count=1;
        bool distribute = false;
        while(usao<batches)
        {

        if(flag==0)
        {
            uint sufficient_balance=0;
            for(uint i=0;i<batchAddresses[usao].length;i++)
            {
                sufficient_balance = sufficient_balance+batchAmounts[usao][i];
            }
            require(address(this).balance>sufficient_balance);
            for(uint j=0;j<batchAddresses[usao].length;j++)
            {
                payable(batchAddresses[usao][j]).transfer(uint128(batchAmounts[usao][j]), false, 1);
            }
         
        }
        else
        {
            TvmCell empty;
            uint sufficient_balance=0;
            for(uint i=0;i<batchAddresses[usao].length;i++)
            {
                sufficient_balance = sufficient_balance+batchAmounts[usao][i];
            }
            require(deposit>=sufficient_balance);
            for (uint j = 0; j < batchAddresses[usao].length; j++) {
		    	address recipient = batchAddresses[usao][j];
		    	uint128 amountPerTransfer = uint128(batchAmounts[usao][j]);
		    		
			TIP31TokenWallet(walletAddress).transfer{value: 0.11 ever, flag: 0+1}(amountPerTransfer, recipient, 0.025 ever, msg.sender, true, empty);
	       }
        }
            usao++;
            if(usao!=batches)
            {
                finished=false;
                break;
            }
            else
            {
                finished = true;
                status="Executed";
                break;
            }
        }
            return finished;   
            
        }
    
    function distribute2() public
    {
        require(msg.sender==senderAddress || msg.sender==address(this), 1001);
        tvm.accept();
        bool result;
        uint128 fee=0;
        result = callDistribute();
        emit BatchDone(usao);
        
        if(result == false)
        {
           //fee=fee+(uint128(batchAddresses[usao].length)*0.12 ever); 
        this.distribute2{value: 0.12 ever, flag:0+1}();
        }
    }
    
    
    
     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after refund lock passed
     */
    function refund() refundLockPassed public {
        require(msg.sender==senderAddress, 1101);//???
        if(flag==0)
        {

    		payable(refund_destination).transfer(0, false, 128);
    		status = "Redeemed";
        }
        else
        {
        	tvm.accept();
            
        	TokenWallet(walletAddress).sendSurplusGas{value: 0.1 ever, flag: 1}(senderAddress);
        	payable(senderAddress).transfer(0, false, 128);
        	status="Redeemed";
        
        }
    }

 
    //Builds specific contract code based on the owner's address
    function buildAirdropCode(address ownerAddress) public pure returns(TvmCell)
    {
    	TvmCell airdropCode = tvm.code();
    	TvmBuilder salt;
    	salt.store(ownerAddress);
    	return tvm.setCodeSalt(airdropCode, salt.toCell());
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
	require(msg.sender==walletAddress, 1101); 
        walletAddress = msg.sender;
        deposit = deposit + amount;
        status="Preparing";
    }
    
    function setRecipients(address[] recipients) public 
    {
        tvm.accept();
    	for(uint i=0;i<recipients.length;i++)
    	{
    	batchAddresses[counterRec].push(recipients[i]);
    	}
        
       counterRec++;
    }
    
    function setAmounts(uint256[] amounts) public
    {
        
        tvm.accept();
        uint256 total_Amount=0;
    	for(uint i=0;i<amounts.length;i++)
    	{
    		batchAmounts[counter].push(amounts[i]);
            total_Amount+=total_Amount+amounts[i];
    	}
        counter++;
        if(counter==batches)
        {
            status="Deployed";
        }
    }

    
    function setTransaction(string transaction) public
    {
        tvm.accept();
        transactionHashes.push(transaction);
    }
    
   
 }
