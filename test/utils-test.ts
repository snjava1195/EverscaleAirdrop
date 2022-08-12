import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { bignumber } from "chai-bignumber";
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let rootOwner: Contract<FactorySource["Wallet"]>;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;
const amount = locklift.utils.toNano(1000);
const chai = require('chai');
chai.use(require('chai-bignumber')());

const {
  expect,
  setupAirdrop
} = require('./utils');
const _randomNonce = locklift.utils.getRandomNonce();
describe("Test TIP3.1 airdrop", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
  });
  describe("Contracts", async function () {
  this.timeout(20000000);
 

  const reward_per_period = locklift.utils.toNano(10);
 
    
    	it(`Deploy airdrop`, async function () {
	[owner, airdrop] = await setupAirdrop(
	);
	
	console.log(`Owner address: ${owner.address}`);
	console.log(`Airdrop address: ${airdrop.address}`);
	});

    it("Get root owner", async function() {
    	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
  	
	rootOwner = accountFactory.getAccount("0:4c36e2e4ab9d775e885ccd154657ee376851ade9dcab5b4f0406bf7126c9f433", signer.publicKey);
  console.log(`Owner: ${rootOwner.address}`);
  console.log(`Owner's public key: ${rootOwner.publicKey}`);
    });

    it("Get root", async function () {
      
        root = await locklift.factory.getDeployedContract(
  "TokenRoot", // name of your contract
  "0:b1ed038c07d92522924b87de7866a2eabc36e27cc76a2a3b41ddbb97368c4289",
  //"0:4051585e305472626e7be7ded98df090c2be411109d1481896e3b9a7b560beba",
);
	console.log(`Token root: ${root.address}`);
    });


  
  it('Check airdrop details', async function () {
  	console.log(`Airdrop deployed at: ${airdrop.address}`);
  	const details = await airdrop.methods.getDetails({}).call();
  	console.log(`Details token: ${details._token.toString()}, token wallet: ${details._token_wallet.toString()}, transferred count: ${details._transferred_count.toString()}`);
  	expect(details._token).to.be.equal(root.address, "Wrong token");
  	expect(details._token_wallet).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");	expect(details._token).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");
  	});
  	
  	
  it('Fill airdrop with tokens', async function () {
  
  	await rootOwner.runTarget({
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

    
  });
  
  describe('Airdrop tokens', async function() {
    	
  	it('Multitransfer', async function (){
  	const airdropWallet = await root.methods.walletOf({answerId: 4, walletOwner: airdrop.address}).call();
  		console.log(`User's token wallet: ${airdropWallet.value0}`);
  		const airdropTokenWallet = await locklift.factory.getDeployedContract("TokenWallet", airdropWallet.value0);
  		airdropTokenWallet.adress = airdropWallet.value0;
  		const balanceWalletBefore = await airdropTokenWallet.methods.balance({answerId:0}).call().value0;
  	await locklift.giver.sendTo(owner.address, 20000000000);
  	//await locklift.giver.sendTo(rootOwner.address, 20000000000);
  		await owner.runTarget(
  		{
  			contract: airdrop,
    			value: locklift.utils.toNano(2.1),
  		},
  		airdrop =>
  			airdrop.methods.multiTransfer({}),
  		);
  		
  		expect((await airdropTokenWallet.methods.balance({answerId:0}).call()).value0).not.to.equal(balanceWalletBefore, 'Wrong balance');
  		});
  	});
  

  
 });
