import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";

const prompts = require('prompts');
const _ = require('underscore');
const fs  = require("fs");
const { parse } = require('csv-parse/lib/sync');
const {load} = require('csv-load-sync');

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
	const addresses = records.map(i => i[0]);
	const amounts = records.map(i => parseInt(i[1], 10));

	//array of chunks (99 recipient per chunk)
	const chunkAddresses = chunk(addresses, 2);
	console.log(chunkAddresses);
	
	//array of chunk amounts
	const chunkAmounts = chunk(amounts, 2);
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
	
	/*********************Get root owner***********************/
	
	owner = 				accountFactory.getAccount("0:82b691ef4e8e2bd754c76e167bb09bd0125a9e80979ced10b33d43d45f2d874c", signer.publicKey);
  	console.log(`Owner: ${owner.address}`);
  	
	/*********************User deploy***************************/
	
	const {account} = await accountFactory.deployNewAccount({
  		value: locklift.utils.toNano(3),
  		publicKey: signer.publicKey,
  		initParams: {
  			_randomNonce: locklift.utils.getRandomNonce(),
  		},
  		constructorParams: {},
  		});
  	user = account;
    	user.publicKey = signer.publicKey;
    	user.name = 'Regular user';
    	
    	console.log(`User: ${user.address}`);
    	
    	await locklift.giver.sendTo(user.address, locklift.utils.toNano(100));
    	 
  	const codeDistributer = locklift.factory.getContractArtifacts("Tip31Distributer");
  	
  	/*********************Deploy airdrop***********************/
  	const { contract: airdrop, tx } = await locklift.factory.deployContract({
        contract: "Tip31Airdrop",
        constructorParams: {
            senderAddr: user.address,
            tokenRootAddr: root.address,
        },
        initParams: {
            _randomNonce,
            tip31distributerCode: codeDistributer.code
            
        },
        publicKey: signer.publicKey,
        value: locklift.utils.toNano(10),
   	});
   	
   	await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(100));
    
    	console.log("Airdrop address:");
    	console.log(airdrop.address);
    	
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });


