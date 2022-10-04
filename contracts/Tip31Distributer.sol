pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
//pragma AbiHeader time;
pragma AbiHeader pubkey;

//import "ITokenRoot.sol";
import 'TokenWallet.sol';
import "TIP31TokenRoot.sol";
import 'TIP31TokenWallet.sol';
import "IAcceptTokensTransferCallback.sol";
import 'InternalOwner.sol';
import 'CheckPubKey.sol';
import 'RandomNonce.sol';

contract Tip31Distributer is InternalOwner, RandomNonce, CheckPubKey, IAcceptTokensTransferCallback {
	
	address _tokenRootAddr;
	address walletAddress;
	address _senderAddress;
	address[] addresses;
	uint128[] amountsToTransfer;
	address public static _owner;
	address _remainingGasTo;
	bool public isCallback=false;
	TvmCell _empty;
	uint pubKey;
	
	constructor(address tokenRootAddr, address[] recipients, uint128[] amounts, address remainingGasTo, address senderAddr) public
	{
		require(msg.sender==_owner, 1001);
		require(recipients.length > 0 && recipients.length <= 100, 1002, "The number of 			recipients error!");
        	require(recipients.length == amounts.length, 1003, "The number of recipients must 			equal to the number of amounts!");
        	tvm.accept();
		_tokenRootAddr = tokenRootAddr;
		setOwnership(senderAddr);
		_senderAddress = senderAddr;
		addresses = recipients;
		amountsToTransfer = amounts;	
	}
	
	//Callback method for accepting tokens transferred to this contract
	function onAcceptTokensTransfer(address tokenRoot, uint128 amount, address sender, address senderWallet, address remainingGasTo, TvmCell payload) external override 
	{
	    	tvm.accept();
	    	TvmCell empty;
	    	address remaining = address(this);
	    	walletAddress = msg.sender;
	    	isCallback=true;
	    	for (uint128 i = 0; i < addresses.length; i++) {
		    	address recipient = addresses[i];
		    	uint128 amountPerTransfer = amountsToTransfer[i];
		    		
	       	TIP31TokenWallet(walletAddress).transfer{value: 0.8 ever, flag: 0}(amountPerTransfer, recipient, 0.5 ever, remaining, false, empty);
	       }
       }
       
       //Returns all the funds left back to the airdrop contract
       function refund() public
       {
       	TokenWallet(walletAddress).sendSurplusGas{value: 0.8 ever, flag: 0}(_senderAddress);
       	_owner.transfer(0, false, 128);
       }
       
       
        
    
}
