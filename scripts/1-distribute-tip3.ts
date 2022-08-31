import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;

async function main() {
	const _randomNonce = locklift.utils.getRandomNonce();
	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
	signer = (await locklift.keystore.getSigner("0"))!;
	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:ecfd3c8528627fb305f0325586500e1e72be529b5382651b4a9724f9d49aa53f",
	);
	console.log(`Token root: ${root.address}`);
	owner = 		accountFactory.getAccount("0:2710111b2a73768f0ad2b1cb4577caa9eb0ae80f686985dc2f1f7d37a14b5557", signer.publicKey);
  	console.log(`Owner: ${owner.address}`);
  	
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	console.log(codeDistributer);
  	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
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
    
    console.log(airdrop.address);
    
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
    	
    	
    	
  		await user.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.multiTransfer({recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"],
            amounts: [100000000]}),
  		);
  	
  	const details = await airdrop.methods.getDetails({}).call();
  	const distributed = await airdrop.methods.getDistributers({}).call();
    	console.log(details);
    	console.log(distributed);
    	
  
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });

