import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');
const {setupTip31Airdrop} = require('./utils');
let root: Contract<FactorySource["TokenRoot"]>;
let airdrop: Contract<FactorySource["Tip31Airdrop"]>;
let user: Contract<FactorySource["Wallet"]>;
let signer: Signer;
let owner: Contract<FactorySource["Wallet"]>;


async function main() {
	const response = await prompts([
        {
            type: 'text',
            name: 'data',
            message: 'Name of the csv file with airdrop addresses and amount, should be placed in the repo root',
            initial: 'proba2.csv',
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
	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));

	//array of chunks (99 recipient per chunk)
	const chunkAddresses = chunk(addresses, 99);
	console.log(chunkAddresses);
	
	//array of chunk amounts
	const chunkAmounts = chunk(amounts, 99);
	console.log(chunkAmounts);
	const _randomNonce = locklift.utils.getRandomNonce();
	const accountFactory = locklift.factory.getAccountsFactory("Wallet");
	signer = (await locklift.keystore.getSigner("0"))!;
	
	/*********************Get root***********************/
	root = await locklift.factory.getDeployedContract(
  	"TokenRoot", // name of your contract
  	"0:a50def2df0f7f531b82b7ffec7baf8e7ce4279605726b94927c9ee6ded09f5c2",
	);
	console.log(`Token root: ${root.address}`);
	
	/*********************Get airdrop owner***********************/
	
    	
    	user = 				accountFactory.getAccount("0:58bae4e1c0deccd12e08d49d98c853efb99fa918e3f04f0cad470ce4d789beb7", signer.publicKey);
  	console.log(`User: ${user.address}`);
    	
    	await locklift.giver.sendTo(user.address, locklift.utils.toNano(100));
    	 
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
   	
   		airdrop = await locklift.factory.getDeployedContract(
  	"Airdrop", // name of your contract
  	"0:da527bd7b3a7ddd46f2df69aadf240adb816168ce3ce0b4e8938091b90873ba6",
	);
	console.log(`Airdrop address: ${airdrop.address}`);
    
    
    	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(100));
    
    	console.log("Airdrop address:");
    	console.log(airdrop.address);
    	//const root_value = await airdrop.methods.getTokenRootAddrValue({}).call();
    	//console.log(root_value);
    	//const hashCode = await airdrop.methods.getCodeHash({}).call();
    	//console.log(hashCode);
    		
    	/*********************Start distribution***********************/	
    	for(let i=0; i<chunkAddresses.length; i++)
 	{
 		let totAmount=0;
 		const amountsArray = chunkAmounts[i][1];
 		for(let i=0;i<amountsArray.length;i++)
 		{
 			totAmount+=amountsArray[i];
 		}
 		console.log(totAmount);
 		const initialBalance = /*(amountsArray.length*0.1)+*/1.5;
 		console.log(initialBalance); 	
  	await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(initialBalance),
  	},
  		airdrop =>
  			airdrop.methods.distribute({
  			_addresses: chunkAddresses[i][1],
            		_amounts: chunkAmounts[i][1], 
            		_wid: 0,
            		_totalAmount: totAmount}),
  		);
  		
  		}
  	
  	//const details = await airdrop.methods.getDetails({}).call();
  	const distributed = await airdrop.methods.getDeployedContracts({}).call();
    	//console.log("Airdrop details:");
    	//console.log(details);
    	console.log("Deployed distributers: ");
    	console.log(distributed);
    	
    	/*if(distributed.value0.length==chunkAmounts.length)
    	{
  	const refund = await user.runTarget(
  	{
  		contract: airdrop,
    		value: locklift.utils.toNano(2.1),
  	},
  		airdrop =>
  			airdrop.methods.refund({}),
  		);
  	console.log(refund);
  	}*/
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });

