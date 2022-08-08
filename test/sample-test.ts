import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";
import { bignumber } from "chai-bignumber";
let sample: Contract<FactorySource["Sample"]>;
let airdropCon: Contract<FactorySource["Airdrop"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
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
  	
	owner = accountFactory.getAccount("0:4c36e2e4ab9d775e885ccd154657ee376851ade9dcab5b4f0406bf7126c9f433", signer.publicKey);
  //  logger.log(`Owner: ${owner.address}`);
  console.log(`Owner: ${owner.address}`);
  console.log(`Owner's public key: ${owner.publicKey}`);
    });

    it("Get root", async function () {
      
        root = await locklift.factory.getDeployedContract(
  "TokenRoot", // name of your contract
  "0:b1ed038c07d92522924b87de7866a2eabc36e27cc76a2a3b41ddbb97368c4289",
);
	console.log(`Token root: ${root.address}`);
      //expect(await locklift.provider.getBalance(sample.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Get airdrop", async function () {
    
    airdrop = await locklift.factory.getDeployedContract("Airdrop", "0:01933cca65ad5699a23d622b5e97117a16a008e44408c5bbe398c69bfb7431a0");
	console.log(`Airdrop: ${airdrop.address}`);
    });

  
  it('Check airdrop details', async function () {
  	console.log(`Sample deployed at: ${airdrop.address}`);
  	const details = await airdrop.methods.getDetails({}).call();
  	console.log(`Details token: ${details._token.toString()}, token wallet: ${details._token_wallet.toString()}, transferred count: ${details._transferred_count.toString()}`);
  	expect(details._token).to.be.equal(root.address, "Wrong token");
  	expect(details._token_wallet).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");	expect(details._token).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");
  	});
  	
  	
  it('Fill airdrop with tokens', async function () {
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
  	
  	});
  

  
 });
