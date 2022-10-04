import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";
let sample: Contract<FactorySource["Sample"]>;
let airdropCon: Contract<FactorySource["Tip31Airdrop"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let tokenRootContr: Contract<FactorySource["TokenRoot"]>;
let walletCode: WalletCode;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
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
            symbol_: 'AIRDROP',
            decimals_: 9,
            walletCode_: sampleRootData.code,
        },
        publicKey: owner.publicKey,
        value: locklift.utils.toNano(2),
        });
        
        root = contract;

	console.log(`Token root: ${root.address}`);
    
	const distributerCode = await locklift.factory.getContractArtifacts("Tip31Distributer");	
    	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
            tokenRootAddr: root.address,
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: distributerCode.code
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
	console.log(`Airdrop: ${airdrop.address}`);
	}
	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
    
    
   
  
 
