import { Contract, Signer } from "locklift";
import { getRandomNonce } from "locklift/utils";
import { FactorySource } from "../build/factorySource";
const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["Airdrop"]>;


//Script used for continuation in case of interrupted distribution

const main = async () => {

 const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'data.csv',
        }
    ]);



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

	let records;

    	records = parse(fs.readFileSync(response.data));
	const signer = (await locklift.keystore.getSigner("0"))!;
  	let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   	const _randomNonce = locklift.utils.getRandomNonce();
   	
   	//address of interrupted airdrop (not enough gas...)
   	airdrop = await locklift.factory.getDeployedContract(
  		"Airdrop", // name of your contract
  		"0:931dc9da8562eda5f4259840d6b8141490cfe10fd13eee643dd4bca8c583e054",
		);
	console.log(`Airdrop: ${airdrop.address}`);
	
	//address of airdrop's caller
	owner = accountsFactory.getAccount(
		"0:13e596cafe2e092fddeea4f04bbd91feaac83e4f282b48fb7c76bc45f5c187cd", 
		signer.publicKey
		);
  	console.log(`Owner: ${owner.address}`);
  	
  	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));

	//array of chunks (99 recipient per chunk)
	const chunkAddresses = chunk(addresses, 99);
	console.log(chunkAddresses);
	
	//array of chunk amounts
	const chunkAmounts = chunk(amounts, 99);
	console.log(chunkAmounts);
	
	//array of already deployed distributers
	const deployedArray = await airdrop.methods.batches({}).call();
    	console.log(deployedArray.batches);
    		
 
  

    	let counter = deployedArray.batches*1;
    	
    	//sends gas to the airdrop
	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(10050));
	
	//if there are less distributers in the array than the number of chunks, start the continuation while the number gets even
	while(chunkAddresses.length>counter)
  	{
  		//calculates amount for deploy of distributer in order to successfully finish the distribution 
      		let totalAmount=0;
 		const amountsArray = chunkAmounts[counter][1];
 		for(let i=0;i<amountsArray.length;i++)
 		{
 			totalAmount+=amountsArray[i];
 		}
 		
 		//calls distribute
  		const result = await owner.runTarget({
      					contract: airdrop,
    					value: locklift.utils.toNano(3),
    					publicKey: signer.publicKey,
    					},
    				airdrop =>
    					airdrop.methods.distribute2({
    						     _addresses: chunkAddresses[counter][1], 							     _amounts: chunkAmounts[counter][1], 
    						     _wid: 0,
    						     _totalAmount:totalAmount
    						     }),
    				);  
    				
    		const deployers = await airdrop.methods.getDeployedContracts({}).call();
  		counter = deployers.value0.length;
  		console.log(counter);
  	
  	}
 	//logs the addresses of all the distributer addresses after the distribution is done successfully
  	const distributedContracts = await airdrop.methods.getDeployedContracts({}).call();
    	console.log(`Distributed contracts: ${distributedContracts.value0}`);
 
}
  	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
