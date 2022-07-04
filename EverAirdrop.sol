pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
import "TIP31TokenWallet.sol";

contract Airdrop {

    address[] addresses;
    uint128[] amounts;
    address refund_destination;
    uint256 refund_lock_duration_end;
    bool distributed = false;
    uint total_amount = 0;
    uint required_fee = 1000000000;
    address private walletAddress;
    uint128 private transferGas = 0.8 ever;
    
   
    constructor(
        address _refund_destination,
        address[] _addresses,
        uint128[] _amounts,
        uint256 _refund_lock_duration,
        address _walletAddress
    ) public {
        require(msg.pubkey() == tvm.pubkey(), 106);
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();

        addresses = _addresses;
        amounts = _amounts;
        refund_destination = _refund_destination;
        walletAddress = _walletAddress;
        refund_lock_duration_end = now + _refund_lock_duration;

        for (uint i=0; i < amounts.length; i++) {
            total_amount += amounts[i];
        }
    }
    
   
 }
