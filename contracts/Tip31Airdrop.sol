pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
//pragma AbiHeader time;
pragma AbiHeader pubkey;

import 'InternalOwner.sol';
import 'CheckPubKey.sol';
import 'RandomNonce.sol';
import "MsgFlag.sol";
import 'TokenWallet.sol';
import "Tip31Distributer.sol";
import "TIP31TokenRoot.sol";
import "TIP31TokenWallet.sol";
import "IAcceptTokensTransferCallback.sol";

contract Tip31Airdrop is InternalOwner, RandomNonce, CheckPubKey, IAcceptTokensTransferCallback {

    address _senderAddr;
    address _tokenRootAddr;
    address[] _recipients;
    address[] distributerAddress;
    uint128 private transferNumber = 100;
    uint128 deposit = 0;//50000000000;
    address private walletAddress;
    uint128 private transferGas = 0.8 ever;
    uint128 private transactionFee = 0.015 ever;
    uint total_amount = 0;
    uint128 numberOfRecipients;
    uint publicKey;
    TvmCell public static tip31distributerCode;
    uint nonce=0;
    TvmCell stateInit;
    address[] deployedContracts;
    uint256 refund_lock_duration_end;
    TvmCell airdropCodeSalted;
   // uint deposit;
   
   modifier refundLockPassed() {
        require(now > refund_lock_duration_end, 107);
        tvm.accept();

        _;
    }
   
    constructor(address senderAddr, address tokenRootAddr, uint256 _refund_lock_duration) public 
    {
        require(senderAddr.value != 0, 1001);
        require(tokenRootAddr.value != 0, 1001);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();

        _senderAddr = senderAddr;
        _tokenRootAddr = tokenRootAddr;

        setOwnership(_senderAddr);
        setUpTokenWallet();
        airdropCodeSalted = buildAirdropCode(msg.sender);
        refund_lock_duration_end = now + _refund_lock_duration;
       
    }
    
    //Deploys token wallet of the airdrop
    function setUpTokenWallet() internal view 
    {
        // Deploy token wallet
        TIP31TokenRoot(_tokenRootAddr).deployWallet{
            value: 1 ever,
            callback: Tip31Airdrop.receiveTokenWalletAddress
        }(
            address(this),
            0.5 ever
        );
    }
    
    //Callback for getting newly deployed token wallet
    function receiveTokenWalletAddress(
        address wallet
    ) external 
    {
        require(msg.sender == _tokenRootAddr, 30004);
        walletAddress = wallet;
    }
    
    //Returns token root, wallet address and balance of the airdrop
    function getDetails() external returns(
        address _token,
        address _token_wallet,
        uint balance
    ) 
    {
        return (
            _tokenRootAddr,
            walletAddress,
            deposit
        );
    }
	
    //Deploys as many Distributers as there are batches and transfers sufficient amount of tokens to ensure distribution will finish successfully	
    function distribute(address[] _addresses, uint128[] _amounts, int8 _wid,uint128 _totalAmount) public 
    {
    	TvmCell payload = tvm.encodeBody(Tip31Distributer, _tokenRootAddr, _addresses, _amounts, address(this), _senderAddr);
	stateInit = tvm.buildStateInit({code: tip31distributerCode,
					 contr: Tip31Distributer,
					 varInit: {_randomNonce: nonce, _owner: address(this)},
					 pubkey: tvm.pubkey()
					});
       address addr = address.makeAddrStd(_wid, tvm.hash(stateInit));
       numberOfRecipients = uint128(_addresses.length);
       uint128 initialBalance = numberOfRecipients*transferGas;
       
       require(deposit>=_totalAmount, 1001);
        addr.transfer({stateInit:stateInit,body: payload, value: initialBalance, bounce: false});	
    	TvmCell _empty;
		
        	deployedContracts.push(addr);
		nonce++;
		
		TIP31TokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(_totalAmount, addr, 0.5 ever, address(this), true, _empty);
		
		deposit = deposit-_totalAmount;
		
    }
	
    //Returns contract code specific for the owner of the airdrop
    function buildAirdropCode(address ownerAddress) public pure returns(TvmCell)
    {
    	TvmCell airdropCode = tvm.code();
    	TvmBuilder salt;
    	salt.store(ownerAddress);
    	return tvm.setCodeSalt(airdropCode, salt.toCell());
    }	
    
    //Returns distributer address based on the nonce
    function getDistributorAddress(uint _nonce) public view returns(address)
    {
        return deployedContracts[_nonce-1];
    }

    //Returns all the funds left back to the owner
    function refund() refundLockPassed public view 
    {
        tvm.accept();
        for(uint i=0;i<deployedContracts.length;i++)
        {
        	Tip31Distributer(deployedContracts[i]).refund{value:0.5 ever, flag:0}();
        }
        TokenWallet(walletAddress).sendSurplusGas{value: 0.8 ever, flag: 0}(_senderAddr);
        payable(_senderAddr).transfer(0, false, 128);
    }
    
    //Returns list of all deployed distributers
    function getDistributers() public returns (address[])
    {
    	return deployedContracts;
    }
    
    //Callback method for accepting tokens transferred to this contract
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

    //Returns contract's balance 
    function getDeposit() external view returns (uint128) 
    {
        return deposit;
    }
    
    //Returns hash of the contract code
    function getCodeHash() public returns(uint256)
    {
    	//TvmCell contractCode = buildAirdropCode(refund_destination);
    	return tvm.hash(airdropCodeSalted);
      }
    
    
 }
