pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
//pragma AbiHeader time;
pragma AbiHeader pubkey;

import "ITokenRoot.sol";
import 'ITokenWallet.sol';
import "IAcceptTokensTransferCallback.sol";
import 'InternalOwner.sol';
import 'CheckPubKey.sol';
import 'RandomNonce.sol';

contract Tip31Distributer is InternalOwner, RandomNonce, CheckPubKey, IAcceptTokensTransferCallback {
	
	address _tokenRootAddr;
	address walletAddress;
	address[] addresses;
	uint128[] amountss;
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
		setUpTokenWallet();
		addresses = recipients;
		amountss = amounts;
		
	}
	
	function setUpTokenWallet() internal view {
        	// Deploy token wallet
		ITokenRoot(_tokenRootAddr).deployWallet{
		    value: 1 ever,
		    callback: Tip31Distributer.receiveTokenWalletAddress
		}(
		    address(this),
		    0.5 ever
		);
    	}
    
	function receiveTokenWalletAddress(address wallet) external {
		require(msg.sender == _tokenRootAddr, 30004);
		walletAddress = wallet;
	}
	
	function getDetails() public responsible returns (address[] _recipients, uint128[] _amounts, address owner)
	{
		tvm.accept();
		return {value: 0, bounce: false, flag: 64} (addresses, amountss, _owner);
	}
	
	function onAcceptTokensTransfer(address tokenRoot, uint128 amount, address sender, address senderWallet, address remainingGasTo, TvmCell payload) external override {
    tvm.accept();
    	TvmCell empty;
    	address remaining = address(this);
    	//walletAddress = msg.sender;
    	isCallback=true;
    	for (uint128 i = 0; i < addresses.length; i++) {
            		address recipient = addresses[i];
            		uint128 amount = amountss[i];
            		
       ITokenWallet(walletAddress).transfer{value: 0.8 ever, flag: 0}(amount, recipient, 0.5 ever, remaining, false, empty);
       }
       }
       
       function transfer() public returns(address)
       {
       	require(walletAddress.value != 0, 1001, "Wallet address error!");
       	TvmCell empty;
       	ITokenWallet(walletAddress).transfer{value: 0.8 ever, flag: 0}(amountss[0], addresses[0], 0.5 ever, _owner, false, empty);
       	return walletAddress;
       }
       
       function getPublicKey() public returns (uint)
       {
       	pubKey = tvm.pubkey();
       	return pubKey;
       }
        	
    
}
