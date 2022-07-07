pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;

contract EverAirdrop {

    address[] addresses;
    uint128[] amounts;
    address refund_destination;
    uint256 refund_lock_duration_end;
    bool distributed = false;
    uint total_amount = 0;
    uint required_fee = 1000000000; 
    uint128 private transferGas = 0.8 ever;
    
    // 1 TON should be enough for any possible fees
    // The rest of the balance can always be refunded
    modifier balanceSufficient {
        require(address(this).balance > total_amount + required_fee, 105);
        tvm.accept();

        _;
    }

    modifier distributedStatus(bool status) {
        require(distributed == status, 108);
        tvm.accept();

        _;
    }

    modifier refundLockPassedOrDistributionIsOver() {
        require((distributed == true) || (now > refund_lock_duration_end), 107);
        tvm.accept();

        _;
    }
   
    constructor(
        address _refund_destination,
        address[] _addresses,
        uint128[] _amounts,
        uint256 _refund_lock_duration
    ) public {
        require(msg.pubkey() == tvm.pubkey(), 106);
        require(_amounts.length == _addresses.length, 101);
        require((_addresses.length > 0) && (_addresses.length < 100), 102);
        require((_refund_lock_duration <= 604800) && (_refund_lock_duration >= 120), 103);
        tvm.accept();

        addresses = _addresses;
        amounts = _amounts;
        refund_destination = _refund_destination;
        refund_lock_duration_end = now + _refund_lock_duration;

        for (uint i=0; i < amounts.length; i++) {
            total_amount += amounts[i];
        }
    }
    
    /**
     * @dev Distributes contract balance to the receivers from the addresses
    */
    function distribute() balanceSufficient distributedStatus(false) public {
        distributed = true;
        for (uint i=0; i < addresses.length; i++) {
            payable(addresses[i]).transfer(amounts[i], false, 1);
        }
        // comment out when finished with testing
        //distributed = false;
    }

     /**
     * @dev Sends all contract's balance to the refund_destination
     *      Can be executed only after
     *      1. Refund lock passed
     *      2. Distribution finished
     */
    //    function refund() refundLockPassed distributedStatus(true) public view {
    function refund() refundLockPassedOrDistributionIsOver public view {
        payable(refund_destination).transfer(0, false, 128);
    }
 }
