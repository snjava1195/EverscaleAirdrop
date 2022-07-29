import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
//import  ora  from 'ora';
const {
    afterRun,
} = require('./../test/utils');
const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');


//const ora = require('ora');
const isValidTonAddress = (address) => /^(?:-1|0):[0-9a-fA-F]{64}$/.test(address);
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;
let airdropCon: Contract<FactorySource["Airdrop"]>;

let airdropDeployer: Contract<FactorySource["EverAirdropFactory"]>;

let root: Contract<FactorySource["TokenRoot"]>;
const main = async () => {
    const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba.csv',
        },
        /*{
            type: 'text',
            name: 'owner',
            message: 'Airdrop owner',
            validate: value => isValidTonAddress(value) ? true : 'Invalid address'
        },
        {
            type: 'text',
            name: 'token',
            message: 'Token root',
            validate: value => isValidTonAddress(value) ? true : 'Invalid address'
        },*/
        {
            type: 'number',
            name: 'start_timestamp',
            initial: Math.floor(Date.now() / 1000),
            message: 'Airdrop start timestamp',
        },
        {
            type: 'number',
            name: 'claim_period_in_seconds',
            initial: 60 * 60 * 24 * 30,
            message: 'Claim period duration in seconds (default = 1 month)'
        },
        {
            type: 'number',
            name: 'claim_periods_amount',
            initial: 12,
            message: 'Claim periods amount'
        }
    ]);

    // Read csv
    const data = load(response.data);
    const chunks = _.chunk(data, 50);
  const signer = (await locklift.keystore.getSigner("0"))!;
  const _randomNonce = locklift.utils.getRandomNonce();
  //const [keyPair] = await locklift.keystore.keyPair();
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
  //const spinner = ora('Deploying initial owner').start();
  let records;
    records = parse(fs.readFileSync(response.data));
  const { account } = await accountsFactory.deployNewAccount({
        constructorParams: {},
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value:locklift.utils.toNano(1)
    });
    owner = account;
    
    console.log(`Account deployed at: ${owner.address.toString()}`);
    
    owner.name = 'Airdrop owner';
    
    const { contract } = await locklift.factory.deployContract({
        contract: "EverAirdropFactory",
        publicKey: signer.publicKey,
        initParams: {
        _randomNonce,
        },
        constructorParams: {},
        value: locklift.utils.toNano(10),
    });
    	airdropDeployer = contract;
      console.log(`Airdrop factory deployed at: ${airdropDeployer.address.toString()}`);
      //await airdropDeployer.methods.distribute({}).sendExternal( {publicKey: signer.publicKey });
  
  	
	//console.log(`Airdrop returned: ${get_airdrop.address.toString()}`);
      const airdropCode = locklift.factory.getContractArtifacts("EverAirdrop");
    //  const deployAirdrop = await airdropDeployer.methods.deploy({_airDropCode: airdropCode.code, _refund_destination: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63", _addresses: records.map(i => i[0]), _amounts: records.map(i => parseInt(i[1], 10)), refund_lock_duration_end: 2000}).call();
 //  console.log(`Airdrop deployed at: ${deployAirdrop.value0.toString()}`);
   
   
   
   //await deployAirdrop.methods.distribute.call();
  
  const sampleRootData = await locklift.factory.getContractArtifacts("TokenRoot");
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
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(2),
        });
        
        root = contract;
  console.log(`Root deployed at: ${root.address.toString()}`);
  
  //const Airdrop = await locklift.factory.getContract('Airdrop');
    const { contract } = await locklift.factory.deployContract({
        contract: "Airdrop",
        constructorParams: {
            _token: root.address,
            _owner: owner.address,
            _start_timestamp: response.start_timestamp,
            _claim_period_in_seconds: response.claim_period_in_seconds,
            _claim_periods_amount: response.claim_periods_amount
        },
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
    });
    airdropCon = contract;
    console.log(`Airdrop deployed at: ${airdropCon.address.toString()}`);
    
 /*   for (const [i, chunk] of chunks.entries()){
    	const _users = chunk.map((i) => i.user);
    	const _rewards_per_period = chunk.map((i) => i.reward);
    	}*/
    	
    	const _amount = locklift.utils.toNano(500);
    	const accountTransaction = await owner.runTarget(
    		{
    		contract: root,
    		value: locklift.utils.toNano(5),
    		},
    		root =>
    			root.methods.mint({ 
    				amount: _amount, 
    				recipient: airdropCon.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: owner.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);
      
    	console.log("Amount minted");
    	
    	const airdropTokenWalletAddress = await airdropCon.methods.owner({}).call();
    	console.log(`Airdrop of: ${airdropTokenWalletAddress.owner.toString()}`);
    	const walletOfConst = await root.methods.walletOf({answerId: 4, walletOwner: airdropCon.address}).call();
    	
    	console.log(`Wallet of: ${walletOfConst.value0.toString()}`);
    	
    	const rootOfConst = await root.methods.rootOwner({answerId: 4}).call();
    	
    	console.log(`Root of: ${rootOfConst.value0.toString()}`);
    	
    	
    
    	await airdropCon.methods.setChunk({ _users: records.map(i => i[0]), _rewards_per_period: records.map(i => parseInt(i[1], 10)) }).sendExternal({ publicKey: owner.publicKey });
    	
    	console.log("Chunks set");
    	
    	await airdropCon.methods.transferOwnership({newOwner: "0:102cf118b6875d201a3011d5dc17a358ee4d4333ad7e167824515171ed8f6f63"}).sendExternal({ publicKey: owner.publicKey });
    	
    	const details = await airdropCon.methods.getDetails({}).call();
    	console.log(`Details token: ${details._token.toString()}, token wallet: ${details._token_wallet.toString()}, transferred count: ${details._transferred_count.toString()}`);
    	 
    	 await airdropCon.methods.multiTransfer({ recipients: records.map(i => i[0]), amounts: records.map(i => parseInt(i[1], 10)), remainingGasTo: owner.address }).sendExternal({ publicKey: owner.publicKey });
    	 
    	/*await owner.runTarget({
    		contract: airdropCon,
    		method: 'setChunk',
    		params: {
    			_users,
    			_rewards_per_period,
    		},
    		value: locklift.utils.toNano(2),
    	}); */
    
    //spinner.stop();
    
    //spinner.start(`Transferring ownership`);

    // Transfer ownership
  /*  await owner.runTarget({
        contract: airdropCon,
        method: 'transferOwnership',
        params: {
            newOwner: response.owner,
        }
    });*/

    //spinner.stop();
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
