pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "TIP31TokenWallet.sol";

contract Tip31Airdrop {

    address _senderAddr;
    address _tokenRootAddr;
    uint128 constant private MAX_TRANSFER_NUMBER = 100000;
    uint128 private transferNumber = 255;
    address private walletAddress;
    uint128 private transferGas = 0.8 ever;
    uint128 private transactionFee = 0.015 ever;
    uint total_amount = 0;

    constructor(address senderAddr, address tokenRootAddr) public 
    {
        require(senderAddr.value != 0, 1001);
        require(tokenRootAddr.value != 0, 1001);
        tvm.accept();

        _senderAddr = senderAddr;
        _tokenRootAddr = tokenRootAddr;
    }

    // function multiTransfer(address[] recipients, uint128[] amounts) balanceSufficient external {
    //     require(recipients.length > 0 && recipients.length <= transferNumber, 1002, "The number of recipients error!");
    //     require(recipients.length == amounts.length, 1003, "The number of recipients must equal to the number of amounts!");
    //     tvm.accept();

    //     for (uint i=0; i < amounts.length; i++) {
    //         total_amount += amounts[i];
    //     }

    //     walletAddress = msg.sender;

    //     startTransfer(recipients, amounts, _senderAddr);
    // }

    // function startTransfer(address[] recipients, uint128[] amounts, address remainingGasTo) private view {  
    //     require(walletAddress.value != 0, 1001, "Wallet address error!");

    //     TIP31TokenWallet bridgeWallet = TIP31TokenWallet(walletAddress);
    //     TvmCell _empty;
        
    //     for (uint128 i = 0; i < recipients.length; i++) {
    //         address recipient = recipients[i];
    //         uint128 amount = amounts[i];
    //         bridgeWallet.transfer{value: transferGas, flag: 0}(amount, recipient, 0.5 ever, remainingGasTo, false, _empty);
    //     }
    // }

    // function expectTotalAmount(uint128[] amounts) public view returns (uint128) {
    //     require(amounts.length > 0 && amounts.length <= transferNumber, 1002, "The number of amounts error!");
    //     uint128 totalAmount;
    //     for (uint128 i = 0; i < amounts.length; i ++) {
    //         totalAmount += amounts[i];
    //     }
    //     return totalAmount;
    // }
   
    // 1 TON should be enough for any possible fees
    // The rest of the balance can always be refunded
    // modifier balanceSufficient {
    //     require(address(this).balance > total_amount + transactionFee, 105);
    //     tvm.accept();

    //     _;
    // }
 }
