pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
//pragma AbiHeader time;
pragma AbiHeader pubkey;

import 'InternalOwner.sol';
import 'CheckPubKey.sol';
import 'RandomNonce.sol';
import "MsgFlag.sol";


import "ITokenRoot.sol";
import 'ITokenWallet.sol';
import "Tip31Distributer.sol";

contract Tip31Airdrop is InternalOwner, RandomNonce, CheckPubKey {

    address _senderAddr;
    address _tokenRootAddr;
    address[] _recipients;
    uint128[] _amounts;
    address[] distributerAddress;
    uint128 private transferNumber = 100;
    uint128 deposit;
    address private walletAddress;
    //address[] distAddress;
    //uint128[] distAmount;
    //address distOwner;
    uint128 private transferGas = 0.8 ever;
    uint128 private transactionFee = 0.015 ever;
    uint total_amount = 0;
    uint128 numberOfRecipients;
    uint publicKey;
    TvmCell public static tip31distributerCode;
   // uint public static _nonce;
    uint nonce=0;
    TvmCell stateInit;
    address[] deployedContracts;
    constructor(address senderAddr, address tokenRootAddr) public 
    {
        require(senderAddr.value != 0, 1001);
        require(tokenRootAddr.value != 0, 1001);
        tvm.accept();

        _senderAddr = senderAddr;
        _tokenRootAddr = tokenRootAddr;

        setOwnership(_senderAddr);
        setUpTokenWallet();
       
    }
    
    function setUpTokenWallet() internal view {
        // Deploy token wallet
        ITokenRoot(_tokenRootAddr).deployWallet{
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
        uint128 _transferred_count
    ) {
    	
        return (
            _tokenRootAddr,
            walletAddress,
            deposit
        );
    }

    function onBalance(uint128 balance) public
    {
    	deposit = balance;
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
        addr.transfer({stateInit:stateInit,body: payload, value: initialBalance, bounce: false});	
    	TvmCell _empty;
		
        	deployedContracts.push(addr);
		nonce++;
		
		ITokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(totalAmount, addr, 0.5 ever, address(this), true, _empty);
		
		ITokenWallet(walletAddress).balance{value:0.5 ever, callback: Tip31Airdrop.onBalance}();
		
    }
	
    function getDistributorAddress(uint _nonce) public view returns(address){
        return deployedContracts[_nonce-1];
    }
    
   /* function expectTotalAmount(uint128[] amounts) public returns (uint128) {
        require(amounts.length > 0 && amounts.length <= transferNumber, 1002, "The number of amounts error!");
        uint128 totalAmount;
        for (uint128 i = 0; i < amounts.length; i ++) {
            totalAmount += amounts[i];
        }
       
        return totalAmount;
    }*/
    
    function refund() public view {
        tvm.accept();
        payable(_senderAddr).transfer(0, false, 128);
    }
    
    function getDistributers() public returns (address[])
    {
    	return deployedContracts;
    }
    
   /* function onDetails(address[] addresses, uint128[] amounts, address owner) public 
    {
    	distAddress = addresses;
    	distAmount = amounts;
    	distOwner = owner;
    	distributerAddress.push(address(this));	
    
    }
    
    function getDistributerAddress() public returns (address[], uint128[], address)
    {
    	return (distAddress, distAmount, distOwner);
    }
    
    
    function getPubKey() public returns (uint)
    {
    	publicKey = tvm.pubkey();
    	return publicKey;
    }*/

 }
