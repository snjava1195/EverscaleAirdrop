pragma ton-solidity >= 0.57.0;

pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "TokenWalletBurnableByRootBase.sol";
import "TokenWalletBurnableBase.sol";
import "TokenWalletDestroyableBase.sol";

import "TokenErrors.sol";
import "TokenGas.sol";
import "TokenMsgFlag.sol";
import "IVersioned.sol";


/*
    @title Fungible token wallet contract
*/
contract TokenWallet is
    TokenWalletBurnableBase,
    TokenWalletBurnableByRootBase,
    TokenWalletDestroyableBase
{

    /*
        @notice Creates new token wallet
        @dev All the parameters are specified as initial data
    */
    constructor() public {
        require(tvm.pubkey() == 0, TokenErrors.NON_ZERO_PUBLIC_KEY);
        require(owner_.value != 0, TokenErrors.WRONG_WALLET_OWNER);
    }

    function supportsInterface(bytes4 interfaceID) override external view responsible returns (bool) {
        return { value: 0, flag: TokenMsgFlag.REMAINING_GAS, bounce: false } (
            interfaceID == bytes4(0x3204ec29) ||    // SID
            interfaceID == bytes4(0x4f479fa3) ||    // TIP3TokenWallet
            interfaceID == bytes4(0x2a4ac43e) ||    // TokenWallet
            interfaceID == bytes4(0x562548ad) ||    // BurnableTokenWallet
            interfaceID == bytes4(0x0c2ff20d) ||    // BurnableByRootTokenWallet
            interfaceID == bytes4(0x0f0258aa)       // Destroyable
        );
    }

    function _targetBalance() override internal pure returns (uint128) {
        return TokenGas.TARGET_WALLET_BALANCE;
    }

    function _buildWalletInitData(address walletOwner) override internal view returns (TvmCell) {
        return tvm.buildStateInit({
            contr: TokenWallet,
            varInit: {
                root_: root_,
                owner_: walletOwner
            },
            pubkey: 0,
            code: tvm.code()
        });
    }

    function _deployWallet(TvmCell initData, uint128 deployWalletValue, address)
        override
        internal
        view
        returns (address)
    {
        address wallet = new TokenWallet {
            stateInit: initData,
            value: deployWalletValue,
            wid: address(this).wid,
            flag: TokenMsgFlag.SENDER_PAYS_FEES
        }();
        return wallet;
    }
}
