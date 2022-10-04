import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const {load} = require('csv-load-sync');
const {use} = require("chai");

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const {setupAirdrop} = require('./utils');
const { parse } = require('csv-parse/lib/sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["EverAirdrop"]>;



const main = async () => {
	
    	const response = await prompts([
        			{
            				type: 'text',
            				name: 'data',
            				message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            				initial: 'data.csv',
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

	const chunkAddresses = chunk(addresses, 99);
	console.log(chunkAddresses);
	const chunkAmounts = chunk(amounts, 99);
	console.log(chunkAmounts);
      	
	
	
	const codeDistributer = locklift.factory.getContractArtifacts("Distributer");
   	
    	[owner, airdrop] = await setupAirdrop('Airdrop', 2000, codeDistributer.code)
    	
      	console.log(`Airdrop deployed at: ${airdrop.address.toString()}`);
      	const code = await airdrop.methods.buildAirdropCode({ownerAddress: airdrop.address}).call();
    		
    	console.log(`Airdrop code: ${code.value0}`);

      	console.log("Distribute tokens:");
      
      	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(2500));
        await locklift.giver.sendTo(owner.address, locklift.utils.toNano(10000));
     
         
 	for(let i=0; i<chunkAddresses.length; i++)
 	{
 		let totalAmount=0;
 		const amountsArray = chunkAmounts[i][1];
 		for(let i=0;i<amountsArray.length;i++)
 		{
 			totalAmount+=amountsArray[i];
 		}
 		
 		console.log(totalAmount);
      		const result = await owner.runTarget({
      					contract: airdrop,
    					value: locklift.utils.toNano(3),
    					publicKey: signer.publicKey,
    					},
    					airdrop =>
    						airdrop.methods.distribute({
    							_addresses: chunkAddresses[i][1], 								_amounts: chunkAmounts[i][1], 
    							_wid: 0,
    							_totalAmount: totalAmount}),
    				);  
            
    		console.log(result);
    	}
    	    	
        const deployedContracts = await airdrop.methods.getDeployedContracts({}).call();
    	console.log(`Deployed contracts: ${deployedContracts.value0}`);
           const distributedContracts = await airdrop.methods.getDistributedContracts({}).call();
    	console.log(`Distribution is done contracts: ${distributedContracts.value0}`);
}
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
