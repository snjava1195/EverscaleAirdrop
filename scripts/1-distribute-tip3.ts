import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
let distributer: Contract<FactorySource["Tip31Distributer"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;

async function main() {
	const _randomNonce = locklift.utils.getRandomNonce();
	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
	signer = (await locklift.keystore.getSigner("0"))!;
	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	console.log(`Token root: ${root.address}`);
	owner = 		accountFactory.getAccount("0:82b691ef4e8e2bd754c76e167bb09bd0125a9e80979ced10b33d43d45f2d874c", signer.publicKey);
  	console.log(`Owner: ${owner.address}`);
  	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	
	const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(3),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  	user = account;
    	user.publicKey = signer.publicKey;
   // owner.afterRun = afterRun;
    	user.name = 'Regular user';
  	console.log(`User: ${user.address}`);
  	console.log(`Owner's public key: ${user.publicKey}`);
    	
    	 await locklift.giver.sendTo(user.address, locklift.utils.toNano(100));
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	//console.log(codeDistributer);
  	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: user.address,
            tokenRootAddr: root.address,
           // recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"],
           // amounts: [100000000],
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: codeDistributer.code
            
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
    
    
    	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(100));
    
    console.log(`Airdrop address: ${airdrop.address}`);
    
    const key = await airdrop.methods.getPubKey({}).call();
    console.log(`Airdrop public key ${key}`);
    await locklift.giver.sendTo(owner.address, locklift.utils.toNano(100));
    	await owner.runTarget({
  		contract: root,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		root =>
    			root.methods.mint({ 
    				amount: locklift.utils.toNano(1000), 
    				recipient: airdrop.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: airdrop.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);
    		
  	const totAmount = locklift.utils.toNano(10);
  		await user.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.multiTransfer({recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"],
            amounts: [1000000000], totalAmount: totAmount}),
  		);
  	
  	const details = await airdrop.methods.getDetails({}).call();
  	const distributed = await airdrop.methods.getDistributers({}).call();
    	console.log(`Airdrop details: ${details}`);
    	console.log(`Deployed distributers: ${distributed}`);
    	
    	const callback = await user.runTarget(
 	{
 		contract: airdrop,
 		value: locklift.utils.toNano(2.1),
 	},   	
 	airdrop =>
 		airdrop.methods.triggerDistributer({}),
 	);
 	//console.log(callback);
 	const distDetails = await airdrop.methods.getDistributerAddress({}).call();
 	console.log(`Neke adrese: ${distDetails}`);
    	const getClbck = await airdrop.methods.getClbck({}).call();
    	console.log(`Distributer details: ${getClbck}`);
    	
    	distributer = await locklift.factory.getDeployedContract(
  	"Tip31Distributer", // name of your contract
  	distributed.value0[0]
	);
	console.log(`Token root: ${distributer.address}`);
	//const isDistributed = await distributer.methods.isCallback({}).call();
	//console.log(isDistributed);
  	const ownerTokenWalletAddress = await root.methods.walletOf({answerId: 4, walletOwner: distributed.value0[0]}).call();
  		console.log(`User's token wallet: ${ownerTokenWalletAddress.value0}`);
  		const ownerTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress.value0);
  		//ownerTokenWallet.address = ownerTokenWalletAddress.value0;
  		const balanceWallet = await ownerTokenWallet.methods.balance({answerId:0}).call();
  		console.log(`Distributers balance: ${balanceWallet.value0}`);
  		const ownerWallet = await ownerTokenWallet.methods.owner({answerId: 0}).call();
  		console.log(ownerWallet);
  		const disPubKey = await distributer.methods.getPublicKey({}).call();
  		console.log(disPubKey);
  	/*const transfer = await user.runTarget(
 	{
 		contract: distributer,
 		value: locklift.utils.toNano(2.1),
 	},   	
 	distributer =>
 		distributer.methods.transfer({}),
 	);
 	
 	console.log(transfer);*/
 	const balanceWallet2 = await ownerTokenWallet.methods.balance({answerId:0}).call();
  		console.log(balanceWallet2.value0);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });

