pragma ton-solidity >= 0.57.0;

pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "TokenWalletBase.sol";
import "ITokenRoot.sol";
import "IDestroyable.sol";
import "TokenErrors.sol";
import "TokenMsgFlag.sol";


abstract contract TokenWalletDestroyableBase is TokenWalletBase, IDestroyable {

    function destroy(address remainingGasTo) override external onlyOwner {
        require(balance_ == 0, TokenErrors.NON_EMPTY_BALANCE);
        remainingGasTo.transfer({
            value: 0,
            flag: TokenMsgFlag.ALL_NOT_RESERVED + TokenMsgFlag.DESTROY_IF_ZERO,
            bounce: false
        });
    }
}
