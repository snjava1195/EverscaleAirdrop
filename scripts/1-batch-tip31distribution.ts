import { Contract, Signer } from "locklift";
import { getRandomNonce } from "locklift/utils";
import { FactorySource } from "../build/factorySource";
const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;

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
  		"0:40fae6229f3c1ff3323beaf8b1d2f1aebc6e17eb65d3452d49c41b33011489df",
		);
	console.log(`Airdrop: ${airdrop.address}`);
	
	//address of airdrop's caller
	owner = accountsFactory.getAccount(
		"0:8601bfa1367da512bd6ce892940b009b8966b0c175c02163e2f76750c8ef82ba", 
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
	const deployedArray = await airdrop.methods.getDistributers({}).call();
    	console.log(deployedArray.value0.length);
    		
 
  

    	let counter = deployedArray.value0.length;
    	
    	//sends gas to the airdrop
	//await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(10050));
	await owner.runTarget({
  		contract: root,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		root =>
    			root.methods.mint({ 
    				amount: locklift.utils.toNano(10000), 
    				recipient: airdrop.address, 
    				deployWalletValue: locklift.utils.toNano(1), 
    				remainingGasTo: airdrop.address, 
    				notify: false, 
    				payload: '', 
    				}),
    		);
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
  			recipients: chunkAddresses[i][1],
            		amounts: chunkAmounts[i][1], 
            		totalAmount: totAmount}),
  		);
    				
    		const deployers = await airdrop.methods.getDistributers({}).call();
  		counter = deployers.value0.length;
  		console.log(counter);
  	
  	}
 	//logs the addresses of all the distributer addresses after the distribution is done successfully
  	const distributedContracts = await airdrop.methods.getDistributers({}).call();
    	console.log(`Distributed contracts: ${distributedContracts.value0}`);
 
}
  	
main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
