import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";
import { bignumber } from "chai-bignumber";
let sample: Contract<FactorySource["Sample"]>;
let airdropCon: Contract<FactorySource["Airdrop"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let me: Contract<FactorySource["Wallet"]>;
let tokenRootContr: Contract<FactorySource["TokenRoot"]>;
let walletCode: WalletCode;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
const start_timestamp = Math.floor(Date.now() / 1000);
const claim_period_in_seconds = 60;
const claim_periods_amount = 3;
const amount = locklift.utils.toNano(1000);
const chai = require('chai');
chai.use(require('chai-bignumber')());

const {
  expect,
  sleep,
 // setupAirdrop,
} = require('./utils');
const _randomNonce = locklift.utils.getRandomNonce();
describe("Test Sample contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
  });
  describe("Contracts", async function () {
  this.timeout(20000000);
  const reward_per_period = locklift.utils.toNano(10);
  
    it("Load contract factory", async function () {
      const sampleData = await locklift.factory.getContractArtifacts("Sample");

      expect(sampleData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleData.tvc).not.to.equal(undefined, "tvc should be available");
    });
    
    it("Get owner", async function() {
    	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  	
	owner = accountFactory.getAccount("0:0fe889529e8dcedcfc2f47cf7506a71969ce6d214f0d16a836056eb207a4d30e", signer.publicKey);
  //  logger.log(`Owner: ${owner.address}`);
  console.log(`Owner: ${owner.address}`);
  console.log(`Owner's public key: ${owner.publicKey}`);
    });

    it("Get root", async function () {
      
        root = await locklift.factory.getDeployedContract(
  "TokenRoot", // name of your contract
  "0:4051585e305472626e7be7ded98df090c2be411109d1481896e3b9a7b560beba",
);
	console.log(`Token root: ${root.address}`);
      //expect(await locklift.provider.getBalance(sample.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Get airdrop", async function () {
    
    airdrop = await locklift.factory.getDeployedContract("Tip31Airdrop", "0:8e639cfa6c9bd5121cbaa5f306245eac8468b97737328feaebf4ec024482c6cf");
	console.log(`Airdrop: ${airdrop.address}`);
    });

  
  /*it('Check airdrop details', async function () {
  	console.log(`Sample deployed at: ${airdrop.address}`);
  	const details = await airdrop.methods.getDetails({}).call();
  	console.log(`Details token: ${details._token.toString()}, token wallet: ${details._token_wallet.toString()}, transferred count: ${details._transferred_count.toString()}`);
  	expect(details._token).to.be.equal(root.address, "Wrong token");
  	expect(details._token_wallet).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");	expect(details._token).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");
  	});*/
  	
  	
  it('Fill airdrop with tokens', async function () {
  const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  me = accountFactory.getAccount("0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", "31bef135705c120185b04b700105c6814eb8e3264c0202f071e36755e0a1fd1a");
  	await owner.runTarget({
  		contract: root,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		root =>
    			root.methods.mint({ 
    				amount: amount, 
    				recipient: me.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: me.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);
    		expect(await root.methods.totalSupply({ answerId: 1 }).call()).not.to.equal(0, 'Wrong total supply');
  	});
  
 
    	it("Deploy user", async function() {
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
  console.log(`User: ${user.address}`);
  console.log(`Owner's public key: ${user.publicKey}`);
    });
    
  });
  
  describe('Airdrop tokens', async function() {
    	
  	it('Multitransfer', async function (){
  	await locklift.giver.sendTo(owner.address, 20000000000);
  	await locklift.giver.sendTo(user.address, 20000000000);
  		await user.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.multiTransfer({}),
  		);
  		
  		const ownerTokenWalletAddress = await root.methods.walletOf({answerId: 4, walletOwner: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"}).call();
  		console.log(`User's token wallet: ${ownerTokenWalletAddress.value0}`);
  		const ownerTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", ownerTokenWalletAddress.value0);
  		ownerTokenWallet.adress = ownerTokenWalletAddress.value0;
  		const balanceWallet = await ownerTokenWallet.methods.balance({answerId:0}).call().value0;
  		const totalAmount = balanceWallet+100000000;
  		//expect((await ownerTokenWallet.methods.balance({answerId:0}).call()).value0).to.be.bignumber.equal(totalAmount, 'Wrong balance');
  		//const balance = await ownerTokenWallet.methods.balance({answerId:0}).call();
  		//expect(await balance.value0).not.to.equal(reward_per_period, 'Wrong balance');
  		});
  	//});
  	
  	});
  

  
 });
