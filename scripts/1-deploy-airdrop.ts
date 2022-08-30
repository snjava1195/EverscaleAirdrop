import { Contract, Signer } from "locklift";
import { getRandomNonce } from "locklift/utils";
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
let nonce=0;

const main = async () => {
const signer = (await locklift.keystore.getSigner("0"))!;
  let accountsFactory = await locklift.factory.getAccountsFactory("Wallet");
   const _randomNonce = locklift.utils.getRandomNonce();
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

const chunkAddresses = chunk(addresses, 90);
console.log(chunkAddresses);
const chunkAmounts = chunk(amounts, 90);
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
	
	
	const codeDistributer = locklift.factory.getContractArtifacts("Distributer");
   const { contract, tx } = await locklift.factory.deployContract({
        contract: "EverAirdrop",
        publicKey: signer.publicKey,
        initParams: {
        	_randomNonce: locklift.utils.getRandomNonce(),
            distributerCode: codeDistributer.code
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
      
      await locklift.giver.sendTo(airdrop.address, locklift.utils.toNano(2500));
        await locklift.giver.sendTo(owner.address, locklift.utils.toNano(10000));
     
         
 	for(let i=0; i<8; i++)
 	{
 

      const result = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(3),
    		publicKey: signer.publicKey,
    		//callback: onDistribute,
    		},
    		airdrop =>
    			airdrop.methods.distribute({_addresses: chunkAddresses[2][1], _amounts: chunkAmounts[2][1], _wid: 0,_totalAmount:locklift.utils.toNano(1000)}),
    		);  
         //   const distributedContracts = await airdrop.methods.getDistributorAddress({_nonce: nonce++}).call();
          
        //   console.log(distributedContracts);
        
    //	console.log(result);
    //	console.log(result.transaction.outMessages);
    	}
    	
    	const result2 = await owner.runTarget({
            contract: airdrop,
              value: locklift.utils.toNano(2),
              publicKey: signer.publicKey,
              },
              airdrop =>
                  airdrop.methods.distributerBalance({}),
              );
              
          console.log(result2);
    	
    		
    		 const result3 = await owner.runTarget({
      	contract: airdrop,
    		value: locklift.utils.toNano(2.2),
    		publicKey: signer.publicKey,
    		},
    		airdrop =>
    			airdrop.methods.getTestFunc({  
    				}),
    		);
  
      console.log(result3);
     // console.log(result2);*/
      const getTestCallBackArr = await airdrop.methods.getTestCallBackArr({}).call();
     console.log(getTestCallBackArr);
     
    //  const getAddress = await airdrop.methods.getAddr({}).call();
     // const amount = await airdrop.methods.getAmount({}).call();
   //   console.log(getAddress);

     //const getNonce = await airdrop.methods.getNonce({}).call();
   //   console.log(getNonce);
     // const refundLock = await airdrop.methods.getRefundLockDuration({}).call();
     // console.log(refundLock);


     
      
    
	   //const distributorBalance1 = await airdrop.methods.distributerBalance({}).sendExternal({publicKey: signer.publicKey});
     //console.log(distributorBalance1);

      const getDistributorBalanceArr = await airdrop.methods.getDistributorBalanceArr({}).call();
      console.log(getDistributorBalanceArr);

	const getEverdropBalance = await airdrop.methods.getEverdropBalance({}).call();
     console.log(getEverdropBalance);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
