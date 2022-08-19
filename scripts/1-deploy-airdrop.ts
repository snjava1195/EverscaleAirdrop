import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["EverAirdrop"]>;
let deployedAirdrop: Contract<FactorySource["EverAirdrop"]>;

let distributer: Contract<FactorySource["Distributer"]>;
	

const main = async () => {
const signer = (await locklift.keystore.getSigner("0"))!;
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   const _randomNonce = locklift.utils.getRandomNonce();
    const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba.csv',
        }
    ]);

let records;

    records = parse(fs.readFileSync(response.data));
    
const addresses = records.map(i => i[0]);
const amounts = records.map(i => parseInt(i[1], 10));


function chunk(array, chunkSize) { 
  // Create a plain object for housing our named properties: row1, row2, ...rowN
  let output=[];
  // Cache array.length
  let arrayLength = array.length;
  // Loop variables
  let arrayIndex = 0, chunkOrdinal = 1;
  // Loop over chunks
  while (arrayIndex < arrayLength) {
    // Use slice() to select a chunk. Note the incrementing operations.
    output.push([chunkOrdinal++, array.slice(arrayIndex, arrayIndex += chunkSize)]);
  }
  return output;
}

const chunkAddresses = chunk(addresses, 100);
console.log(chunkAddresses);
const chunkAmounts = chunk(amounts, 100);
console.log(chunkAmounts);
      const { account } = await accountsFactory.deployNewAccount({
        constructorParams: {},
        initParams: {
            _randomNonce,
        },
        publicKey: signer.publicKey,
        value:locklift.utils.toNano(5)
    });
    owner = account;
    owner.publicKey = signer.publicKey;
    console.log(`Account deployed at ${owner.address}`);
	
	
	
   const { contract, tx } = await locklift.factory.deployContract({
        contract: "EverAirdrop",
        publicKey: signer.publicKey,
        initParams: {
        	_randomNonce: locklift.utils.getRandomNonce()
        },
        constructorParams: {
             _contract_notes: 'Airdrop',
             _refund_destination: owner.address,
             _refund_lock_duration: 2000,
        },
        value: locklift.utils.toNano(10),
    });
    	airdrop = contract;
    	//console.log(airdrop);
    	//console.log(tx);
      console.log(`Airdrop deployed at: ${airdrop.address.toString()}`);
      

      console.log("Distribute tokens:");
      
      await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(1000));
        await locklift.giver.sendTo(owner.address, locklift.utils.toNano(100));
      const codeAirdrop = locklift.factory.getContractArtifacts("Distributer");
 
 	for(let i=0; i<3; i++)
 	{
 
      const result = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		//callback: onDistribute,
    		},
    		airdrop =>
    			airdrop.methods.distribute({_addresses: addresses, _amounts: amounts, _wid: 0, _code: codeAirdrop.code }),
    		);
    		
    	console.log(result);
    	}
    	
    	/* const result2 = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		airdrop =>
    			airdrop.methods.sendOverload({_addresses: addresses, _amounts: amounts }),
    		);
    		
    	console.log(result2);*/
    	
    		/*
    		 const result2 = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		airdrop =>
    			airdrop.methods.sendOverload({  
    				}),
    		);
  
      console.log(result);
     // console.log(result2);*/
      const numberOfDeployed = await airdrop.methods.getDeployedContracts({}).call();
      console.log(numberOfDeployed);
     
      const status = await airdrop.methods.getStatus({}).call();
      console.log(status);
      
     // const amount = await airdrop.methods.getAmount({}).call();
     // console.log(amount);
      
     // const refundLock = await airdrop.methods.getRefundLockDuration({}).call();
     // console.log(refundLock);
      
 //     const count = await airdrop.methods.getCount({}).call();
  //    console.log(count);
	
//	const distributed = await airdrop.methods.getDistributed({}).call();
//      console.log(distributed);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
