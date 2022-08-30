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

contract Tip31Airdrop is InternalOwner, RandomNonce, CheckPubKey {

    address _senderAddr;
    address _tokenRootAddr;
    address[] _recipients;
    uint128[] _amounts;

    uint128 private transferNumber = 255;

    address private walletAddress;
    uint128 private deposit = 0;

    uint128 private transferGas = 0.8 ever;
    uint128 private transactionFee = 0.015 ever;
    uint total_amount = 0;

    constructor(address senderAddr, address tokenRootAddr
    /*address[] recipients, uint128[] amounts*/) public 
    {
        require(senderAddr.value != 0, 1001);
        require(tokenRootAddr.value != 0, 1001);
        tvm.accept();

        _senderAddr = senderAddr;
        _tokenRootAddr = tokenRootAddr;
       // _recipients = recipients;
       // _amounts = amounts;

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
    
    function getDetails() external view returns(
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

    function multiTransfer(address[] recipients, uint128[] amounts) external {
    	_recipients = recipients;
    	_amounts = amounts;
        require(walletAddress.value != 0, 1001, "Wallet address error!");
        require(_recipients.length > 0 && _recipients.length <= transferNumber, 1002, "The number of recipients error!");
        require(_recipients.length == _amounts.length, 1003, "The number of recipients must equal to the number of amounts!");
        tvm.accept();

    //    uint128 msgValue = uint128(msg.value);
     //   require(msgValue >= _amounts.length * (transferGas + transactionFee), 1008, "not sufficient gas!");

        uint128 totalAmount = expectTotalAmount(_amounts);
       // require(deposit >= totalAmount, 1007, "not sufficient funds!");

        startTransfer(_recipients, _amounts, _senderAddr);
    }

    function startTransfer(address[] recipients, uint128[] amounts, address remainingGasTo) private {
        TvmCell _empty;
        for (uint128 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint128 amount = amounts[i];
            ITokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(amount, recipient, 0.5 ever, remainingGasTo, false, _empty);
        }
    }

    function expectTotalAmount(uint128[] amounts) public returns (uint128) {
        require(amounts.length > 0 && amounts.length <= transferNumber, 1002, "The number of amounts error!");
        uint128 totalAmount;
        for (uint128 i = 0; i < amounts.length; i ++) {
            totalAmount += amounts[i];
        }
       
        return totalAmount;
    }
    
    function refund() public view {
        tvm.accept();
        payable(_senderAddr).transfer(0, false, 128);
    }
    

 }
