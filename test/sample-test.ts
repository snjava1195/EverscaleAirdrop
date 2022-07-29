import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { WalletCode } from "../build/Wallet.code";

let sample: Contract<FactorySource["Sample"]>;
let airdropCon: Contract<FactorySource["Airdrop"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let tokenRootContr: Contract<FactorySource["TokenRoot"]>;
let walletCode: WalletCode;
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;

const start_timestamp = Math.floor(Date.now() / 1000);
const claim_period_in_seconds = 60;
const claim_periods_amount = 3;
const amount = locklift.utils.toNano(1000);

const {
  expect,
  sleep,
  setupAirdrop,
} = require('./utils');

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

    it("Deploy contract", async function () {
      const INIT_STATE = 0;
      const { contract } = await locklift.factory.deployContract({
        contract: "Sample",
        publicKey: signer.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {
          _state: INIT_STATE,
        },
        value: locklift.utils.toNano(2),
      });
      sample = contract;

      expect(await locklift.provider.getBalance(sample.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Interact with contract", async function () {
      const NEW_STATE = 1;

      await sample.methods.setState({ _state: NEW_STATE }).sendExternal({ publicKey: signer.publicKey });

      const response = await sample.methods.getDetails({}).call();

      expect(Number(response._state)).to.be.equal(NEW_STATE, "Wrong state");
    });
    
    it("Load contract factory", async function () {
      const sampleWalletData = await locklift.factory.getContractArtifacts("TokenWallet");

      expect(sampleWalletData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleWalletData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleWalletData.tvc).not.to.equal(undefined, "tvc should be available");
    });
    
    it("Load contract factory", async function () {
      const sampleRootData = await locklift.factory.getContractArtifacts("TokenRoot");

      expect(sampleRootData.code).not.to.equal(undefined, "Code should be available");
      expect(sampleRootData.abi).not.to.equal(undefined, "ABI should be available");
      expect(sampleRootData.tvc).not.to.equal(undefined, "tvc should be available");
    });
    
    it('Deploy airdrop', async function () {
    [owner, root, airdrop] = await setupAirdrop(
        start_timestamp,
        claim_period_in_seconds,
        claim_periods_amount
    );
    
    airdropCon = airdrop;
  });
  
  it('Check airdrop details', async function () {
  	console.log(`Sample deployed at: ${airdrop.address}`);
  	//const details = await airdrop.methods.getDetails().call();
  	//expect(root.address).to.equal(details._token, "Wrong token");
  	//expect(details._token_wallet).not.to.equal("0:0000000000000000000000000000000000000000000000000000000000000000", "Wrong token wallet");
  	});
  	
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
  });
});
