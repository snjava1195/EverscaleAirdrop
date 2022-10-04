import { Contract, Signer } from "locklift";
import { getRandomNonce } from "locklift/utils";
import { FactorySource } from "../build/factorySource";
const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');
let owner: Contract<FactorySource["Wallet"]>;
let user: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let root: Contract<FactorySource["TokenRoot"]>;

let distributer: Contract<FactorySource["Tip31Distributer"]>;

//Script used for continuation in case of interrupted distribution

const main = async () => {

 const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba.csv',
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
  		"Tip31Airdrop", // name of your contract
  		"0:f70cc625b94e205298e67c4814598683adc6fa4941f8b37273f1b2a0bc8d7780",
		);
	console.log(`Airdrop: ${airdrop.address}`);
	
	//address of airdrop's caller
	owner = accountsFactory.getAccount(
		"0:82b691ef4e8e2bd754c76e167bb09bd0125a9e80979ced10b33d43d45f2d874c", 
		signer.publicKey
		);
  	console.log(`Owner: ${owner.address}`);
  	
  	user = accountsFactory.getAccount(
		"0:df51d306b3e672c5f20bb3861d9c398484ed7041bb247a58e640f0e5a7a7e8b8", 
		signer.publicKey
		);
  	console.log(`User: ${user.address}`);
  	
  	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	console.log(`Token root: ${root.address}`);
  	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(100));
  	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));

	//array of chunks (99 recipient per chunk)
	const chunkAddresses = chunk(addresses, 2);
	console.log(chunkAddresses);
	
	//array of chunk amounts
	const chunkAmounts = chunk(amounts, 2);
	console.log(chunkAmounts);
	
	//array of already deployed distributers
	const deployedArray = await airdrop.methods.getDistributers({}).call();
    	console.log(deployedArray.value0.length);
    		
 
  

    	let counter = deployedArray.value0.length;
    	
	
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
  		await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(2.1),
  	},
  		airdrop =>
  			airdrop.methods.multiTransfer({
  			recipients: chunkAddresses[counter][1],
            		amounts: chunkAmounts[counter][1], 
            		totalAmount: totalAmount}),
  		);
    				
    		const deployers = await airdrop.methods.getDistributers({}).call();
  		counter = deployers.value0.length;
  		console.log(counter);
  	
  	}
 	//logs the addresses of all the distributer addresses after the distribution is done successfully
  	const distributedContracts = await airdrop.methods.getDistributers({}).call();
    	console.log(`Distributed contracts: ${distributedContracts.value0}`);
    	
    	const refund = await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(2.1),
  	},
  		airdrop =>
  			airdrop.methods.refund({}),
  		);
  	console.log(refund);
 
}
  	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
