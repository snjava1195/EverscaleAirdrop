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
    uint128[] _amounts;
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
   // uint deposit;
    constructor(address senderAddr, address tokenRootAddr) public 
    {
        require(senderAddr.value != 0, 1001);
        require(tokenRootAddr.value != 0, 1001);
        tvm.accept();

        _senderAddr = senderAddr;
        _tokenRootAddr = tokenRootAddr;

        setOwnership(_senderAddr);
        setUpTokenWallet();
        buildAirdropCode(msg.sender);
       
    }
    
    function setUpTokenWallet() internal view {
        // Deploy token wallet
        TIP31TokenRoot(_tokenRootAddr).deployWallet{
            value: 1 ever,
            callback: Tip31Airdrop.receiveTokenWalletAddress
        }(
            address(this),
            0.5 ever
        );
    }
    
    function receiveTokenWalletAddress(
        address wallet
    ) external {
        require(msg.sender == _tokenRootAddr, 30004);

        walletAddress = wallet;
    }
    
    function getDetails() external returns(
        address _token,
        address _token_wallet,
        uint balance
    ) {
    	
        return (
            _tokenRootAddr,
            walletAddress,
            deposit
        );
    }
	
	
    function multiTransfer(address[] recipients, uint128[] amounts, uint128 totalAmount) public {
    	TvmCell payload = tvm.encodeBody(Tip31Distributer, _tokenRootAddr, recipients, amounts, address(this), _senderAddr);
	stateInit = tvm.buildStateInit({code: tip31distributerCode,
					 contr: Tip31Distributer,
					 varInit: {_randomNonce: nonce, _owner: address(this)},
					 pubkey: tvm.pubkey()
					});
       address addr = address.makeAddrStd(0, tvm.hash(stateInit));
       numberOfRecipients = uint128(recipients.length);
       uint128 initialBalance = numberOfRecipients*transferGas;
      //ITokenWallet(walletAddress).balance{value:0.5 ever, callback: Tip31Airdrop.onBalance}();
       
       require(deposit>=totalAmount, 1001);
        addr.transfer({stateInit:stateInit,body: payload, value: initialBalance, bounce: false});	
    	TvmCell _empty;
		
        	deployedContracts.push(addr);
		nonce++;
		
		TIP31TokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(totalAmount, addr, 0.5 ever, address(this), true, _empty);
		
		deposit = deposit-totalAmount;
		
    }
	
    function buildAirdropCode(address ownerAddress) public pure returns(TvmCell)
    {
    	TvmCell airdropCode = tvm.code();
    	TvmBuilder salt;
    	salt.store(ownerAddress);
    	return tvm.setCodeSalt(airdropCode, salt.toCell());
    }	
    
    function getDistributorAddress(uint _nonce) public view returns(address){
        return deployedContracts[_nonce-1];
    }

    
    function refund() public view {
        tvm.accept();
        for(uint i=0;i<deployedContracts.length;i++)
        {
        	Tip31Distributer(deployedContracts[i]).refund{value:0.5 ever, flag:0}();
        }
        TokenWallet(walletAddress).sendSurplusGas{value: 0.8 ever, flag: 0}(_senderAddr);
        payable(_senderAddr).transfer(0, false, 128);
    }
    
    function getDistributers() public returns (address[])
    {
    	return deployedContracts;
    }
    
    function onBalance(uint128 balance) public
    {
    	deposit = balance;
    }
    
   function onAcceptTokensTransfer(
        address tokenRoot,
        uint128 amount,
        address sender,
        address senderWallet,
        address remainingGasTo,
        TvmCell payload
    ) external override {
       // require(sender == _senderAddr, 1001, "Sender address error!");
       // require(tokenRoot == _tokenRootAddr, 1001, "Token root address error!");
	tvm.accept();
        walletAddress = msg.sender;

        deposit = deposit + amount;
    }

    function getDeposit() external view returns (uint128) {
        return deposit;
    }
    
 }
