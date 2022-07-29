pragma ever-solidity >= 0.59.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "EverAirdrop.sol";

contract EverAirdropFactory
{	
	uint public m_deployedNumber = 0;

	constructor() public {
		require(tvm.pubkey() != 0 && tvm.pubkey() == msg.pubkey(), 1001);
        	tvm.accept();
    	}
    	
    	
    	//Function that actually does the EverAirdrop contract deployment
    	//params:
    	//	_airDropCode: decoded EverAirdrop.tvc value
    	//	_refund_destination: Address where all the evers from deployed EverAirdrop contract will be transferred (used in refund() method of EverAirdrop, usualy _refund_destination is the address of the airdrop user
    	//	_addresses: list of addresses used for airdrop
    	//	_amounts: list of amounts for airdrop, it's length should be equal to addresses list length
    	//	refund_lock_duration_end: desired time (in ms) for which evers in the EverAirdrop contract will be locked before they are transferred to _refund_destination
    	//returns: 
    	//	address of deployed contract
    	function deploy(TvmCell _airDropCode, string[] _msgOutputs, address _refund_destination, address[] _addresses, uint128[] _amounts, uint256 _refund_lock_duration_end) external returns(address) {
       	 tvm.accept();
      		uint id = m_deployedNumber;
		uint n = 10;
     		address _everAirdrop = new EverAirdrop {
           		code: _airDropCode,
            		value: 1 ever,
            		pubkey: 0,
            		varInit: 
            		{
            			m_id: id,
				m_creator: address(this)
            		}
        }(_msgOutputs,_refund_destination,_addresses,_amounts,_refund_lock_duration_end, n);
        ++m_deployedNumber;
        
        return _everAirdrop;
    }

	//Function used for transferring contract gas to the gasTo address
	//params:
	//	gasTo: address where contract's gas will be transferred
    function withdrawGas(address gasTo) external onlyOwner {
        tvm.accept();
        gasTo.transfer({value: 0, flag: 128});
    }

	//if the message sender's address is the same as the contract's address (contract is calling itself), function can be triggered  
    modifier onlyOwner {
        require(tvm.pubkey() != 0 && tvm.pubkey() == msg.pubkey(), 1001, "Only the owner can operate!");
        tvm.accept();
        _;
    }
    	
    		
}
