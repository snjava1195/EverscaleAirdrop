
//function used for Ever Airdrop deploy
const setupAirdrop = async(contract_notes, refund_lock_duration, _distributerCode) =>
{
	let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
	const _randomNonce = locklift.utils.getRandomNonce();
	const signer = (await locklift.keystore.getSigner("0"))!;
	
	//deploys future contract's owner
	const { account } = await accountsFactory.deployNewAccount({
								constructorParams: {},
								initParams: {
		    							_randomNonce,
								},
								publicKey: signer.publicKey,
								value:locklift.utils.toNano(2)
	    						});
    	const owner = account;
    	owner.publicKey = signer.publicKey;
    	console.log(`Account deployed at ${owner.address}`);
	
	//deploys EverAirdrop contract
	const codeDistributer = locklift.factory.getContractArtifacts("Distributer");
	const codeAirdrop = locklift.factory.getContractArtifacts("EverAirdrop");
   	const { contract, tx } = await locklift.factory.deployContract({
        				contract: "EverAirdrop",
        				publicKey: signer.publicKey,
        				initParams: {
        					_randomNonce: locklift.utils.getRandomNonce(),
						distributerCode: _distributerCode
        				},
        				constructorParams: {
             						_contract_notes: contract_notes,
             						_refund_destination: owner.address,
             						_refund_lock_duration: refund_lock_duration,
             						_newCode: codeAirdrop.code,
        				},
        				value: locklift.utils.toNano(2),
    					});
    	const airdrop = contract;
    	console.log(`Airdrop deployed at: ${airdrop.address.toString()}`);
    	//returns owner and airdrop contracts deployed
    	return [owner, airdrop];

};

//Function used for deploying TIP3.1 airdrop contract
const setupTip31Airdrop = async(_distributerCode, refund_lock_duration) =>
{
	let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
	const _randomNonce = locklift.utils.getRandomNonce();
	const signer = (await locklift.keystore.getSigner("0"))!;
	
	//deploys owner of the future airdrop
	const { account } = await accountsFactory.deployNewAccount({
								constructorParams: {},
								initParams: {
		    							_randomNonce,
								},
								publicKey: signer.publicKey,
								value:locklift.utils.toNano(1)
	    						});
    	const user = account;
    	user.publicKey = signer.publicKey;
    	console.log(`Account deployed at ${user.address}`);
    	
    	//gets already deployed token root contract 
    	const root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	console.log(`Token root: ${root.address}`);
	
	//Deploys Tip31Airdrop contract
	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: user.address,
            tokenRootAddr: root.address,
            _refund_lock_duration: refund_lock_duration
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: _distributerCode
            
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(2),
   	});
   	
   	//topup airdrop with some evers in order to ensure enough gas for transactions
   	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(10));
    
    	console.log("Airdrop address:");
    	console.log(airdrop.address);
    	
    	return [user, airdrop];
}

module.exports = {
	setupAirdrop,
	setupTip31Airdrop

}
