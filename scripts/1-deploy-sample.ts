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
let airdropCon: Contract<FactorySource["Tip31Airdrop"]>;

let root: Contract<FactorySource["TokenRoot"]>;
const main = async () => {
    const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'data.csv',
        }
    ]);

    // Read csv
    const data = load(response.data);
    const chunks = _.chunk(data, 50);
  const signer = (await locklift.keystore.getSigner("0"))!;
  const _randomNonce = locklift.utils.getRandomNonce();
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
  let records;
    records = parse(fs.readFileSync(response.data));
  const { account } = await accountsFactory.deployNewAccount({
        constructorParams: {},
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value:locklift.utils.toNano(10)
    });
    owner = account;
    owner.publicKey = signer.publicKey;
    console.log(`Account deployed at: ${owner.address.toString()}`);
    
    owner.name = 'Airdrop owner';
    
   
  
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
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: owner.address,
            tokenRootAddr: root.address,
            recipients: records.map(i => i[0]),
            amounts: records.map(i => parseInt(i[1], 10)),
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
    	

 
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
