import { Contract, Signer } from "locklift";
import { getRandomNonce } from "locklift/utils";
import { FactorySource } from "../build/factorySource";
const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');
let owner: Contract<FactorySource["Wallet"]>;
let airdrop: Contract<FactorySource["EverAirdrop"]>;

let distributer: Contract<FactorySource["Distributer"]>;

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
const signer = (await locklift.keystore.getSigner("0"))!;
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   const _randomNonce = locklift.utils.getRandomNonce();
   airdrop = await locklift.factory.getDeployedContract(
  	"EverAirdrop", // name of your contract
  	"0:dad130f535ee461cbed851a6d4075c7669fec2aad14e9fced52f2718ec61e180",
	);
	console.log(`Airdrop: ${airdrop.address}`);
	owner = 		accountsFactory.getAccount("0:7d4931bef7ff0977410e5174a1d006a1557e599705d51ca1eeab479f9478a0cd", signer.publicKey);
  	console.log(`Owner: ${owner.address}`);
  	const nonceNr = await airdrop.methods.getNonce({}).call();
  	console.log(nonceNr);
  	
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

const chunkAddresses = chunk(addresses, 90);
console.log(chunkAddresses);
const chunkAmounts = chunk(amounts, 90);
console.log(chunkAmounts);
const distributersArray = await airdrop.methods.getDeployedContracts({}).call();
    		console.log(distributersArray.value0.length);
    		let counter = distributersArray.value0.length;
await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(10050));
  	while(chunkAddresses.length>counter)
  	{
  		 console.log("Usao");
      
  			const result = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(3),
    		publicKey: signer.publicKey,
    		//callback: onDistribute,
    		},
    		airdrop =>
    			airdrop.methods.distribute({_addresses: chunkAddresses[counter][1], _amounts: chunkAmounts[counter][1], _wid: 0,_totalAmount:locklift.utils.toNano(1000)}),
    		);  
    	//	console.log(result);
    		const distributers = await airdrop.methods.getDeployedContracts({}).call();
    		console.log(distributers.value0.length);
  		const prc = await airdrop.methods.getNonce({}).call();
  		counter = distributers.value0.length;
  		console.log(counter);
  		console.log(prc);
  	}
  	
  	const distributedContracts = await airdrop.methods.getDeployedContracts({}).call();
    	console.log(`Distributed contracts: ${distributedContracts.value0}`);
  	//const getDistributorBalanceArr = await airdrop.methods.getDistributorBalanceArr({}).call();
      //console.log(getDistributorBalanceArr);

	const getEverdropBalance = await airdrop.methods.getEverdropBalance({}).call();
     console.log(getEverdropBalance);
  	//if(nonceNr<0)
  //   console.log(nonceNr);

     
     	//const distributorAddr = await airdrop.methods.getDistributorAddress({_nonce: i}).call();
     	//console.log(distributorAddr.value0);
     	//distributer = await locklift.factory.getDeployedContract(
  	//"Distributer", // name of your contract
  	//distributorAddr.value0,
	//);
	
	
	
     	
     }
  	
   


main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
