import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";
import { bignumber } from "chai-bignumber";
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
const chai = require('chai');
chai.use(require('chai-bignumber')());

/*const {
  expect,
  sleep,
 // setupAirdrop,
} = require('./utils');*/
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
   // owner.afterRun = afterRun;
    owner.name = 'Airdrop owner';
   // owner = accountFactory.getAccount("0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", "31bef135705c120185b04b700105c6814eb8e3264c0202f071e36755e0a1fd1a");
	//owner = accountFactory.getAccount("0:4c36e2e4ab9d775e885ccd154657ee376851ade9dcab5b4f0406bf7126c9f433", signer.publicKey);
  //  logger.log(`Owner: ${owner.address}`);
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
        //root = await locklift.factory.getDeployedContract(
  //"TokenRoot", // name of your contract
  //"0:b1ed038c07d92522924b87de7866a2eabc36e27cc76a2a3b41ddbb97368c4289",

	console.log(`Token root: ${root.address}`);
      //expect(await locklift.provider.getBalance(sample.address).then(balance => Number(balance))).to.be.above(0);
    

    	const { contract } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
            tokenRootAddr: root.address,
            recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"],
            amounts: [100000000],
        },
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
    airdrop = contract;
   // airdrop = await locklift.factory.getDeployedContract("Airdrop", "0:01933cca65ad5699a23d622b5e97117a16a008e44408c5bbe398c69bfb7431a0");
	console.log(`Airdrop: ${airdrop.address}`);
	}
	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
    
    
    /*it('Deploy airdrop', async function () {
    [owner, root, airdrop] = await setupAirdrop(
        start_timestamp,
        claim_period_in_seconds,
        claim_periods_amount
    );
    
    airdropCon = airdrop;
  });*/
  
  	
  /*it('Fill airdrop with tokens', async function () {
  	await owner.runTarget({
  		contract: root,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		root =>
    			root.methods.mint({ 
    				amount: amount, 
    				recipient: airdrop.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: airdrop.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);*/
    		
    		//await root.methods.mint({amount: amount, recipient: airdrop.address, deployWalletValue: locklift.utils.toNano(1), remainingGasTo: owner.address, notify: false, payload: ''}).sendExternal({ publicKey: owner.publicKey });
    		//const walletOfConst = await root.methods.walletOf({answerId: 4, walletOwner: airdrop.address}).call();
    		//console.log(`Airdrop wallet deployed at: ${walletOfConst.value0}`);

    		
    		//await locklift.giver.sendTo(walletOfConst.value0, amount);
  	
  
  /*it('Check airdrop token wallet was deployed and received tokens', async function() {
    	const airdropTokenWallet = await locklift.factory.getContractArtifacts("TokenWallet");
	const walletOfConst = await root.methods.walletOf({answerId: 4, walletOwner: airdrop.address}).call();
    const details = await airdrop.methods.getDetails({}).call();
	  airdropTokenWallet.address = walletOfConst.value0;
    console.log(`Set token wallet addr: ${airdropTokenWallet.address}`);
    const owner = await airdropTokenWallet.methods.owner({answerId: 0}).call();
    console.log(`Token wallet owner addr: ${owner.value0}`);
    await airdrop.runTarget(
    	{
    		contract: airdropTokenWallet,
    		value: locklift.utils.toNano(2),
    	},
    	airdropTokenWallet =>
    		airdropTokenWallet.methods.transferToWallet({
    			amount: 1000000000,
    			recipientTokenWallet: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63",
    			remainingGasTo: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63",
    			notify: false,
    			payload: '',
    		}),
    );
    
    expect(details._token_wallet)
        .not.to.equal(airdropTokenWallet.address, 'Wrong airdrop token wallet');
        
  
    });*/
    /*	it("Deploy user", async function() {
    	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
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
   // owner = accountFactory.getAccount("0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", "31bef135705c120185b04b700105c6814eb8e3264c0202f071e36755e0a1fd1a");

  //  logger.log(`Owner: ${owner.address}`);
  console.log(`User: ${user.address}`);
  console.log(`Owner's public key: ${user.publicKey}`);
    });*/
    
    
 /*   it('Set chunk', async function() {
    	await owner.runTarget({
  		contract: airdrop,
    		value: locklift.utils.toNano(1),
    		},
    		airdrop =>
    			airdrop.methods.setChunk({ 
    				_users: [user.address], 
    				_rewards_per_period: [reward_per_period], 
    				}),
    		);
    	
    	const userClaimable = await airdrop.methods.getCurrentClaimable({ user: user.address }).call();
    	
    	expect(userClaimable._amount).to.be.bignumber.equal(reward_per_period, 'Wrong owner claimable');
    	
    	console.log(`Amount claimable: ${userClaimable._amount}`);
    	console.log(`Last claimed period: ${userClaimable._last_claimed_period_id}`);
    	
    	expect(userClaimable._last_claimed_period_id).to.be.bignumber.equal(1, 'Wrong owner last claimed period');
    
    });
    
  
  
  describe('Claim tokens', async function() {
  
  	it('Claim tokens', async function() {
  	await locklift.giver.sendTo(user.address, 20000000000);
  		await user.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.claim({}),
  		);
  		});
  		
  		
  	it('Check tokens received', async function(){
  		const ownerTokenWalletAddress = await root.methods.walletOf({answerId: 4, walletOwner: user.address}).call();
  		console.log(`User's token wallet: ${ownerTokenWalletAddress.value0}`);
  		const ownerTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress.value0);
  		ownerTokenWallet.adress = ownerTokenWalletAddress.value0;
  		expect((await ownerTokenWallet.methods.balance({answerId:0}).call()).value0).to.be.bignumber.equal(10000000000, 'Wrong balance');
  		
  	});
  	
  	
  	it('Multitransfer', async function (){
  	//await locklift.giver.sendTo(owner.address, 20000000000);
  		await user.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.multiTransfer({
  				recipients: ["0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"],
  				amounts: [1000000000],
  				remainingGasTo: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63",
  			}),
  		);
  		
  		const ownerTokenWalletAddress = await root.methods.walletOf({answerId: 4, walletOwner: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"}).call();
  		console.log(`User's token wallet: ${ownerTokenWalletAddress.value0}`);
  		const ownerTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress.value0);
  		ownerTokenWallet.adress = ownerTokenWalletAddress.value0;
  		const balanceWallet = await ownerTokenWallet.methods.balance({answerId:0}).call().value0;
  		const totalAmount = balanceWallet+1000000000;
  		expect((await ownerTokenWallet.methods.balance({answerId:0}).call()).value0).to.be.bignumber.equal(totalAmount, 'Wrong balance');
  		//const balance = await ownerTokenWallet.methods.balance({answerId:0}).call();
  		//expect(await balance.value0).not.to.equal(reward_per_period, 'Wrong balance');
  		});
  	//});
  	
  	});*/
  
 /* it("Setup owner", async () => {
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
  		
  });
  
  it("Deploy token root", async() => {
  const sampleRootData = await locklift.factory.getContractArtifacts("TokenRoot");
  	const { tokenRoot } = await locklift.factory.deployContract({
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
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(2),
        });
        tokenRootContr = tokenRoot;
          console.log(`Sample deployed at: ${owner.address.toString()}`);
//          console.log(`Sample deployed at: ${tokenRootContr.address.toString()}`);
    });*/
    
    
    
  
  //it('Check airdrop details', async function () {
  //  const details = await airdrop.methods.getDetails({}).call();

  //  expect(root.address)
  //      .to.be.equal(details._token, 'Wrong token');
  //  expect(details._token_wallet)
  //      .to.not.be.equal(locklift.utils.zeroAddress, 'Wrong token wallet');
  //  expect(details._periods)
  //      .to.have.lengthOf(claim_periods_amount, 'Wrong periods amount');
  //});
  
 
