pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
//pragma AbiHeader time;
pragma AbiHeader pubkey;

import "ITokenRoot.sol";
import 'ITokenWallet.sol';

contract Tip31Distributer {
	
	address _tokenRootAddr;
	address walletAddress;
	
	constructor(address tokenRootAddr, address[] recipients, uint128[] amounts, address remainingGasTo, TvmCell _empty) public
	{
		require(recipients.length > 0 && recipients.length <= 100, 1002, "The number of 			recipients error!");
        	require(recipients.length == amounts.length, 1003, "The number of recipients must 			equal to the number of amounts!");
        	tvm.accept();
		_tokenRootAddr = tokenRootAddr;
		setUpTokenWallet();
		require(walletAddress.value != 0, 1001, "Wallet address error!");
        	
        	for (uint128 i = 0; i < recipients.length; i++) {
            		address recipient = recipients[i];
            		uint128 amount = amounts[i];
            	//	ITokenWallet(walletAddress).transfer{value: transferGas, flag: 0}(amount, 				recipient, 0.5 ever, remainingGasTo, false, _empty);
        	}
		
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
}
