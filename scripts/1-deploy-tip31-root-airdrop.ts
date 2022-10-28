import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let tokenRootContr: Contract<FactorySource["TokenRoot"]>;
let walletCode: WalletCode;
let root: Contract<FactorySource["TokenRoot"]>;
let user: Contract<FactorySource["Wallet"]>;
const amount = locklift.utils.toNano(1000);

const _randomNonce = locklift.utils.getRandomNonce();
const main = async () => {
  
    signer = (await locklift.keystore.getSigner("0"))!;
        

    	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  	const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(3),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  		owner = account;
    owner.publicKey = signer.publicKey;
    owner.name = 'Airdrop owner';
  console.log(`Owner: ${owner.address}`);
  console.log(`Owner's public key: ${owner.publicKey}`);
    
await locklift.giver.sendTo(owner.address, locklift.utils.toNano(100));
 
   const sampleRootData = await locklift.factory.getContractArtifacts("TokenWallet");
  const { contract } = await locklift.factory.deployContract({
  		contract: "TokenRoot",
  		constructorParams: {
            initialSupplyTo: owner.address,
            initialSupply: 0,
            deployWalletValue: locklift.utils.toNano(1),
            mintDisabled: false,
            burnByRootDisabled: true,
            burnPaused: false,
            remainingGasTo: "0:0000000000000000000000000000000000000000000000000000000000000000",
        },
        initParams: {
            deployer_: "0:0000000000000000000000000000000000000000000000000000000000000000",
            randomNonce_: locklift.utils.getRandomNonce(),
            rootOwner_: owner.address,
            name_: 'Airdrop token',
            symbol_: 'AIRDROP_12',
            decimals_: 15,
            walletCode_: sampleRootData.code,
        },
        publicKey: owner.publicKey,
        value: locklift.utils.toNano(2),
        });
        
        root = contract;

	console.log(`Token root: ${root.address}`);
    await locklift.giver.sendTo(root.address, locklift.utils.toNano(100));
	/*const distributerCode = await locklift.factory.getContractArtifacts("Tip31Distributer");	
    	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
            tokenRootAddr: root.address,
            _refund_lock_duration: 2000,
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: distributerCode.code
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
	console.log(`Airdrop: ${airdrop.address}`);
	}*/
	
	const accountTransaction = await owner.runTarget(
    		{
    		contract: root,
    		value: locklift.utils.toNano(5),
    		},
    		root =>
    			root.methods.mint({ 
    				amount: 5000000000000000000, 
    				recipient: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: owner.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);
	}
	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
    
    
   
  
 
